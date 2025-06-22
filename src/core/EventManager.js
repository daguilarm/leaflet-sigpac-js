/**
 * Handles custom events and Livewire integration
 */
export default class EventManager {

  constructor(config, mapContainer, eventBus) {
    this.config = config;
    this.mapContainer = mapContainer;
    this.eventBus = eventBus;
  }

  /**
   * Emit feature selected event
   */
  emitFeatureSelected(parcelaData, latlng) {
    // Internal event bus
    this.eventBus.emit('featureSelected', {
      data: parcelaData,
      coordinates: latlng
    });
    
    // DOM event
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
   * Emit Livewire event if enabled
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