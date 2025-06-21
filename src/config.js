/**
 * Default configuration for Leaflet-SIGPAC library
 * Centralizes all configurable parameters for easier maintenance
 */
export const defaultConfig = {
  debug: false,
  livewire: false,
  livewireEvent: 'sigpacFeatureSelected',
  
  // SIGPAC service endpoints
  sigpacWmsUrl: 'https://sigpac-hubcloud.es/wms',
  sigpacLayerName: 'recinto',
  sigpacCoordinateQueryUrl: 'https://sigpac-hubcloud.es/servicioconsultassigpac/query/recinfobypoint/',
  
  // Map behavior settings
  minZoomFeature: 12,
  
  // Default map options
  defaultMapOptions: {
    center: [40.416775, -3.703790], // Madrid
    zoom: 13,
    maxZoom: 19,
    minZoom: 5,
    tileUrl: 'https://tms-pnoa-ma.idee.es/1.0.0/pnoa-ma/{z}/{x}/{-y}.jpeg',
    attribution: '<a href="https://www.scne.es/">CC BY 4.0 scne.es</a>',
    hideLeafletAttribution: false,
    debug: false,
    showAs: 'popup', // 'popup' or 'marker'
    popupFields: null, // Custom fields by the user
  }
};