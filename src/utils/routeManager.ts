
import mapboxgl from 'mapbox-gl';

// Store waypoint markers for cleanup
let waypointMarkers: mapboxgl.Marker[] = [];
let routeMarkers: mapboxgl.Marker[] = [];

export const addRoutesToMap = (
  map: mapboxgl.Map,
  baseRoute: [number, number][],
  weatherRoute: [number, number][],
  waypoints: Array<{
    coordinates: [number, number];
    name: string;
    isLocked: boolean;
    weatherWarning?: string | null;
  }> = []
) => {
  // Clear existing waypoint markers
  waypointMarkers.forEach(marker => marker.remove());
  waypointMarkers = [];
  
  // Clear existing route markers (start/end)
  routeMarkers.forEach(marker => marker.remove());
  routeMarkers = [];
  
  // Remove existing route layers and sources
  if (map.getLayer('base-route-line')) {
    map.removeLayer('base-route-line');
  }
  if (map.getLayer('weather-route-line')) {
    map.removeLayer('weather-route-line');
  }
  if (map.getSource('base-route')) {
    map.removeSource('base-route');
  }
  if (map.getSource('weather-route')) {
    map.removeSource('weather-route');
  }
  
  // Add base route source and layer
  map.addSource('base-route', {
    type: 'geojson',
    data: {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: baseRoute
      }
    }
  });
  
  map.addLayer({
    id: 'base-route-line',
    type: 'line',
    source: 'base-route',
    layout: {
      'line-join': 'round',
      'line-cap': 'round'
    },
    paint: {
      'line-color': '#000',
      'line-width': 3
    }
  });
  
  // Add weather route source and layer
  map.addSource('weather-route', {
    type: 'geojson',
    data: {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: weatherRoute
      }
    }
  });
  
  map.addLayer({
    id: 'weather-route-line',
    type: 'line',
    source: 'weather-route',
    layout: {
      'line-join': 'round',
      'line-cap': 'round'
    },
    paint: {
      'line-color': '#4ade80',
      'line-width': 3
    }
  });
  
  // Add start and end markers
  if (baseRoute.length > 0) {
    // Start marker (S)
    const startEl = document.createElement('div');
    startEl.className = 'start-marker';
    startEl.style.width = '30px';
    startEl.style.height = '30px';
    startEl.style.backgroundImage = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="%234ade80" stroke="white" stroke-width="2"><circle cx="12" cy="12" r="10"/><text x="12" y="16" text-anchor="middle" fill="white" font-size="12px" font-family="Arial">S</text></svg>')`;
    
    const startMarker = new mapboxgl.Marker(startEl)
      .setLngLat([baseRoute[0][0], baseRoute[0][1]])
      .addTo(map);
    
    routeMarkers.push(startMarker);
    
    // End marker (destination)
    const endEl = document.createElement('div');
    endEl.className = 'end-marker';
    endEl.style.width = '30px';
    endEl.style.height = '30px';
    endEl.style.backgroundImage = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="red" stroke="white" stroke-width="2"><circle cx="12" cy="12" r="10"/><text x="12" y="16" text-anchor="middle" fill="white" font-size="12px" font-family="Arial">D</text></svg>')`;
    
    const endMarker = new mapboxgl.Marker(endEl)
      .setLngLat([baseRoute[baseRoute.length - 1][0], baseRoute[baseRoute.length - 1][1]])
      .addTo(map);
    
    routeMarkers.push(endMarker);
  }
  
  // Set initial bounds to fit routes
  const coordinates = [...baseRoute, ...weatherRoute];
  const bounds = coordinates.reduce((bounds, coord) => {
    return bounds.extend(coord as mapboxgl.LngLatLike);
  }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));
  
  map.fitBounds(bounds, {
    padding: 50
  });

  // Add waypoint markers and weather warnings
  waypoints.forEach((waypoint, index) => {
    // Create waypoint marker
    const waypointEl = document.createElement('div');
    waypointEl.className = 'waypoint-marker';
    waypointEl.style.width = '24px';
    waypointEl.style.height = '24px';
    waypointEl.style.borderRadius = '50%';
    waypointEl.style.border = '2px solid white';
    waypointEl.style.backgroundColor = waypoint.isLocked ? '#f59e0b' : '#3b82f6';
    waypointEl.style.color = 'white';
    waypointEl.style.display = 'flex';
    waypointEl.style.alignItems = 'center';
    waypointEl.style.justifyContent = 'center';
    waypointEl.style.fontSize = '10px';
    waypointEl.style.fontWeight = 'bold';
    waypointEl.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
    waypointEl.textContent = (index + 1).toString();

    const waypointMarker = new mapboxgl.Marker(waypointEl)
      .setLngLat(waypoint.coordinates)
      .addTo(map);
    
    // Store marker for cleanup
    waypointMarkers.push(waypointMarker);

    // Add popup with waypoint information
    const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
      <div style="padding: 4px;">
        <strong>${waypoint.name}</strong><br>
        ${waypoint.coordinates[1].toFixed(6)}, ${waypoint.coordinates[0].toFixed(6)}<br>
        ${waypoint.isLocked ? '<span style="color: #f59e0b;">🔒 Locked</span>' : '<span style="color: #3b82f6;">🔓 Unlocked</span>'}
      </div>
    `);
    
    waypointMarker.setPopup(popup);

    // Add weather warning indicator (consolidated display)
    if (waypoint.weatherWarning) {
      const warningEl = document.createElement('div');
      warningEl.className = 'weather-warning-indicator';
      warningEl.style.width = '16px';
      warningEl.style.height = '16px';
      warningEl.style.backgroundColor = '#f59e0b';
      warningEl.style.borderRadius = '50%';
      warningEl.style.border = '2px solid white';
      warningEl.style.position = 'absolute';
      warningEl.style.top = '-8px';
      warningEl.style.right = '-8px';
      warningEl.style.display = 'flex';
      warningEl.style.alignItems = 'center';
      warningEl.style.justifyContent = 'center';
      warningEl.style.fontSize = '8px';
      warningEl.style.color = 'white';
      warningEl.style.fontWeight = 'bold';
      warningEl.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
      warningEl.textContent = '!';
      
      waypointEl.style.position = 'relative';
      waypointEl.appendChild(warningEl);
    }
  });
};

export const updateRouteVisibility = (
  map: mapboxgl.Map,
  activeRouteType: 'base' | 'weather'
) => {
  try {
    if (map.getLayer('base-route-line') && map.getLayer('weather-route-line')) {
      if (activeRouteType === 'base') {
        map.setLayoutProperty('base-route-line', 'visibility', 'visible');
        map.setLayoutProperty('weather-route-line', 'visibility', 'none');
      } else {
        map.setLayoutProperty('base-route-line', 'visibility', 'none');
        map.setLayoutProperty('weather-route-line', 'visibility', 'visible');
      }
    }
  } catch (error) {
    console.error("Error updating route visibility:", error);
  }
};
