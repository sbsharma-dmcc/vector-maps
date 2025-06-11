
import mapboxgl from 'mapbox-gl';

export interface Vessel {
  id: string;
  name: string;
  type: 'green' | 'orange' | 'circle';
  position: [number, number];
}

// Function to add a vessel to the Mapbox map with zoom-responsive sizing
const addVessel = (map: mapboxgl.Map, vessel: Vessel) => {
  if (!map) return null;
  
  // Validate vessel object
  if (!vessel || !vessel.position || !Array.isArray(vessel.position) || vessel.position.length !== 2) {
    console.error('Invalid vessel data. Vessel must have a position array [longitude, latitude]');
    return null;
  }
  
  // Determine vessel icon based on type
  let vesselIcon;
  if (vessel.type === 'circle') {
    vesselIcon = '/lovable-uploads/d4b87a52-a63f-4c54-9499-15bd05ef9037.png'; // Orange circle icon
  } else {
    vesselIcon = vessel.type === 'green' 
      ? '/lovable-uploads/0f873953-504d-4dad-92ca-1beb7dcadb7e.png' // New green vessel icon
      : '/lovable-uploads/014473a7-fb4d-4278-a424-5697503bb89a.png'; // New orange vessel icon
  }
  
  // Create a vessel marker element using the uploaded images
  const el = document.createElement('div');
  el.className = 'vessel-marker';
  el.style.position = 'relative';
  el.style.cursor = 'pointer';
  el.style.backgroundImage = `url(${vesselIcon})`;
  el.style.backgroundSize = 'contain';
  el.style.backgroundRepeat = 'no-repeat';
  el.style.backgroundPosition = 'center';
  
  // Function to calculate size based on zoom level
  const updateVesselSize = () => {
    const zoom = map.getZoom();
    // Base size is 24px at zoom level 6
    // Scale: higher zoom = larger size, lower zoom = smaller size (2x reduction)
    const baseSize = 24;
    const baseZoom = 6;
    const scaleFactor = Math.pow(0.75, zoom - baseZoom); // Inverse scaling for 2x reduction on zoom out
    const size = Math.max(6, Math.min(48, baseSize * scaleFactor)); // Clamp between 6px and 48px
    
    el.style.width = `${size}px`;
    
    // Different height ratios for different vessel types
    if (vessel.type === 'circle') {
      el.style.height = `${size}px`; // Square for circle vessels
    } else {
      el.style.height = `${size * 2}px`; // Height is double width for ship vessels
    }
  };
  
  // Set initial size
  updateVesselSize();
  
  // Create a mapbox marker with draggable disabled to lock position
  const marker = new mapboxgl.Marker({
    element: el,
    draggable: false // Lock the position
  })
    .setLngLat(vessel.position)
    .addTo(map);
  
  // Add zoom event listener to update size
  const handleZoom = () => {
    updateVesselSize();
  };
  
  map.on('zoom', handleZoom);
  
  // Store the cleanup function on the marker element for later removal
  (marker as any)._cleanupZoomListener = () => {
    map.off('zoom', handleZoom);
  };
  
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
  // Add CSS for vessel marker without animations or waves
  if (!document.getElementById('vessel-marker-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'vessel-marker-styles';
    styleSheet.textContent = `
      .vessel-marker {
        transform: rotate(45deg);
        transform-origin: center;
        cursor: pointer;
        transition: width 0.2s ease, height 0.2s ease;
      }
      
      .vessel-marker:hover {
        transform: rotate(45deg) scale(1.1);
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

  console.log(`Created ${vessels.length} vessel markers on the map with locked positions and zoom-responsive sizing`);
};

export const cleanupVesselMarkers = (
  markersRef: React.MutableRefObject<{ [key: string]: mapboxgl.Marker }>
) => {
  Object.values(markersRef.current).forEach(marker => {
    // Clean up zoom listener if it exists
    if ((marker as any)._cleanupZoomListener) {
      (marker as any)._cleanupZoomListener();
    }
    marker.remove();
  });
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
