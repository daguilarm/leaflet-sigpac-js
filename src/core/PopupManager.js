/**
 * Handles creation and display of popups
 */
export default class PopupManager {
  constructor(map) {
    this.map = map;
  }
  
  /**
   * Shows loading popup
   */
  showLoadingPopup(latlng) {
    return L.popup()
      .setLatLng(latlng)
      .setContent('<div class="sigpac-loading">Loading SIGPAC data...</div>')
      .openOn(this.map);
  }
  
  /**
   * Shows error popup
   */
  showErrorPopup(latlng, message) {
    L.popup()
      .setLatLng(latlng)
      .setContent(`<div class="sigpac-error">${message}</div>`)
      .openOn(this.map);
  }
  
  /**
   * Shows parcel information popup
   */
  showParcelaInfo(parcelaData, latlng) {
    const popupContent = this.buildPopupContent(parcelaData);
    
    L.popup()
      .setLatLng(latlng)
      .setContent(popupContent)
      .openOn(this.map);
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
  buildPopupRows(parcelaData, safeGet) {
    const fields = [
      { label: 'Province:', value: parcelaData.provincia },
      { label: 'Municipality:', value: parcelaData.municipio },
      { label: 'Polygon:', value: parcelaData.poligono },
      { label: 'Parcel:', value: parcelaData.parcela },
      { label: 'Enclosure:', value: parcelaData.recinto },
      { label: 'Use:', value: parcelaData.uso },
      { label: 'Surface:', value: parcelaData.superficie, suffix: 'ha' }
    ];
    
    return fields.map(field => `
      <div class="sigpac-popup-row">
        <span class="sigpac-popup-label">${field.label}</span>
        <span class="sigpac-popup-value">
          ${safeGet(field.value)}${field.suffix ? ' ' + field.suffix : ''}
        </span>
      </div>
    `).join('');
  }
}