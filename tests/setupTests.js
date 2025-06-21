// Mock global para Leaflet
global.L = {
  map: jest.fn(),
  popup: jest.fn(),
  marker: jest.fn(),
  control: {
    attribution: jest.fn(),
    layers: jest.fn(),
  },
  tileLayer: jest.fn(),
  tileLayer: {
    wms: jest.fn(),
  },
  Icon: jest.fn(),
};

// Mock de localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key]),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
  };
})();

global.localStorage = localStorageMock;