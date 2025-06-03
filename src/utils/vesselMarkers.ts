
import mapboxgl from 'mapbox-gl';

export interface Vessel {
  id: string;
  name: string;
  type: 'green' | 'orange';
  position: [number, number];
}

export const createVesselMarkers = (
  map: mapboxgl.Map,
  vessels: Vessel[],
  markersRef: React.MutableRefObject<{ [key: string]: mapboxgl.Marker }>
) => {
  // Create animation keyframes for vessel markers
  const style = document.createElement('style');
  style.textContent = `
    @keyframes pulse-vessel {
      0% { transform: scale(1); opacity: 0.8; }
      50% { transform: scale(1.1); opacity: 1; }
      100% { transform: scale(1); opacity: 0.8; }
    }
  `;
  document.head.appendChild(style);

  // Create markers for vessels
  vessels.forEach(vessel => {
    // Create marker element
    const el = document.createElement('div');
    el.className = `vessel-marker vessel-${vessel.type}`;
    el.style.width = '20px';
    el.style.height = '10px';
    el.style.borderRadius = '10px';
    el.style.backgroundColor = vessel.type === 'green' ? '#4ade80' : '#fb923c';
    el.style.animation = 'pulse-vessel 2s infinite';
    el.style.cursor = 'pointer';
    
    // Create popup
    const popup = new mapboxgl.Popup({ offset: 25 })
      .setHTML(`<h3 class="font-bold">${vessel.name}</h3><p>Vessel ID: ${vessel.id}</p>`);

    // Create and store marker
    const marker = new mapboxgl.Marker(el)
      .setLngLat(vessel.position)
      .setPopup(popup)
      .addTo(map);
      
    markersRef.current[vessel.id] = marker;
  });
};

export const cleanupVesselMarkers = (
  markersRef: React.MutableRefObject<{ [key: string]: mapboxgl.Marker }>
) => {
  Object.values(markersRef.current).forEach(marker => marker.remove());
};
