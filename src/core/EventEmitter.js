/**
 * Lightweight event bus for component communication.
 * @class
 */
export default class EventEmitter {

  constructor() {
    this.events = new Map();
  }

  /**
   * Registers an event listener.
   */
  on(event, listener) {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event).add(listener);
  }

  /**
   * Emits an event with data.
   */
  emit(event, data) {
    if (this.events.has(event)) {
      this.events.get(event).forEach(listener => listener(data));
    }
  }

  /**
   * Removes an event listener.
   */
  off(event, listener) {
    if (this.events.has(event)) {
      const listeners = this.events.get(event);
      listeners.delete(listener);
      if (listeners.size === 0) {
        this.events.delete(event);
      }
    }
  }

  /**
   * Removes all event listeners.
   */
  offAll() {
    this.events.clear();
  }
}