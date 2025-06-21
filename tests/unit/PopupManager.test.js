import PopupManager from '../../src/core/PopupManager.js';

// Mock completo y funcional de Leaflet
const mockPopup = {
  setLatLng: jest.fn().mockReturnThis(),
  setContent: jest.fn().mockReturnThis(),
  openOn: jest.fn()
};

const mockMarker = {
  openPopup: jest.fn()
};

global.L = {
  popup: jest.fn(() => mockPopup),
  map: jest.fn()
};

// Mock funcional de MarkerManager
jest.mock('../../src/core/MarkerManager.js', () => {
  return jest.fn().mockImplementation(() => {
    return {
      createMarker: jest.fn().mockReturnValue(mockMarker),
      bindPopupToMarker: jest.fn(),
      clearMarkers: jest.fn()
    };
  });
});

describe('PopupManager', () => {
  let popupManager;
  const mockMap = { testMap: true };
  const mockConfig = {
    showAs: 'marker',
    popupFields: jest.fn().mockReturnValue([
      { label: 'Test', value: 'Value' }
    ])
  };

  beforeEach(() => {
    jest.clearAllMocks();
    popupManager = new PopupManager(mockMap, mockConfig);
  });

  test('showParcelaInfo should create a marker but NOT open its popup automatically', () => {
    const mockData = { provincia: 'Murcia' };
    const mockLatlng = { lat: 37.718, lng: -0.874 };
    
    popupManager.showParcelaInfo(mockData, mockLatlng);
    
    expect(popupManager.markerManager.createMarker).toHaveBeenCalledWith(mockData, mockLatlng);
    expect(popupManager.markerManager.bindPopupToMarker).toHaveBeenCalled();
    expect(mockMarker.openPopup).not.toHaveBeenCalled();
  });

  test('showParcelaInfo should create popup when showAs=popup', () => {
    popupManager.config.showAs = 'popup';
    const mockData = { provincia: 'Murcia' };
    const mockLatlng = { lat: 37.718, lng: -0.874 };
    
    popupManager.showParcelaInfo(mockData, mockLatlng);
    
    expect(L.popup).toHaveBeenCalled();
    expect(mockPopup.setLatLng).toHaveBeenCalledWith(mockLatlng);
    expect(mockPopup.setContent).toHaveBeenCalled();
    expect(mockPopup.openOn).toHaveBeenCalledWith(mockMap);
  });
});