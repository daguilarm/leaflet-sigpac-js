import { JSDOM } from 'jsdom';
import MapManager from '../../src/core/MapManager.js';

// Mock Leaflet para la prueba de integración
jest.mock('leaflet', () => ({
  // Mock para control.attribution
  control: {
    attribution: jest.fn(() => ({
      addTo: jest.fn().mockReturnThis(),
      setPrefix: jest.fn(),
      addAttribution: jest.fn()
    })),
    layers: jest.fn(() => ({
      addTo: jest.fn()
    }))
  },
  map: jest.fn(() => ({
    setView: jest.fn(),
    on: jest.fn(),
    closePopup: jest.fn(),
    getContainer: jest.fn(() => ({})),
  })),
  popup: jest.fn(() => ({
    setLatLng: jest.fn().mockReturnThis(),
    setContent: jest.fn().mockReturnThis(),
    openOn: jest.fn()
  })),
  tileLayer: jest.fn(() => ({
    addTo: jest.fn()
  })),
  Icon: jest.fn()
}));

// Mock para PopupManager
jest.mock('../../src/core/PopupManager.js', () => {
  return jest.fn().mockImplementation(() => ({
    markerManager: {
      createMarker: jest.fn()
    }
  }));
});

const dom = new JSDOM(`
  <!DOCTYPE html>
  <html><body>
    <div id="map" style="height:500px"></div>
  </body></html>
`);

global.window = dom.window;
global.document = dom.window.document;

describe('MapManager Integration', () => {
  test('should initialize and handle click', async () => {
    const manager = new MapManager({
      debug: true,
      showAs: 'marker',
      popupFields: (data) => [
        { label: 'Provincia:', value: data.provincia }
      ],
      defaultMapOptions: {
        center: [37.718, -0.874],
        zoom: 15
      }
    });
    
    const mapElement = document.getElementById('map');
    manager.init(mapElement);
    
    manager.sigpacService = {
      fetchParcelaByCoordinates: jest.fn().mockResolvedValue({
        provincia: 'Murcia',
        poligono: '28',
        parcela: '15'
      })
    };
    
    const event = new global.window.MouseEvent('click', {
      bubbles: true
    });
    
    mapElement.dispatchEvent(event);
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    expect(manager.popupManager.markerManager.createMarker).toHaveBeenCalled();
  });
});