/**
 * Base configuration constants
 * @type {BaseConfig}
 */
export const baseDefaultConfig = {
  debug: false,
  livewire: false,
  livewireEvent: 'sigpacFeatureSelected',
  sigpacWmsUrl: 'https://sigpac-hubcloud.es/wms',
  sigpacLayerName: 'recinto',
  sigpacCoordinateQueryUrl: 'https://sigpac-hubcloud.es/servicioconsultassigpac/query/recinfobypoint/',
  minZoomFeature: 12,
  defaultMapOptions: {
    center: [40.416775, -3.703790],
    zoom: 13,
    maxZoom: 19,
    minZoom: 5,
    tileUrl: 'https://tms-pnoa-ma.idee.es/1.0.0/pnoa-ma/{z}/{x}/{-y}.jpeg',
    attribution: '<a href="https://www.scne.es/">CC BY 4.0 scne.es</a>'
  },
  
  // Configuración de caché
  cacheConfig: {
    enabled: true,
    ttl: 300000, // 5 minutos
    maxSize: 100,
    precision: 4
  },
  
  // URLs para librerías externas (carga bajo demanda)
  externalLibs: {
    terraformer: {
      url: 'https://unpkg.com/terraformer@1.0.9/terraformer.js',
      integrity: 'sha384-7e0rV8XjC1y0KZxlB+4O7w8n2gxV6Z7u6z5p5z5z5z5z5z5z5z5z5z5z5z5z5z5'
    },
    terraformerWkt: {
      url: 'https://unpkg.com/terraformer-wkt-parser@1.2.1/terraformer-wkt-parser.min.js',
      integrity: 'sha384-7e0rV8XjC1y0KZxlB+4O7w8n2gxV6Z7u6z5p5z5z5z5z5z5z5z5z5z5z5z5z5z5'
    }
  },
  
  // Iconos para estados
  markerLoadingIcon: L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-gold.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34]
  }),
  markerErrorIcon: L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34]
  })
};

/**
 * Complete default configuration
 * @type {FullConfig}
 */
export const defaultConfig = {
  ...baseDefaultConfig,
  hideLeafletAttribution: false,
  interactionMode: 'popup',
  initialFeatures: [],
  popupFields: null,
  markerIconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  clickEnabled: true
};