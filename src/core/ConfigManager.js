import { defaultConfig } from '../../config/defaultConfig.js';

/**
 * Handles configuration management including merging defaults with user-provided config
 */
export default class ConfigManager {
  constructor(userConfig = {}) {
    this.config = this.mergeConfigs(userConfig);
  }
  
  /**
   * Merges user configuration with defaults
   */
  mergeConfigs(userConfig) {
    return {
      ...defaultConfig,
      ...userConfig,
      defaultMapOptions: {
        ...defaultConfig.defaultMapOptions,
        ...(userConfig.defaultMapOptions || {})
      }
    };
  }
  
  /**
   * Gets the current configuration
   */
  getConfig() {
    return this.config;
  }
}