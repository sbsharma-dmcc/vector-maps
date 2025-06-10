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
    .vessel-marker {
      cursor: pointer;
      animation: pulse-vessel 2s infinite;
      background-size: contain;
      background-repeat: no-repeat;
      background-position: center;
      z-index: 1000; /* Ensure vessels are always on top */
      position: relative;
    }
  `;
  
  // Remove existing style if it exists to avoid duplicates
  const existingStyle = document.getElementById('vessel-marker-styles');
  if (existingStyle) {
    existingStyle.remove();
  }
  
  style.id = 'vessel-marker-styles';
  document.head.appendChild(style);

  // Create markers for vessels
  vessels.forEach(vessel => {
    // Create marker element
    const el = document.createElement('div');
    el.className = `vessel-marker vessel-${vessel.type}`;
    el.style.width = '32px';
    el.style.height = '32px';
    el.style.zIndex = '1000'; // High z-index to stay above all map layers
    
    // Set vessel icon based on type
    if (vessel.type === 'green') {
      el.style.backgroundImage = 'url(/lovable-uploads/bac70112-c289-455d-b1f4-bf971d707074.png)';
    } else {
      el.style.backgroundImage = 'url(/lovable-uploads/5acc9290-e173-4374-919d-745dc9a3c599.png)';
    }
    
    // Create popup
    const popup = new mapboxgl.Popup({ 
      offset: 25,
      className: 'vessel-popup'
    })
      .setHTML(`
        <div class="p-2">
          <h3 class="font-bold text-sm">${vessel.name}</h3>
          <p class="text-xs text-gray-600">Vessel ID: ${vessel.id}</p>
          <p class="text-xs text-gray-600">Type: ${vessel.type}</p>
          <p class="text-xs text-gray-600">Position: ${vessel.position[1].toFixed(4)}, ${vessel.position[0].toFixed(4)}</p>
        </div>
      `);

    // Create and store marker with high z-index
    const marker = new mapboxgl.Marker({
      element: el,
      anchor: 'center'
    })
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
  markersRef.current = {};
  
  // Also remove the styles to keep DOM clean
  const existingStyle = document.getElementById('vessel-marker-styles');
  if (existingStyle) {
    existingStyle.remove();
  }
};
