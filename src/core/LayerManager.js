/**
 * Handles layer management for the map
 */
export default class LayerManager {
  constructor(config, map) {
    this.config = config;
    this.map = map;
    this.baseLayer = null;
    this.sigpacLayer = null;
    this.setupAttribution(config.defaultMapOptions);
  }
  
  /**
   * Initializes base layer
   */
  initBaseLayer(options) {
    this.baseLayer = L.tileLayer(options.tileUrl, {
      maxZoom: options.maxZoom,
      minZoom: options.minZoom
    }).addTo(this.map);

    // Configure attribution
    this.setupAttribution(options);
  }
  
  /**
   * Initializes SIGPAC layer
   */
  initSigpacLayer() {
    this.sigpacLayer = L.tileLayer.wms(this.config.sigpacWmsUrl, {
      layers: this.config.sigpacLayerName,
      format: 'image/png',
      transparent: true,
      version: '1.3.0',
      maxZoom: this.config.defaultMapOptions.maxZoom,
      minZoom: this.config.minZoomFeature,
      tileSize: 512,
      opacity: 0.7
    });
  }
  
  /**
   * Configure layer control
   */
  setupLayerControl() {
    if (!this.baseLayer) return;
    
    const baseLayers = { 'Base Layer': this.baseLayer };
    const overlays = { 'SIGPAC': this.sigpacLayer };
    
    L.control.layers(baseLayers, overlays, { collapsed: false }).addTo(this.map);
  }

  /**
   * Configure attribution
   */
  setupAttribution(options) {
    const attributionControl = this.map.attributionControl;
    
    if (!attributionControl) return;
    
    if (options.hideLeafletAttribution === true) {
      attributionControl.setPrefix('');
    }
    
    if (options.attribution) {
      attributionControl.addAttribution(options.attribution);
    }
  }
}