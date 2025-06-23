/**
 * Helper para cargar scripts externos
 * @class
 */
export default class ScriptLoader {
  /**
   * Carga una librería externa
   * @param {Object} libConfig - Configuración de la librería
   * @returns {Promise<void>}
   */
  static load(libConfig) {
    return new Promise((resolve, reject) => {
      // Verificar si ya está cargada
      if (libConfig.checkLoaded && libConfig.checkLoaded()) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = libConfig.url;
      
      if (libConfig.integrity) {
        script.integrity = libConfig.integrity;
        script.crossOrigin = 'anonymous';
      }
      
      script.onload = () => {
        // Pequeño retraso para permitir que el script se inicialice
        setTimeout(() => {
          // Verificar que se cargó correctamente
          if (libConfig.checkLoaded && !libConfig.checkLoaded()) {
            reject(new Error(`Failed to load ${libConfig.url} - Check function returned false`));
          } else {
            resolve();
          }
        }, 100);
      };
      
      script.onerror = (error) => {
        reject(new Error(`Failed to load script: ${libConfig.url}`, { cause: error }));
      };
      
      document.head.appendChild(script);
    });
  }

  /**
   * Carga múltiples librerías en orden
   * @param {Array<Object>} libs - Lista de configuraciones
   * @returns {Promise<void>}
   */
  static async loadAll(libs) {
    for (const lib of libs) {
      try {
        await this.load(lib);
      } catch (error) {
        console.error(`Error loading script: ${lib.url}`, error);
        throw error;
      }
    }
  }
}