/**
 * Handles all event-related functionality
 */
export default class EventManager {
  constructor(config, mapContainer) {
    this.config = config;
    this.mapContainer = mapContainer;
  }
  
  /**
   * Emits feature selected event
   */
  emitFeatureSelected(parcelaData, latlng) {
    const event = new CustomEvent('sigpac:featureSelected', {
      detail: {
        data: parcelaData,
        coordinates: [latlng.lat, latlng.lng]
      },
      bubbles: true
    });
    
    this.mapContainer.dispatchEvent(event);
  }
  
  /**
   * Emits Livewire event if enabled
   */
  emitLivewireEvent(parcelaData, latlng) {
    if (this.config.livewire && window.livewire) {
      window.livewire.emit(
        this.config.livewireEvent || 'sigpacFeatureSelected', 
        {
          data: parcelaData,
          coordinates: [latlng.lat, latlng.lng]
        }
      );
    }
  }
}