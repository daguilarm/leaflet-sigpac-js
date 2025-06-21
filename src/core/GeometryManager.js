/**
 * Handles creation and management of various geometries (markers, polygons, etc.)
 */
export default class GeometryManager {
  constructor(map, config) {
    this.map = map;
    this.config = config;
    this.layers = []; // To keep track of all added geometries
    this.defaultIcon = L.icon({ 
      iconUrl: this.config.markerIconUrl, // Now configurable from config.js
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34]
    });
  }

  /**
   * Adds a marker to the map.
   * @param {L.LatLng | Array<number>} latlng - The coordinates for the marker.
   * @param {object} options - Options for the marker (e.g., title).
   * @returns {L.Marker} The created Leaflet marker.
   */
  addMarker(latlng, options = {}) {
    const markerOptions = {
      icon: this.defaultIcon,
      ...options
    };
    const marker = L.marker(latlng, markerOptions).addTo(this.map);
    this.layers.push(marker);
    return marker;
  }

  /**
   * Adds a WKT (Well-Known Text) geometry to the map.
   * @param {string} wktString - The WKT string.
   * @returns {L.Layer|null} The created Leaflet layer or null on error.
   */
  addWkt(wktString) {
    if (typeof Terraformer === 'undefined' || !Terraformer.WKT) {
      console.error('Terraformer WKT parser not found. Please include the library in your HTML.');
      return null;
    }
    const geoJson = Terraformer.WKT.parse(wktString);
    const layer = L.geoJSON(geoJson).addTo(this.map);
    this.layers.push(layer);
    return layer;
  }

  /**
   * Binds a popup to any layer.
   * @param {L.Layer} layer - The layer to bind the popup to.
   * @param {string|HTMLElement} content - The content of the popup.
   */
  bindPopup(layer, content) {
    if (layer && content) {
      layer.bindPopup(content);
    }
  }

  clearLayers() {
    this.layers.forEach(layer => this.map.removeLayer(layer));
    this.layers = [];
  }
}