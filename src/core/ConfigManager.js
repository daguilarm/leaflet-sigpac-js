import { defaultConfig } from '../config.js';

/**
 * Centralizes configuration management with deep merging capabilities
 */
export default class ConfigManager {

  constructor(userConfig = {}) {
    this.userConfig = userConfig;
  }

  /**
   * Merges default configuration with user-provided options
   */
  getConfig() {
    // First-level merge
    const mergedConfig = { ...defaultConfig, ...this.userConfig };
    
    // Extract top-level map options
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
    
    // Deep merge defaultMapOptions
    mergedConfig.defaultMapOptions = {
      ...defaultConfig.defaultMapOptions,
      ...topLevelMapOptions,
      ...(this.userConfig.defaultMapOptions || {}),
    };
    
    return mergedConfig;
  }
}