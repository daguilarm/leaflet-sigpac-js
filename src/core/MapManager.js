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
    this.map = L.map(mapElement);
    this.map.setView(options.center, options.zoom);
    
    // Initialize managers
    this.layerManager = new LayerManager(this.config, this.map);
    this.popupManager = new PopupManager(this.map);
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
    if (this.map.getZoom() < this.config.minZoomFeature) {
      this.popupManager.showErrorPopup(
        e.latlng, 
        `Zoom in to level ${this.config.minZoomFeature}+ to view SIGPAC parcels`
      );
      return;
    }
    
    const loadingPopup = this.popupManager.showLoadingPopup(e.latlng);
    
    try {
      const parcelaData = await this.sigpacService.fetchParcelaByCoordinates(e.latlng);
      
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
      this.handleFetchError(error, e.latlng);
    } finally {
      this.map.closePopup(loadingPopup);
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