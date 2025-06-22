import CoordinateCache from './CacheManager.js';

/**
 * Service for SIGPAC API interactions with caching
 */
export default class SigpacService {

  constructor(config, logger) {
    this.config = config;
    this.logger = logger;
    // Initialize cache with configuration
    this.cache = new CoordinateCache(this.config.cacheConfig);
    
    this.logger.info(`Cache initialized: ${this.config.cacheConfig.enabled ? 
      `Enabled (TTL: ${this.config.cacheConfig.ttl}ms, Size: ${this.config.cacheConfig.maxSize})` : 
      'Disabled'}`
    );
  }

  /**
   * Fetch SIGPAC data by coordinates
   */
  async fetchParcelaByCoordinates(latlng) {
    // Check if the cache is enabled
    if (this.config.cacheConfig.enabled) {
      const cached = this.cache.get(latlng);
      if (cached) {
        this.logger.debug('Using cached SIGPAC data');
        return cached;
      }
    }

    // Fetch data from API
    try {
      const url = this.#buildQueryUrl(latlng);
      this.logger.info("Fetching SIGPAC data", { url });
      
      const response = await fetch(url, { 
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(10000)
      });
      
      // Check response status
      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorBody.substring(0, 100)}`);
      }
      
      const data = await response.json();
      const processed = this.#processResponse(data);
      
      // Store in cache only if enabled and we have valid data
      if (processed && this.config.cacheConfig.enabled) {
        this.cache.set(latlng, processed);
      }
      
      return processed;
      
    } catch (error) { // SIGPAC fetch error
      this.logger.error('SIGPAC fetch error', error);
      throw error;
    }
  }

  /**
   * Build query URL from coordinates
   * @private Builds query URL from coordinates
   */
  #buildQueryUrl(latlng) {
    const lat = latlng.lat.toFixed(6);
    const lon = latlng.lng.toFixed(6);
    return `${this.config.sigpacCoordinateQueryUrl}4326/${lon}/${lat}.json`;
  }

  /**
   * Processes API response
   * @private
   */
  #processResponse(data) {
    if (Array.isArray(data) && data.length > 0) {
      return this.#parseSigpacData(data[0]);
    }
    return null;
  }

  /**
   * Parses raw SIGPAC data
   * @private
   */
  #parseSigpacData(parcela) {
    try {
      this.logger.debug("Parsing SIGPAC data", parcela);
      return {
        provincia: parcela.provincia || 'N/A',
        municipio: parcela.municipio || 'N/A',
        zona: parcela.zona || 0,
        poligono: parcela.poligono,
        parcela: parcela.parcela,
        recinto: parcela.recinto,
        uso: parcela.uso_sigpac || 'N/A',
        superficie: this.#calculateSurface(parcela.dn_surface),
        cultivo: 'N/A',
        pendiente: parcela.pendiente_media || 'N/A',
        regadio: parcela.coef_regadio || 'N/A',
        incidencias: parcela.incidencias || 'N/A',
        admisibilidad: parcela.admisibilidad || 'N/A',
        wkt: parcela.wkt,
        srid: parcela.srid,
      };
    } catch (error) {
      this.logger.error("SIGPAC parse error", error);
      return null;
    }
  }

  /**
   * Calculates surface in hectares
   * @private
   */
  #calculateSurface(dn_surface) {
    if (!dn_surface) return 'N/A';
    
    const superficieValue = dn_surface / 10000;
    return !isNaN(superficieValue) ? superficieValue.toFixed(2) : 'N/A';
  }
}