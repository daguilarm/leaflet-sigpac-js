/**
 * Handles layer management for the map
 */
export default class LayerManager {
  constructor(config, map) {
    this.config = config;
    this.map = map;
    this.baseLayer = null;
    this.sigpacLayer = null;
  }
  
  /**
   * Initializes base layer
   */
  initBaseLayer(options) {
    this.baseLayer = L.tileLayer(options.tileUrl, {
      maxZoom: options.maxZoom,
      minZoom: options.minZoom,
      attribution: options.attribution
    }).addTo(this.map);
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
    }).addTo(this.map);
  }
  
  /**
   * Sets up layer control
   */
  setupLayerControl() {
    if (!this.baseLayer) return;
    
    const baseLayers = { 'Base Layer': this.baseLayer };
    const overlays = { 'SIGPAC': this.sigpacLayer };
    
    L.control.layers(baseLayers, overlays, { collapsed: false }).addTo(this.map);
  }
}