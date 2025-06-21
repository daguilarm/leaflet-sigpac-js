import Logger from './Logger.js';
import SigpacService from './SigpacService.js';
import ConfigManager from './ConfigManager.js';
import LayerManager from './LayerManager.js';
import PopupManager from './PopupManager.js';
import EventManager from './EventManager.js';

export default class MapManager {
  constructor(userConfig = {}) {
    // Initialize configuration
    this.configManager = new ConfigManager(userConfig);
    this.config = this.configManager.getConfig();
    
    // Initialize services
    this.logger = new Logger(this.config.debug);
    this.sigpacService = new SigpacService(this.config, this.logger);
    
    // Core components
    this.map = null;
    this.layerManager = null;
    this.popupManager = null;
    this.eventManager = null;
  }
  
  init(mapElement, customOptions = {}) {
    if (typeof L === 'undefined') {
      this.logger.error('Leaflet not loaded');
      return;
    }
    
    // Merge options
    const options = { 
      ...this.config.defaultMapOptions, 
      ...customOptions 
    };
    
    // Initialize map
    this.map = L.map(mapElement, { attributionControl: false });
    L.control.attribution({ position: 'bottomright' }).addTo(this.map);
    this.map.setView(options.center, options.zoom);
    
    // Initialize managers
    this.layerManager = new LayerManager(this.config, this.map);
    this.popupManager = new PopupManager(this.map, this.config);
    this.eventManager = new EventManager(this.config, this.map.getContainer());
    
    // Setup layers and controls
    this.layerManager.initBaseLayer(options);
    this.layerManager.initSigpacLayer();
    this.layerManager.setupLayerControl();
    
    // Setup event handlers
    this.setupEventHandlers();
    
    this.logger.info('Leaflet map initialized', options);
    return this.map;
  }
  
  setupEventHandlers() {
    this.map.on('click', this.handleMapClick.bind(this));
    this.map.on('sigpac:featureSelected', (e) => {
      this.logger.info('Feature selected event', e.detail);
    });
  }
  
  async handleMapClick(e) {
    this.logger.debug('Map click detected', e.latlng);
    
    if (this.map.getZoom() < this.config.minZoomFeature) {
      this.logger.debug('Zoom level too low for features');
      this.popupManager.showErrorPopup(
        e.latlng, 
        `Zoom in to level ${this.config.minZoomFeature}+ to view SIGPAC parcels`
      );
      return;
    }
    
    // If the final display is a popup, show a loading indicator.
    // If it's a marker, we do nothing and wait silently, as requested.
    if (this.config.showAs === 'popup') {
      this.logger.debug('Showing loading popup');
      this.popupManager.showLoadingPopup(e.latlng);
    }
    
    try {
      this.logger.debug('Fetching SIGPAC data');
      const parcelaData = await this.sigpacService.fetchParcelaByCoordinates(e.latlng);
      
      // We have a response. First, close ANY popup that might be open (like the loading one).
      // This is the most robust way to clean the slate.
      this.map.closePopup();

      // Use a minimal timeout to let the browser process the popup closure
      // before we add a new element. This prevents UI race conditions.
      setTimeout(() => {
        if (parcelaData) {
          this.logger.debug('SIGPAC data received', parcelaData);
          this.logger.debug(`Showing as: ${this.config.showAs}`);
          this.popupManager.showParcelaInfo(parcelaData, e.latlng);
          this.eventManager.emitFeatureSelected(parcelaData, e.latlng);
          this.eventManager.emitLivewireEvent(parcelaData, e.latlng);
        } else {
          this.logger.debug('No SIGPAC data found');
          this.popupManager.showErrorPopup(
            e.latlng, 
            'No SIGPAC parcels found at this location'
          );
        }
      }, 10); // A tiny delay is enough to yield to the event loop.

    } catch (error) {
      // On error, also ensure all popups are closed before showing the error message.
      this.map.closePopup();
      this.logger.error('Error handling map click', error);
      this.handleFetchError(error, e.latlng);
    }
  }
  
  handleFetchError(error, latlng) {
    let errorMessage = 'Error fetching parcel data';
    
    if (error.message.includes('404')) errorMessage = 'Parcel not found in SIGPAC';
    else if (error.message.includes('400')) errorMessage = 'Invalid coordinates';
    else if (error.message.includes('500')) errorMessage = 'SIGPAC server error';
    
    this.popupManager.showErrorPopup(latlng, errorMessage);
    this.logger.error('Map click handling error', error);
  }
}