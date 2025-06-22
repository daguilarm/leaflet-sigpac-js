/**
 * Coordinates-based cache with TTL expiration and size limits
 */
export default class CoordinateCache {
  
  constructor(config) { 
    this.cache = new Map();// Coordinates-based cache with TTL expiration and size limits
    this.config = config;
    this.accessOrder = []; // For implementing LRU policy
  }

  /**
   * Get cached value for coordinates
   */
  get(latlng) {
    const key = this.#generateKey(latlng);
    const entry = this.cache.get(key);
    
    if (entry) {
      // Verificar expiración
      if (Date.now() - entry.timestamp < this.config.ttl) {
        // Update access order (LRU)
        this.#updateAccessOrder(key);
        return entry.data;
      }
      
      // Remove expired entry
      this.cache.delete(key);
      this.#removeFromAccessOrder(key);
    }
    
    return undefined;
  }

  /**
   * Set cache value for coordinates
   */
  set(latlng, data) {
    if (!this.config.enabled) return;
    
    const key = this.#generateKey(latlng);
    
    // Apply LRU policy if maximum size is exceeded
    if (this.accessOrder.length >= this.config.maxSize) {
      const lruKey = this.accessOrder.shift();
      this.cache.delete(lruKey);
    }
    
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
    
    this.#updateAccessOrder(key);
  }

  /** 
   * Clears entire cache 
   */
  clear() {
    this.cache.clear();
    this.accessOrder = [];
  }

  /**
   * Generate cache key from coordinates
   * @private 
   */
  #generateKey(latlng) {
    return `${latlng.lat.toFixed(this.config.precision)}_${latlng.lng.toFixed(this.config.precision)}`;
  }

  /**
   * Update access order for LRU policy
   * @private
   */ 
  #updateAccessOrder(key) {
    // Eliminar cualquier ocurrencia previa
    this.#removeFromAccessOrder(key);
    // Agregar al final (más reciente)
    this.accessOrder.push(key);
  }

  /**
   * Remove key from access order
   */
  #removeFromAccessOrder(key) {
    const index = this.accessOrder.indexOf(key);
    if (index !== -1) {
      this.accessOrder.splice(index, 1);
    }
  }
}