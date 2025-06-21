/**
 * Service for interacting with SIGPAC APIs
 */
export default class SigpacService {
  constructor(config, logger) {
    this.config = config;
    this.logger = logger;
  }
  
  async fetchParcelaByCoordinates(latlng) {
    try {
      const url = this.buildQueryUrl(latlng);
      this.logger.info("Fetching SIGPAC data", { url });
      
      const response = await fetch(url, { headers: { 'Accept': 'application/json' } });
      
      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorBody.substring(0, 100)}`);
      }
      
      const data = await response.json();
      return this.processResponse(data);
      
    } catch (error) {
      this.logger.error('SIGPAC fetch error', error);
      throw error;
    }
  }
  
  buildQueryUrl(latlng) {
    const lat = latlng.lat.toFixed(6);
    const lon = latlng.lng.toFixed(6);
    return `${this.config.sigpacCoordinateQueryUrl}4326/${lon}/${lat}.json`;
  }
  
  processResponse(data) {
    if (Array.isArray(data) && data.length > 0) {
      return this.parseSigpacData(data[0]);
    }
    return null;
  }
  
  parseSigpacData(parcela) {
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
        superficie: this.calculateSurface(parcela.dn_surface), // En Ha
        cultivo: 'N/A',
        pendiente: parcela.pendiente_media || 'N/A',
        regadio: parcela.coef_regadio || 'N/A',
        incidencias: parcela.incidencias || 'N/A', // Coeficiente de regadío del recinto.
        admisibilidad: parcela.admisibilidad || 'N/A', //  Porcentaje de admisibilidad de aplicación en los recintos de pastos.
        wkt: parcela.wkt,
        srid: parcela.srid,
      };
    } catch (error) {
      this.logger.error("SIGPAC parse error", error);
      return null;
    }
  }
  
  calculateSurface(dn_surface) {
    if (!dn_surface) return 'N/A';
    
    const superficieValue = dn_surface / 10000;
    return !isNaN(superficieValue) ? superficieValue.toFixed(2) : 'N/A';
  }
}