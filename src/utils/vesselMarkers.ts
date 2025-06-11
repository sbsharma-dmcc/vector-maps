
import mapboxgl from 'mapbox-gl';

export interface Vessel {
  id: string;
  name: string;
  type: 'green' | 'orange';
  position: [number, number];
}

// Function to add a vessel to the Mapbox map (similar to your addVessel function)
const addVessel = (map: mapboxgl.Map, vessel: Vessel) => {
  if (!map) return null;
  
  // Validate vessel object
  if (!vessel || !vessel.position || !Array.isArray(vessel.position) || vessel.position.length !== 2) {
    console.error('Invalid vessel data. Vessel must have a position array [longitude, latitude]');
    return null;
  }
  
  // Determine vessel icon based on type
  const vesselIcon = vessel.type === 'green' 
    ? '/lovable-uploads/3412ff3e-3f5b-40d9-9e58-82c3aadb0f87.png' // Green vessel icon
    : '/lovable-uploads/c7ec5352-98e3-4d7a-9def-51dc534f4385.png'; // Orange vessel icon
  
  // Create a vessel marker element using the uploaded images
  const el = document.createElement('div');
  el.className = 'vessel-marker';
  el.style.width = '24px';
  el.style.height = '48px';
  el.style.position = 'relative';
  el.style.cursor = 'pointer';
  el.style.backgroundImage = `url(${vesselIcon})`;
  el.style.backgroundSize = 'contain';
  el.style.backgroundRepeat = 'no-repeat';
  el.style.backgroundPosition = 'center';
  
  // Add waves effect
  const wavesEl = document.createElement('div');
  wavesEl.className = 'vessel-waves';
  wavesEl.style.position = 'absolute';
  wavesEl.style.right = '-8px';
  wavesEl.style.top = '15px';
  wavesEl.innerHTML = ')))';
  wavesEl.style.fontSize = '12px';
  wavesEl.style.color = vessel.type === 'green' ? '#4ade80' : '#fb923c';
  wavesEl.style.fontWeight = 'bold';
  el.appendChild(wavesEl);
  
  // Create a mapbox marker
  const marker = new mapboxgl.Marker(el)
    .setLngLat(vessel.position)
    .addTo(map);
  
  // Add click event handler for vessel popup
  marker.getElement().addEventListener('click', () => {
    // Create popup content
    const popupContent = `
      <div style="padding: 10px; font-family: Arial, sans-serif;">
        <h3 style="margin: 0 0 5px 0; font-size: 14px; font-weight: bold;">${vessel.name}</h3>
        <p style="margin: 0; font-size: 12px; color: #666;">
          Type: ${vessel.type.charAt(0).toUpperCase() + vessel.type.slice(1)} Vessel<br>
          Position: ${vessel.position[1].toFixed(3)}°N, ${vessel.position[0].toFixed(3)}°E
        </p>
      </div>
    `;
    
    new mapboxgl.Popup({ offset: 25 })
      .setLngLat(vessel.position)
      .setHTML(popupContent)
      .addTo(map);
  });
  
  // Return the marker for later reference or removal
  return marker;
};

export const createVesselMarkers = (
  map: mapboxgl.Map,
  vessels: Vessel[],
  markersRef: React.MutableRefObject<{ [key: string]: mapboxgl.Marker }>
) => {
  // Add CSS for vessel marker animation if not already in document
  if (!document.getElementById('vessel-marker-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'vessel-marker-styles';
    styleSheet.textContent = `
      .vessel-marker {
        transform: rotate(45deg);
        transform-origin: center;
        cursor: pointer;
        transition: transform 0.2s ease;
      }
      
      .vessel-marker:hover {
        transform: rotate(45deg) scale(1.1);
      }
      
      .vessel-waves {
        transform: rotate(-45deg);
      }
      
      @keyframes pulse {
        0% { opacity: 0.4; }
        50% { opacity: 1; }
        100% { opacity: 0.4; }
      }
      
      .vessel-waves {
        animation: pulse 1.5s infinite;
      }
    `;
    document.head.appendChild(styleSheet);
  }

  // Add vessel popup styles if not already in document
  if (!document.getElementById('vessel-popup-styles')) {
    const popupStyleSheet = document.createElement('style');
    popupStyleSheet.id = 'vessel-popup-styles';
    popupStyleSheet.textContent = `
      .mapboxgl-popup-content {
        border-radius: 8px !important;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
      }
      
      .mapboxgl-popup-close-button {
        font-size: 16px !important;
        padding: 4px !important;
      }
    `;
    document.head.appendChild(popupStyleSheet);
  }

  // Create vessel markers
  vessels.forEach(vessel => {
    const marker = addVessel(map, vessel);
    if (marker) {
      markersRef.current[vessel.id] = marker;
    }
  });

  console.log(`Created ${vessels.length} vessel markers on the map`);
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
