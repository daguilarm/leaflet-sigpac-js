/**
 * Main entry point for Leaflet-SIGPAC library
 * 
 * Imports necessary CSS and exposes core functionality
 * Sets up automatic initialization for maps with data attributes
 */

import './assets/css/sigpac.css';
import MapManager from './core/MapManager.js';

// Run only in browser environment
if (typeof window !== 'undefined') {

  /**
   * Library namespace attached to global window object
   * Contains core components and initialization methods
   */
  const LeafletSigpac = {

    //Main class for managing SIGPAC-enabled Leaflet maps
    MapManager,

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