import { defaultConfig } from '../config.js';

export default class ConfigManager {
  constructor(userConfig = {}) {
    this.userConfig = userConfig;
  }

  getConfig() {
    // Fusionar primer nivel
    const mergedConfig = { ...defaultConfig, ...this.userConfig };
    
    // Fusionar defaultMapOptions específicamente
    mergedConfig.defaultMapOptions = {
      ...defaultConfig.defaultMapOptions,
      ...(this.userConfig.defaultMapOptions || {}),
    };

    // Fusionar propiedades de nivel superior con defaultMapOptions
    const mapOptionKeys = [
      'minZoom', 'maxZoom', 'center', 'zoom', 
      'tileUrl', 'attribution', 'hideLeafletAttribution'
    ];
    
    mapOptionKeys.forEach(key => {
      if (this.userConfig[key] !== undefined) {
        mergedConfig.defaultMapOptions[key] = this.userConfig[key];
      }
    });
      
    return mergedConfig;
  }
}