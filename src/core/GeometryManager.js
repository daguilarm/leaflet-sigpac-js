import ScriptLoader from '../utils/scriptLoader.js';

/**
 * Manages geometric elements with memory optimization.
 */
export default class GeometryManager {
  
  /**
   * Initializes the GeometryManager with the map and configuration.
   */
  constructor(map, config) {
    this.map = map;
    this.config = config;
    this.layerStore = new Map(); // Changed to Map instead of WeakMap
    this.defaultIcon = L.icon({ 
      iconUrl: this.config.markerIconUrl,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34]
    });
    // Reference for the WKT parser (will be loaded on demand)
    this.wktParser = null;
  }

  /**
   * Adds a marker to the map.
   */
  addMarker(latlng, options = {}) {
    const marker = L.marker(latlng, {
      icon: options.icon || this.defaultIcon,
      ...options
    });
    
    this.#addToStore(marker, 'marker');
    return marker;
  }

  /**
   * Parses and adds WKT geometry to the map.
   */ 
  async addWkt(wktString) {
    try {
      // Load Terraformer only if necessary
      if (!this.wktParser) {
        this.wktParser = await this.#loadWktParser();
      }
      
      const geoJson = this.wktParser.parse(wktString);
      const layer = L.geoJSON(geoJson);
      this.#addToStore(layer, 'wkt');
      return layer;
    } catch (error) {
      console.error('WKT parse error:', error);
      return null;
    }
  }

  /**
   * Binds a popup to a given layer.
   */ 
  bindPopup(layer, content) {
    if (layer && content) {
      layer.bindPopup(content);
    }
  }

  /**
   * Removes a specific layer from the map and the store.
   */ 
  removeLayer(layer) {
    if (layer && this.layerStore.has(layer)) {
      this.map.removeLayer(layer);
      this.layerStore.delete(layer);
    }
  }

  /** 
   * Clears all managed layers from the map and the store.
   */
  clearLayers() {
    this.layerStore.forEach((_, layer) => {
      this.map.removeLayer(layer);
    });
    this.layerStore.clear();
  }

  /**
   * Loads the WKT parser dynamically.
   * @private
   */
  async #loadWktParser() {
    try {
      if (typeof window === 'undefined' || !window.Terraformer) {
        await ScriptLoader.loadAll([
          this.config.externalLibs.terraformer,
          this.config.externalLibs.terraformerWkt
        ]);
      }

      if (typeof window === 'undefined' || !window.Terraformer) {
        throw new Error('Failed to load WKT parser after script loading');
      }

      this.wktParser = window.Terraformer.WKT;
    } catch (error) {
      console.error('Error loading WKT parser:', error);
      throw error;
    }
  }

  // async #loadWktParser() {
  //   const terraformerConfig = {
  //     url: this.config.externalLibs.terraformer.url,
  //     integrity: this.config.externalLibs.terraformer.integrity,
  //     checkLoaded: () => typeof window.Terraformer !== 'undefined'
  //   };
  //   const wktParserConfig = {
  //     url: this.config.externalLibs.terraformerWkt.url,
  //     integrity: this.config.externalLibs.terraformerWkt.integrity,
  //     checkLoaded: () => typeof window.Terraformer?.WKT !== 'undefined'
  //   };
  //   const libsToLoad = [];
    
  //   if (!terraformerConfig.checkLoaded()) {
  //     libsToLoad.push(terraformerConfig);
  //   }
    
  //   if (!wktParserConfig.checkLoaded()) {
  //     libsToLoad.push(wktParserConfig);
  //   }
  //   if (libsToLoad.length > 0) {
  //     await ScriptLoader.loadAll(libsToLoad);
  //   }
  //   if (typeof window.Terraformer?.WKT === 'undefined') {
  //     throw new Error('Failed to load WKT parser after script loading');
  //   }
  //   return window.Terraformer.WKT;
  // }

  /**
   * Adds a layer to the store with metadata and to the map.
   * @private
   */ 
  #addToStore(layer, type) {
    this.layerStore.set(layer, { type, addedAt: Date.now() });
    layer.addTo(this.map);
  }
}