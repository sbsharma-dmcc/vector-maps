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
      0% { transform: scale(1); opacity: 0.9; }
      50% { transform: scale(1.15); opacity: 1; }
      100% { transform: scale(1); opacity: 0.9; }
    }
    .vessel-marker {
      cursor: pointer;
      animation: pulse-vessel 2.5s infinite;
      background-size: contain;
      background-repeat: no-repeat;
      background-position: center;
      z-index: 9999 !important;
      position: relative;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
      border-radius: 50%;
    }
    .vessel-marker:hover {
      transform: scale(1.2) !important;
      animation-play-state: paused;
      filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.5));
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
    el.style.width = '36px';
    el.style.height = '36px';
    el.style.zIndex = '9999';
    el.style.position = 'relative';
    
    // Set vessel icon based on type
    if (vessel.type === 'green') {
      el.style.backgroundImage = 'url(/lovable-uploads/bac70112-c289-455d-b1f4-bf971d707074.png)';
    } else {
      el.style.backgroundImage = 'url(/lovable-uploads/5acc9290-e173-4374-919d-745dc9a3c599.png)';
    }
    
    // Create popup with higher z-index
    const popup = new mapboxgl.Popup({ 
      offset: 30,
      className: 'vessel-popup',
      closeOnClick: false,
      closeButton: true
    })
      .setHTML(`
        <div class="p-3 bg-white rounded-lg shadow-lg" style="z-index: 10000;">
          <h3 class="font-bold text-sm text-gray-800">${vessel.name}</h3>
          <p class="text-xs text-gray-600 mt-1">Vessel ID: ${vessel.id}</p>
          <p class="text-xs text-gray-600">Type: ${vessel.type}</p>
          <p class="text-xs text-gray-600">Position: ${vessel.position[1].toFixed(4)}, ${vessel.position[0].toFixed(4)}</p>
        </div>
      `);

    // Create and store marker with maximum z-index
    const marker = new mapboxgl.Marker({
      element: el,
      anchor: 'center'
    })
      .setLngLat(vessel.position)
      .setPopup(popup)
      .addTo(map);
      
    // Ensure marker element stays on top
    const markerElement = marker.getElement();
    markerElement.style.zIndex = '9999';
    markerElement.style.position = 'relative';
      
    markersRef.current[vessel.id] = marker;
  });
  
  // Add custom CSS to ensure vessel popups are always on top
  const popupStyle = document.createElement('style');
  popupStyle.textContent = `
    .vessel-popup .mapboxgl-popup-content {
      z-index: 10000 !important;
      position: relative;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    .vessel-popup .mapboxgl-popup-tip {
      z-index: 10000 !important;
    }
  `;
  popupStyle.id = 'vessel-popup-styles';
  
  const existingPopupStyle = document.getElementById('vessel-popup-styles');
  if (existingPopupStyle) {
    existingPopupStyle.remove();
  }
  
  document.head.appendChild(popupStyle);
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
  
  const existingPopupStyle = document.getElementById('vessel-popup-styles');
  if (existingPopupStyle) {
    existingPopupStyle.remove();
  }
};
