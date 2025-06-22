# Leaflet-SIGPAC Library

## Overview
Leaflet-SIGPAC is a powerful JavaScript library for integrating SIGPAC (Spanish Geographic Information System for Agricultural Parcels) with Leaflet maps. It provides seamless interaction with agricultural parcel data, customizable UI components, and multiple integration patterns for both frontend and backend communication.

## Key Features
- Interactive SIGPAC Data Retrieval: Fetch parcel information by clicking on the map.
- Multiple Display Modes: Popup or marker-based information display.
- Advanced Caching: Configurable coordinate-based caching for performance.
- Livewire Integration: Built-in support for Laravel Livewire.
- Geometry Management: Handle markers, polygons, and WKT data.
- Customizable UI: Fully customizable popups and markers.
- Event System: Custom events for integration with other components.
- Multi-map Support: Manage multiple independent map instances.

## Usage
Include Leaflet and the library in your project:

```html
<!-- Leaflet -->
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

<!-- Leaflet-SIGPAC -->
<link rel="stylesheet" href="path/to/leaflet-sigpac.min.css" />
<script type="module" src="path/to/leaflet-sigpac.es.min.js"></script>
```
## Basic Configuration
```javascript
const manager = new window.LeafletSigpac.MapManager({
  debug: true,
  interactionMode: 'popup', // 'popup' or 'marker'
  minZoomFeature: 12,
  defaultMapOptions: {
    center: [40.416775, -3.703790],
    zoom: 13,
    tileUrl: 'https://tms-pnoa-ma.idee.es/1.0.0/pnoa-ma/{z}/{x}/{-y}.jpeg'
  }
});

manager.init(document.getElementById('map'));
```
## Configuration Options
|Property|Type|Default|Description|
|---|---|---|---|
|`debug`|boolean|`false`|Enable debug logging|
|`livewire`|boolean|`false`|Enable Livewire integration|
|`livewireEvent`|String|`sigpacFeatureSelected`|Livewire event name|
|`interactionMode`|String|`popup`|popup or marker|
|`minZoomFeature`|Number|`12`|Minimum zoom level to show parcel info|
|`clickEnabled`|Boolean|`true`|Enable/disable map click interaction|
|`initialFeatures`|Array|`[]`|Preload features on map initialization|
|`popupFields`|Array/Function|`null`|Customize popup content fields|
|`cacheConfig`|Object|`{enabled: true, ttl: 300000, maxSize: 100}`|Cache configuration|
|`defaultMapOptions`|Object|`See config.js`|Default Leaflet map options|

## Integration Patterns
### 1. Frontend Processing (`public/examples/basic.html`)
Retrieve and display SIGPAC data directly in the browser:

```javascript
const manager = new window.LeafletSigpac.MapManager({
  debug: true,
  interactionMode: 'marker',
  defaultMapOptions: {
    center: [37.718387, -0.874100],
    zoom: 15
  }
});
manager.init(document.getElementById('map'));
```
## 2. Frontend to Backend (`public/examples/livewire.html`)
Send parcel data to backend via Livewire:

```javascript
const manager = new window.LeafletSigpac.MapManager({
  debug: true,
  livewire: true,
  defaultMapOptions: {
    center: [40.416775, -3.703790],
    zoom: 13
  }
});
manager.init(document.getElementById('map'));
```
## 3. Backend to Frontend (`public/examples/backend.html`)
Preload features from backend data:

```javascript
const manager = new window.LeafletSigpac.MapManager({
  debug: true,
  clickEnabled: false,
  initialFeatures: [
    { 
      type: 'marker',
      coordinates: [37.7179, -0.8712]
    },
    { 
      type: 'wkt', 
      data: 'POLYGON((-0.869815...))'
    }
  ],
  defaultMapOptions: {
    center: [37.718387, -0.874100],
    zoom: 15
  }
});
manager.init(document.getElementById('map'));
```

# Advanced Usage

## Multiple Maps (`public/examples/multimap.html`)
```html
<div id="map1" style="height: 500px;"></div>
<div id="map2" style="height: 500px;"></div>

<script>
  // Map 1: Madrid - Marker Mode
  const manager1 = new window.LeafletSigpac.MapManager({
    interactionMode: 'marker',
    defaultMapOptions: { center: [40.416775, -3.703790], zoom: 13 }
  });
  manager1.init(document.getElementById('map1'));

  // Map 2: Barcelona - Popup Mode
  const manager2 = new window.LeafletSigpac.MapManager({
    interactionMode: 'popup',
    defaultMapOptions: { center: [41.3851, 2.1734], zoom: 12 }
  });
  manager2.init(document.getElementById('map2'));
</script>
```
## Custom Popup Content
```javascript
const manager = new window.LeafletSigpac.MapManager({
  popupFields: (parcelaData) => [
    { label: 'Province:', value: parcelaData.provincia },
    { label: 'Municipality:', value: parcelaData.municipio },
    { label: 'Surface:', value: parcelaData.superficie, suffix: 'ha' }
  ]
});
```
## Cache Configuration
```javascript
const manager = new window.LeafletSigpac.MapManager({
  cacheConfig: {
    enabled: true,
    ttl: 600000, // 10 minutes
    maxSize: 200,
    precision: 5
  }
});
```
# License
MIT License