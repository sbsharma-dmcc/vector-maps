
import mapboxgl from 'mapbox-gl';
import { baseLayerStyles } from './mapConstants';

export const initializeMap = (
  container: HTMLDivElement,
  token: string,
  showRoutes: boolean,
  baseRoute: [number, number][]
): mapboxgl.Map => {
  console.log("Setting mapbox access token");
  mapboxgl.accessToken = token;
  
  const mapOptions: mapboxgl.MapboxOptions = {
    container,
    style: baseLayerStyles.default,
    center: showRoutes && baseRoute.length > 0 
      ? [(baseRoute[0][0] + baseRoute[baseRoute.length - 1][0]) / 2, 
         (baseRoute[0][1] + baseRoute[baseRoute.length - 1][1]) / 2] 
      : [83.167, 6.887],
    zoom: showRoutes ? 5 : 4,
    attributionControl: false
  };

  console.log("Creating map with options:", mapOptions);
  const map = new mapboxgl.Map(mapOptions);

  // Add navigation controls
  map.addControl(
    new mapboxgl.NavigationControl(),
    'bottom-right'
  );

  // Enable zoom controls
  map.scrollZoom.enable();

  return map;
};

export const addTerrainLayer = (map: mapboxgl.Map) => {
  try {
    // Add vector tile source for terrain/elevation data instead of raster
    map.addSource('mapbox-dem-vector', {
      'type': 'vector',
      'url': 'mapbox://mapbox.mapbox-terrain-v2',
      'maxzoom': 14
    });

    // Add terrain layer using vector tiles
    map.addLayer({
      'id': 'terrain-layer',
      'type': 'fill-extrusion',
      'source': 'mapbox-dem-vector',
      'source-layer': 'contour',
      'paint': {
        'fill-extrusion-color': [
          'interpolate',
          ['linear'],
          ['get', 'ele'],
          0, '#4264fb',
          100, '#4fb3d9',
          500, '#85C1E5',
          1000, '#B8DBF0'
        ],
        'fill-extrusion-height': ['*', ['get', 'ele'], 10],
        'fill-extrusion-opacity': 0.3
      }
    });
  } catch (error) {
    console.error("Error adding terrain layer:", error);
  }
};
