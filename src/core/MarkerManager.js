/**
 * Handles creation and management of markers
 */
export default class MarkerManager {
  constructor(map) {
    this.map = map;
    this.markers = [];
    // Crear ícono por defecto
    this.defaultIcon = L.icon({
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34]
    });
  }
  
  /**
   * Creates a marker with parcel information
   */
  createMarker(parcelaData, latlng) {
    const marker = L.marker(latlng, {
      title: `Parcela SIGPAC: ${parcelaData.poligono}-${parcelaData.parcela}`,
      icon: this.defaultIcon 
    }).addTo(this.map);
    
    // Almacenar referencia y datos
    marker.parcelaData = parcelaData;
    this.markers.push(marker);
    
    return marker;
  }
  
  /**
   * Clears all markers from the map
   */
  clearMarkers() {
    this.markers.forEach(marker => this.map.removeLayer(marker));
    this.markers = [];
  }
  
  /**
   * Binds a popup to a marker
   */
  bindPopupToMarker(marker, content) {
    marker.bindPopup(content);
  }
}