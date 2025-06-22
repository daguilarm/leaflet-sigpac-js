/**
 * Manages map layers and tile configurations
 */
export default class LayerManager {

  constructor(config, map) {
    this.config = config;
    this.map = map;
    this.#setupAttribution();
  }

  /**
   * Initialize base tile layer
   */
  initBaseLayer(options) {
    this.baseLayer = L.tileLayer(options.tileUrl, {
      maxZoom: options.maxZoom,
      minZoom: options.minZoom
    }).addTo(this.map);
  }

  /**
   * Initialize SIGPAC WMS layer
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
   * Setup layer control interface
   */
  setupLayerControl() {
    if (!this.baseLayer) return;
    
    L.control.layers(
      { 'Base Layer': this.baseLayer },
      { 'SIGPAC': this.sigpacLayer },
      { collapsed: false }
    ).addTo(this.map);
  }

  /**
   * Configure map attribution
   * @private
   */
  #setupAttribution() {
    const attributionControl = this.map.attributionControl;
    if (!attributionControl) return;
    
    if (this.config.hideLeafletAttribution) {
      attributionControl.setPrefix('');
    }
    
    if (this.config.defaultMapOptions.attribution) {
      attributionControl.addAttribution(
        this.config.defaultMapOptions.attribution
      );
    }
  }
}