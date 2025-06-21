import ConfigManager from '../../src/core/ConfigManager.js';
import { defaultConfig } from '../../src/config.js';

describe('ConfigManager', () => {
  test('should merge user config with default config', () => {
    const userConfig = {
      debug: true,
      livewire: true,
      defaultMapOptions: {
        center: [40.0, -3.0],
        zoom: 10,
      },
    };

    const manager = new ConfigManager(userConfig);
    const mergedConfig = manager.getConfig();

    // Verificar propiedades de primer nivel
    expect(mergedConfig.debug).toBe(true);
    expect(mergedConfig.livewire).toBe(true);
    expect(mergedConfig.livewireEvent).toBe(defaultConfig.livewireEvent); // Mantiene valor por defecto

    // Verificar defaultMapOptions
    expect(mergedConfig.defaultMapOptions.center).toEqual([40.0, -3.0]);
    expect(mergedConfig.defaultMapOptions.zoom).toBe(10);
    expect(mergedConfig.defaultMapOptions.maxZoom).toBe(defaultConfig.defaultMapOptions.maxZoom); // Mantiene valor por defecto
  });

  test('should move top-level map options to defaultMapOptions', () => {
    // Nota: 'interactionMode' y 'popupFields' son ahora opciones de nivel superior,
    // no parte de defaultMapOptions. El test se actualiza para reflejar esto.
    const userConfig = {
      minZoom: 6,
      maxZoom: 20,
      tileUrl: 'https://custom-tiles/{z}/{x}/{y}.png',
      attribution: 'Custom attribution',
      interactionMode: 'marker', // Esta es una opción de nivel superior
      popupFields: [], // Esta es una opción de nivel superior
    };

    const manager = new ConfigManager(userConfig);
    const mergedConfig = manager.getConfig();

    // Aserciones para opciones que *deberían* moverse a defaultMapOptions
    expect(mergedConfig.defaultMapOptions.minZoom).toBe(6);
    expect(mergedConfig.defaultMapOptions.maxZoom).toBe(20);
    expect(mergedConfig.defaultMapOptions.tileUrl).toBe('https://custom-tiles/{z}/{x}/{y}.png');
    expect(mergedConfig.defaultMapOptions.attribution).toBe('Custom attribution');

    // Aserciones para opciones que *deberían permanecer* en el nivel superior
    expect(mergedConfig.interactionMode).toBe('marker');
    expect(mergedConfig.popupFields).toEqual([]);

    // Verificar que las opciones de mapa movidas ya no están en el nivel superior
    expect(mergedConfig.minZoom).toBeUndefined();
    expect(mergedConfig.maxZoom).toBeUndefined();
    expect(mergedConfig.tileUrl).toBeUndefined();
    expect(mergedConfig.attribution).toBeUndefined();
    // interactionMode y popupFields NO deben ser undefined en el nivel superior
    expect(mergedConfig.interactionMode).toBeDefined();
    expect(mergedConfig.popupFields).toBeDefined();
  });

  test('should prioritize userConfig.defaultMapOptions over top-level options', () => {
    const userConfig = {
      zoom: 12, // Top-level
      defaultMapOptions: {
        zoom: 15, // Dentro de defaultMapOptions
        center: [1, 2],
      },
      // Asegurarse de que interactionMode de nivel superior no se vea afectado por defaultMapOptions
      interactionMode: 'marker',
    };

    const manager = new ConfigManager(userConfig);
    const mergedConfig = manager.getConfig();

    // defaultMapOptions debería tener prioridad
    expect(mergedConfig.defaultMapOptions.zoom).toBe(15);
    expect(mergedConfig.defaultMapOptions.center).toEqual([1, 2]);
    expect(mergedConfig.interactionMode).toBe('marker'); // Debería permanecer en el nivel superior
  });

  test('should handle userConfig without defaultMapOptions', () => {
    const userConfig = {
      debug: true,
      // 'showAs' es ahora 'interactionMode' y es una opción de configuración de nivel superior.
      interactionMode: 'popup',
    };

    const manager = new ConfigManager(userConfig);
    const mergedConfig = manager.getConfig();

    expect(mergedConfig.debug).toBe(true);
    expect(mergedConfig.interactionMode).toBe('popup'); // Debería estar en el nivel superior
    expect(mergedConfig.defaultMapOptions.center).toEqual(defaultConfig.defaultMapOptions.center);
  });

  test('should handle empty userConfig', () => {
    const manager = new ConfigManager({});
    const mergedConfig = manager.getConfig();

    expect(mergedConfig.debug).toBe(defaultConfig.debug);
    expect(mergedConfig.defaultMapOptions.center).toEqual(defaultConfig.defaultMapOptions.center);
  });

  test('should merge nested objects correctly', () => {
    const userConfig = {
      defaultMapOptions: {
        attribution: 'New attribution',
        hideLeafletAttribution: true,
      },
    };

    const manager = new ConfigManager(userConfig);
    const mergedConfig = manager.getConfig();

    // Propiedades modificadas
    expect(mergedConfig.defaultMapOptions.attribution).toBe('New attribution');
    expect(mergedConfig.defaultMapOptions.hideLeafletAttribution).toBe(true);
    
    // Propiedades no modificadas (valores por defecto)
    expect(mergedConfig.defaultMapOptions.center).toEqual(defaultConfig.defaultMapOptions.center);
    expect(mergedConfig.defaultMapOptions.zoom).toBe(defaultConfig.defaultMapOptions.zoom);
  });
});
