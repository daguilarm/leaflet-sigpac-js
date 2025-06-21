import { defaultConfig } from '../config.js';

export default class ConfigManager {
  constructor(userConfig = {}) {
    this.userConfig = userConfig;
  }

  getConfig() {
    // Fusionar primer nivel
    const mergedConfig = { ...defaultConfig, ...this.userConfig };
    
    // Preparar opciones de mapa de nivel superior
    const topLevelMapOptions = {};
    const mapOptionKeys = [
      'minZoom', 'maxZoom', 'center', 'zoom', 'tileUrl', 'attribution'
    ];
    
    mapOptionKeys.forEach(key => {
      if (this.userConfig[key] !== undefined) {
        topLevelMapOptions[key] = this.userConfig[key];
        delete mergedConfig[key];
      }
    });
    
    // Fusionar defaultMapOptions con prioridad
    mergedConfig.defaultMapOptions = {
      ...defaultConfig.defaultMapOptions,
      ...topLevelMapOptions,
      ...(this.userConfig.defaultMapOptions || {}),
    };
    
    return mergedConfig;
  }
}