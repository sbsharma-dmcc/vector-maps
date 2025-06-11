
import mapboxgl from 'mapbox-gl';

export interface Vessel {
  id: string;
  name: string;
  type: 'green' | 'orange';
  position: [number, number];
}

// Convert coordinates from degrees/minutes/seconds to decimal degrees
const convertDMSToDecimal = (degrees: number, minutes: number, seconds: number, direction: 'N' | 'S' | 'E' | 'W') => {
  let decimal = degrees + minutes / 60 + seconds / 60 / 60;
  if (direction === 'S' || direction === 'W') {
    decimal = -decimal;
  }
  return decimal;
};

// Vessel coordinates converted from DMS to decimal degrees
const vesselCoordinates: [number, number][] = [
  [convertDMSToDecimal(117, 6, 11, 'W'), convertDMSToDecimal(32, 32, 10, 'N')],
  [convertDMSToDecimal(117, 7, 29, 'W'), convertDMSToDecimal(32, 32, 4, 'N')],
  [convertDMSToDecimal(117, 14, 20, 'W'), convertDMSToDecimal(32, 31, 39, 'N')],
  [convertDMSToDecimal(117, 15, 50, 'W'), convertDMSToDecimal(32, 33, 13, 'N')],
  [convertDMSToDecimal(117, 22, 1, 'W'), convertDMSToDecimal(32, 34, 21, 'N')],
  [convertDMSToDecimal(117, 27, 53, 'W'), convertDMSToDecimal(32, 35, 23, 'N')],
  [convertDMSToDecimal(117, 49, 34, 'W'), convertDMSToDecimal(32, 37, 38, 'N')],
  [convertDMSToDecimal(118, 36, 21, 'W'), convertDMSToDecimal(31, 7, 59, 'N')],
  [convertDMSToDecimal(121, 47, 29, 'W'), convertDMSToDecimal(30, 33, 25, 'N')],
  [convertDMSToDecimal(123, 17, 22, 'W'), convertDMSToDecimal(31, 46, 11, 'N')],
  [convertDMSToDecimal(123, 50, 44, 'W'), convertDMSToDecimal(32, 21, 58, 'N')],
  [convertDMSToDecimal(124, 11, 47, 'W'), convertDMSToDecimal(32, 56, 39, 'N')],
  [convertDMSToDecimal(124, 27, 15, 'W'), convertDMSToDecimal(33, 40, 12, 'N')],
  [convertDMSToDecimal(125, 16, 52, 'W'), convertDMSToDecimal(34, 31, 28, 'N')],
  [convertDMSToDecimal(125, 43, 23, 'W'), convertDMSToDecimal(35, 14, 38, 'N')]
];

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

  // Create markers for each coordinate
  vesselCoordinates.forEach((position, index) => {
    // Create marker element
    const el = document.createElement('div');
    el.className = `vessel-marker vessel-${index % 2 === 0 ? 'green' : 'orange'}`;
    el.style.width = '36px';
    el.style.height = '36px';
    el.style.zIndex = '9999';
    el.style.position = 'relative';
    
    // Set vessel icon based on index (alternating green/orange)
    if (index % 2 === 0) {
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
          <h3 class="font-bold text-sm text-gray-800">Vessel ${index + 1}</h3>
          <p class="text-xs text-gray-600 mt-1">Vessel ID: vessel-${index + 1}</p>
          <p class="text-xs text-gray-600">Type: ${index % 2 === 0 ? 'green' : 'orange'}</p>
          <p class="text-xs text-gray-600">Position: ${position[1].toFixed(6)}, ${position[0].toFixed(6)}</p>
        </div>
      `);

    // Create and store marker with maximum z-index
    const marker = new mapboxgl.Marker({
      element: el,
      anchor: 'center'
    })
      .setLngLat(position)
      .setPopup(popup)
      .addTo(map);
      
    // Ensure marker element stays on top
    const markerElement = marker.getElement();
    markerElement.style.zIndex = '9999';
    markerElement.style.position = 'relative';
      
    markersRef.current[`vessel-${index + 1}`] = marker;
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

  console.log(`Created ${vesselCoordinates.length} vessel markers at specified coordinates`);
};

export const cleanupVesselMarkers = (
  markersRef: React.MutableRefObject<{ [key: string]: mapboxgl.Marker }>
) => {
  Object.values(markersRef.current).forEach(marker => marker.remove());
  markersRef.current = {};
  
  // Remove the styles to keep DOM clean
  const existingStyle = document.getElementById('vessel-marker-styles');
  if (existingStyle) {
    existingStyle.remove();
  }
  
  const existingPopupStyle = document.getElementById('vessel-popup-styles');
  if (existingPopupStyle) {
    existingPopupStyle.remove();
  }
};
