/**
 * Handles popup creation and content management
 */
export default class PopupManager {
  
  constructor(map, config, geometryManager) {
    this.map = map;
    this.config = config;
    this.geometryManager = geometryManager;
    this.popupPool = [];
  }
  
  /**
   * Show loading indicator popup
   */ 
  showLoadingPopup(latlng) {
    return this.#createPopup(
      latlng, 
      '<div class="sigpac-loading">Loading SIGPAC data...</div>'
    );
  }

  /**
   * Show error popup
   */ 
  showErrorPopup(latlng, message) {
    this.map.closePopup();
    return this.#createPopup(
      latlng, 
      `<div class="sigpac-error">${message}</div>`
    );
  }

  /**
   * Display parcel information
   */ 
  showParcelaInfo(parcelaData, latlng) {
    this.geometryManager.clearLayers();
    const content = this.buildPopupContent(parcelaData);

    switch (this.config.interactionMode) {
      case 'marker':
        this.#handleMarkerMode(parcelaData, latlng, content);
        break;
      case 'popup':
        this.#createPopup(latlng, content);
        break;
    }
  }

  /**
   * Build HTML content for parcel popup
   */ 
  buildPopupContent(parcelaData) {
    const safeGet = (value) => value ?? 'N/A';
    const fields = this.getFieldsConfig(parcelaData);
    
    const rows = fields.map(field => `
      <div class="sigpac-popup-row">
        <span class="sigpac-popup-label">${field.label}</span>
        <span class="sigpac-popup-value">
          ${safeGet(field.value)}${field.suffix ? ` ${field.suffix}` : ''}
        </span>
      </div>
    `).join('');

    return `
      <div class="sigpac-popup">
        <div class="sigpac-popup-title">SIGPAC Parcel</div>
        <div class="sigpac-popup-content">${rows}</div>
      </div>
    `;
  }

  /**
   * Get field configuration 
   */
  getFieldsConfig(parcelaData) {
    if (this.config.popupFields) {
      const fields = typeof this.config.popupFields === 'function' 
        ? this.config.popupFields(parcelaData)
        : this.config.popupFields;
      
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

  /**
   * Handle marker interaction mode 
   * @private 
   */ 
  #handleMarkerMode(parcelaData, latlng, content) {
    const marker = this.geometryManager.addMarker(latlng, {
      title: `Parcela SIGPAC: ${parcelaData.poligono}-${parcelaData.parcela}`
    });
    
    marker.parcelaData = parcelaData;
    this.geometryManager.bindPopup(marker, content);
  }

  /**
   * Creates or reuses a popup instance.
   * @private
   */
  #createPopup(latlng, content) {
    // Reuse popup from pool if available
    const popup = this.popupPool.pop() || L.popup();
    
    popup
      .setLatLng(latlng)
      .setContent(content)
      .openOn(this.map);
    
    // Return to pool when closed
    popup.on('remove', () => {
      this.popupPool.push(popup);
    });
    
    return popup;
  }
}