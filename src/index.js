import './assets/css/sigpac.css';
import MapManager from './core/MapManager.js';
import CoordinateCache from './core/CacheManager.js'; // Importar la clase

// Run only in browser environment
if (typeof window !== 'undefined') {

  /**
   * Library namespace attached to global window object
   * Contains core components and initialization methods
   */
  const LeafletSigpac = {
    MapManager,
    CoordinateCache, // Exponer la clase
    
    //Auto-initializes maps on elements with data-sigpac-map attribute
    autoInit: function() {
      document.querySelectorAll('[data-sigpac-map]').forEach(element => {
        try {
          // Parse configuration from data attributes
          const config = JSON.parse(element.dataset.config || '{}');
          const options = JSON.parse(element.dataset.options || '{}');
          
          // Initialize map manager
          const manager = new MapManager(config);
          manager.init(element, options);
        } catch (e) {
          console.error(
            'SIGPAC map initialization failed. Please check configuration format.',
            e,
            element
          );
        }
      });
    },
    
    /**
     * Get manager instance by element
     * @param {HTMLElement} element - Map container
     * @returns {MapManager} Manager instance
     */
    getManager: function(element) {
      return element.leafletSigpac?.manager;
    }
  };

  // Merge with existing namespace if present
  window.LeafletSigpac = Object.assign(window.LeafletSigpac || {}, LeafletSigpac);

  // Auto-initialize maps when DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    if (window.LeafletSigpac.autoInit) {
      window.LeafletSigpac.autoInit();
    }
  });
}