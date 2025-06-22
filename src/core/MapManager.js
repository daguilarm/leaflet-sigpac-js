import EventEmitter from './EventEmitter.js';
import Logger from './LogManager.js';
import SigpacService from './SigpacService.js';
import ConfigManager from './ConfigManager.js';
import LayerManager from './LayerManager.js';
import PopupManager from './PopupManager.js';
import GeometryManager from './GeometryManager.js';
import EventManager from './EventManager.js';

/**
 * Core map management and coordination class
 */
export default class MapManager {

  constructor(userConfig = {}) {
    this.userConfig = userConfig;
    this.eventBus = new EventEmitter();
    //To cancel current request
    this.currentAbortController = null;
  }

  /**
   * Initialize map on target element
   */
  init(mapElement, customOptions = {}) {
    if (typeof L === 'undefined') {
      throw new Error('Leaflet not loaded');
    }

    // Initialize subsystems
    this.#initConfig();
    this.#initLogger();
    this.#initMap(mapElement, customOptions);
    this.#initSubsystems();
    this.#setupEventHandlers();

    this.logger.info('Leaflet map initialized');
    return this.map;
  }

  /** 
   * Cleanup resources to prevent memory leaks 
   */
  destroy() {
    // Cancel any pending requests
    if (this.currentAbortController) {
      this.currentAbortController.abort();
      this.currentAbortController = null;
    }

    // Clean event listeners
    this.eventBus.offAll();
    this.map.off();
    this.map.remove();
    
    // Release references
    this.subsystems = null;
    this.logger.debug('MapManager destroyed');
  }

  /**
   * Initialize configuration
   * @private
   */
  #initConfig() {
    this.configManager = new ConfigManager(this.userConfig);
    this.config = this.configManager.getConfig();
  }

  /**
   * Initialize logger
   * @private
   */
  #initLogger() {
    this.logger = new Logger(this.config.debug);
  }

  /**
   * Initialize Leaflet map
   * @private
   */
  #initMap(mapElement, customOptions) {
    const options = { 
      ...this.config.defaultMapOptions, 
      ...customOptions 
    };
    
    this.map = L.map(mapElement, { attributionControl: false });
    L.control.attribution({ position: 'bottomright' }).addTo(this.map);
    this.map.setView(options.center, options.zoom);
  }

  /**
   * Initialize subsystem managers
   * @private
   */
  #initSubsystems() {
    // Create GeometryManager first
    this.geometryManager = new GeometryManager(this.map, this.config);
    
    // Create the other managers
    this.layerManager = new LayerManager(this.config, this.map);
    this.popupManager = new PopupManager(
      this.map, 
      this.config, 
      this.geometryManager
    );
    this.eventManager = new EventManager(
      this.config, 
      this.map.getContainer(),
      this.eventBus
    );
    this.sigpacService = new SigpacService(this.config, this.logger);
    
    // Group subsystems
    this.subsystems = {
      geometryManager: this.geometryManager,
      layerManager: this.layerManager,
      popupManager: this.popupManager,
      eventManager: this.eventManager,
      sigpacService: this.sigpacService
    };
    
    // Configure layers
    this.layerManager.initBaseLayer(this.config.defaultMapOptions);
    this.layerManager.initSigpacLayer();
    
    // Add SIGPAC layer only if the user did not provide initial features
    if (!this.userConfig.hasOwnProperty('initialFeatures')) {
      this.map.addLayer(this.layerManager.sigpacLayer);
    }
    
    this.layerManager.setupLayerControl();
    this.#processInitialFeatures();
  }

  /**
   * Setup event handlers
   * @private
   */
  #setupEventHandlers() {
    if (this.config.clickEnabled === false) {
      this.logger.info('Map click disabled');
      return;
    }
    
    // Use debounce to prevent rapid clicks
    this.map.on('click', this.#debounce(
      this.handleMapClick.bind(this), 
      300
    ));
    
    // Listen to internal events
    this.eventBus.on('featureSelected', (data) => {
      this.logger.info('Feature selected', data);
    });
  }

  /**
   * Process initial features from config
   * @private
   */
  #processInitialFeatures() {
    if (Array.isArray(this.config.initialFeatures)) {
      this.config.initialFeatures.forEach(feature => {
        let layer;
        if (feature.type === 'marker' && feature.coordinates) {
          layer = this.geometryManager.addMarker(feature.coordinates);
        } else if (feature.type === 'wkt' && feature.data) {
          layer = this.geometryManager.addWkt(feature.data);
        }

        if (layer && feature.popupContent) {
          this.geometryManager.bindPopup(layer, feature.popupContent);
        }
      });
    }
  }

  /**
   * Handle map click events
   */
  async handleMapClick(e) {
    this.logger.debug('Map click detected', e.latlng);
    
    // Cancel previous request if it exists
    if (this.currentAbortController) {
      this.currentAbortController.abort();
    }
    
    // Create new controller for cancellation
    const abortController = new AbortController();
    this.currentAbortController = abortController;
    
    // Verify the zoom level
    if (this.map.getZoom() < this.config.minZoomFeature) {
      this.popupManager.showErrorPopup(
        e.latlng, 
        `Zoom in to level ${this.config.minZoomFeature}+ to view SIGPAC parcels`
      );
      return;
    }
    
    // Add temporary marker immediately
    const tempMarker = this.geometryManager.addMarker(e.latlng, {
      title: 'Cargando datos SIGPAC...',
      icon: this.config.markerLoadingIcon
    });
    
    // For popup mode: show loading
    if (this.config.interactionMode === 'popup') {
      this.popupManager.showLoadingPopup(e.latlng);
    }
    
    try {
      // Get the SIGPAC data
      const parcelaData = await this.sigpacService.fetchParcelaByCoordinates(
        e.latlng,
        { signal: abortController.signal }
      );
      
      // Delete temporary marker (if the request was not canceled)
      if (!abortController.signal.aborted) {
        this.geometryManager.removeLayer(tempMarker);
      }
      
      // Process the data
      if (parcelaData) {
        this.popupManager.showParcelaInfo(parcelaData, e.latlng);
        this.eventManager.emitFeatureSelected(parcelaData, e.latlng);
        this.eventManager.emitLivewireEvent(parcelaData, e.latlng);
      } else {
        this.popupManager.showErrorPopup(
          e.latlng, 
          'No SIGPAC parcels found at this location'
        );
      }
    } catch (error) {
      // Do not handle errors if it was canceled
      if (error.name === 'AbortError') {
        this.logger.debug('Fetch aborted');
        return;
      }
      
      this.logger.error('Error handling map click', error);
      
      // Update time stamp to error state
      tempMarker.setIcon(this.config.markerErrorIcon);
      tempMarker.bindPopup(`<div class="sigpac-error">${error.message || 'Error fetching data'}</div>`);
      
      // Show error popup (if we are in popup mode)
      if (this.config.interactionMode === 'popup') {
        this.popupManager.showErrorPopup(e.latlng, 'Error fetching parcel data');
      }
    }
  }

  /**
   * Debounce function for events
   * @private
   */
  #debounce(fn, delay) {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn.apply(this, args), delay);
    };
  }
}