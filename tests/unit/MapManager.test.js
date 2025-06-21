import MapManager from '../../src/core/MapManager.js';
import { jest } from '@jest/globals';

// Mock completo de Leaflet con todas las dependencias necesarias
jest.mock('leaflet', () => {
  // Mock para control.attribution
  const mockAttributionControl = {
    addTo: jest.fn().mockReturnThis(),
    setPrefix: jest.fn(),
    addAttribution: jest.fn()
  };
  
  // Mock para la instancia del mapa
  const mockMapInstance = {
    setView: jest.fn(),
    on: jest.fn(),
    closePopup: jest.fn(),
    getContainer: jest.fn(() => global.document.createElement('div')),
    attributionControl: mockAttributionControl,
    // Añadir todos los métodos necesarios
    getZoom: jest.fn().mockReturnValue(15),
    closePopup: jest.fn()
  };
  
  return {
    map: jest.fn(() => mockMapInstance),
    control: {
      attribution: jest.fn(() => mockAttributionControl),
      layers: jest.fn(() => ({
        addTo: jest.fn()
      }))
    },
    popup: jest.fn(() => ({
      setLatLng: jest.fn().mockReturnThis(),
      setContent: jest.fn().mockReturnThis(),
      openOn: jest.fn()
    })),
    tileLayer: jest.fn(() => ({
      addTo: jest.fn()
    })),
    tileLayer: {
      wms: jest.fn(() => ({
        addTo: jest.fn()
      }))
    },
    Icon: jest.fn(),
    // Añadir EventEmitter si es necesario
    Evented: jest.fn()
  };
});

// Mocks para todas las dependencias
jest.mock('../../src/core/Logger.js', () => {
  return jest.fn().mockImplementation(() => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  }));
});

jest.mock('../../src/core/SigpacService.js', () => {
  return jest.fn().mockImplementation(() => ({
    fetchParcelaByCoordinates: jest.fn()
  }));
});

jest.mock('../../src/core/LayerManager.js', () => {
  return jest.fn().mockImplementation(() => ({
    initBaseLayer: jest.fn(),
    initSigpacLayer: jest.fn(),
    setupLayerControl: jest.fn(),
    setupAttribution: jest.fn()
  }));
});

jest.mock('../../src/core/PopupManager.js', () => {
  return jest.fn().mockImplementation(() => ({
    showLoadingPopup: jest.fn(),
    showErrorPopup: jest.fn(),
    showParcelaInfo: jest.fn(),
    clearMarkers: jest.fn()
  }));
});

jest.mock('../../src/core/EventManager.js', () => {
  return jest.fn().mockImplementation(() => ({
    emitFeatureSelected: jest.fn(),
    emitLivewireEvent: jest.fn()
  }));
});

describe('MapManager', () => {
  let mapManager;
  const mockElement = document.createElement('div');

  beforeEach(() => {
    // Limpiar todos los mocks antes de cada prueba
    jest.clearAllMocks();
    
    mapManager = new MapManager({
      debug: true,
      showAs: 'marker',
      popupFields: () => [],
      minZoomFeature: 12
    });
  });

  test('init should create map with correct configuration', () => {
    mapManager.init(mockElement);
    
    // Verificar que se creó el mapa con el elemento correcto
    expect(L.map).toHaveBeenCalledWith(mockElement, { attributionControl: false });
    
    // Verificar que se configuró la vista
    expect(mapManager.map.setView).toHaveBeenCalled();
    
    // Verificar que se inicializaron los managers
    expect(mapManager.layerManager).toBeDefined();
    expect(mapManager.popupManager).toBeDefined();
    expect(mapManager.eventManager).toBeDefined();
    
    // Verificar que se configuraron las capas
    expect(mapManager.layerManager.initBaseLayer).toHaveBeenCalled();
    expect(mapManager.layerManager.initSigpacLayer).toHaveBeenCalled();
    expect(mapManager.layerManager.setupLayerControl).toHaveBeenCalled();
  });

  test('handleMapClick should show marker when showAs=marker', async () => {
    // Inicializar el mapa
    mapManager.init(mockElement);
    
    // Configurar mock para el servicio SIGPAC
    const mockParcelaData = { poligono: '28', parcela: '15' };
    mapManager.sigpacService.fetchParcelaByCoordinates = jest.fn()
      .mockResolvedValue(mockParcelaData);
    
    // Simular evento de clic
    const mockEvent = {
      latlng: { lat: 37.718, lng: -0.874 },
      originalEvent: { preventDefault: jest.fn() }
    };
    
    await mapManager.handleMapClick(mockEvent);
    
    // Verificar que se mostró la información de la parcela
    expect(mapManager.popupManager.showParcelaInfo).toHaveBeenCalledWith(
      mockParcelaData,
      mockEvent.latlng
    );
  });

  test('should show error when zoom level is too low', async () => {
    // Inicializar el mapa
    mapManager.init(mockElement);
    
    // Configurar zoom bajo
    mapManager.map.getZoom = jest.fn().mockReturnValue(10);
    
    // Simular evento de clic
    const mockEvent = {
      latlng: { lat: 37.718, lng: -0.874 }
    };
    
    await mapManager.handleMapClick(mockEvent);
    
    // Verificar que se mostró el error
    expect(mapManager.popupManager.showErrorPopup).toHaveBeenCalled();
  });
});