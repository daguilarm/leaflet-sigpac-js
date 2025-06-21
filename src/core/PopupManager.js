/**
 * Handles creation and display of popups
 */
export default class PopupManager {
  constructor(map, config, geometryManager) { // geometryManager added here
    this.map = map;
    this.config = config;
    this.geometryManager = geometryManager;
  }
  
  /**
   * Shows loading popup
   */
  showLoadingPopup(latlng) {
    // This method should only create the popup. MapManager controls the flow.
    return L.popup()
      .setLatLng(latlng)
      .setContent('<div class="sigpac-loading">Loading SIGPAC data...</div>')
      .openOn(this.map);
  }
  
  /**
   * Shows error popup
   */
  showErrorPopup(latlng, message) {
    // Close any other popups before showing an error, as this is a terminal state.
    this.map.closePopup();
    return L.popup()
      .setLatLng(latlng)
      .setContent(`<div class="sigpac-error">${message}</div>`)
      .openOn(this.map);
  }
  
  /**
   * Shows parcel information based on configuration
   */
  showParcelaInfo(parcelaData, latlng) {
    // The MapManager is responsible for closing previous popups.
    // This method just displays the final result.
    this.geometryManager.clearLayers(); // Clear previous geometries (markers, polygons, etc.)

    const content = this.buildPopupContent(parcelaData);

    if (this.config.interactionMode === 'marker') {
      const marker = this.geometryManager.addMarker(latlng, { // Use geometryManager
        title: `Parcela SIGPAC: ${parcelaData.poligono}-${parcelaData.parcela}`
      });
      // Attach data for events
      marker.parcelaData = parcelaData;
      this.geometryManager.bindPopup(marker, content);
      // Do not open the popup automatically.
      // The user can click the marker to see the popup.
    } else if (this.config.interactionMode === 'popup') {
      L.popup().setLatLng(latlng).setContent(content).openOn(this.map);
    }
  }
  
  /**
   * Builds HTML content for parcel popup
   */
  buildPopupContent(parcelaData) {
    const safeGet = (value) => value !== undefined && value !== null ? value : 'N/A';
    
    return `
      <div class="sigpac-popup">
        <div class="sigpac-popup-title">SIGPAC Parcel</div>
        <div class="sigpac-popup-content">
          ${this.buildPopupRows(parcelaData, safeGet)}
        </div>
      </div>
    `;
  }
  
  /**
   * Builds individual rows for popup content
   */
  buildPopupRows(parcelaData) {
    const safeGet = (value) => value !== undefined && value !== null ? value : 'N/A';
    const fields = this.getFieldsConfig(parcelaData);
    
    return fields.map(field => `
      <div class="sigpac-popup-row">
        <span class="sigpac-popup-label">${field.label}</span>
        <span class="sigpac-popup-value">
          ${safeGet(field.value)}${field.suffix ? ' ' + field.suffix : ''}
        </span>
      </div>
    `).join('');
  }

  /**
   * Gets field configuration from settings or uses default
   */
  getFieldsConfig(parcelaData) {
    if (this.config.popupFields) {
      const fields = typeof this.config.popupFields === 'function' 
        ? this.config.popupFields(parcelaData)
        : this.config.popupFields;
      
      // Asegurar que siempre sea un array
      return Array.isArray(fields) ? fields : [];
    }
    
    // Default fields
    return [
      { label: 'Province:', value: parcelaData.provincia },
      { label: 'Municipality:', value: parcelaData.municipio },
      { label: 'Polygon:', value: parcelaData.poligono },
      { label: 'Parcel:', value: parcelaData.parcela },
      { label: 'Enclosure:', value: parcelaData.recinto },
      { label: 'Use:', value: parcelaData.uso },
      { label: 'Surface:', value: parcelaData.superficie, suffix: 'ha' }
    ];
  }
}