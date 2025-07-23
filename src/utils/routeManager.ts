
import mapboxgl from 'mapbox-gl';

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
    
    new mapboxgl.Marker(startEl)
      .setLngLat([baseRoute[0][0], baseRoute[0][1]])
      .addTo(map);
    
    // End marker (destination)
    const endEl = document.createElement('div');
    endEl.className = 'end-marker';
    endEl.style.width = '30px';
    endEl.style.height = '30px';
    endEl.style.backgroundImage = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="red" stroke="white" stroke-width="2"><circle cx="12" cy="12" r="10"/><text x="12" y="16" text-anchor="middle" fill="white" font-size="12px" font-family="Arial">D</text></svg>')`;
    
    new mapboxgl.Marker(endEl)
      .setLngLat([baseRoute[baseRoute.length - 1][0], baseRoute[baseRoute.length - 1][1]])
      .addTo(map);
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

    // Add popup with waypoint information
    const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
      <div style="padding: 4px;">
        <strong>${waypoint.name}</strong><br>
        ${waypoint.coordinates[1].toFixed(6)}, ${waypoint.coordinates[0].toFixed(6)}<br>
        ${waypoint.isLocked ? '<span style="color: #f59e0b;">🔒 Locked</span>' : '<span style="color: #3b82f6;">🔓 Unlocked</span>'}
      </div>
    `);
    
    waypointMarker.setPopup(popup);

    // Add weather warning overlay if present
    if (waypoint.weatherWarning) {
      const warningEl = document.createElement('div');
      warningEl.className = 'weather-warning';
      warningEl.style.position = 'absolute';
      warningEl.style.top = '-40px';
      warningEl.style.left = '50%';
      warningEl.style.transform = 'translateX(-50%)';
      warningEl.style.backgroundColor = '#fbbf24';
      warningEl.style.color = '#92400e';
      warningEl.style.padding = '4px 8px';
      warningEl.style.borderRadius = '4px';
      warningEl.style.fontSize = '11px';
      warningEl.style.fontWeight = 'bold';
      warningEl.style.whiteSpace = 'nowrap';
      warningEl.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
      warningEl.style.border = '1px solid #f59e0b';
      warningEl.textContent = `⚠️ ${waypoint.weatherWarning}`;
      
      // Create warning marker
      const warningMarker = new mapboxgl.Marker({
        element: warningEl,
        anchor: 'bottom'
      })
        .setLngLat([waypoint.coordinates[0], waypoint.coordinates[1] + 0.01]) // Slightly offset
        .addTo(map);
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
