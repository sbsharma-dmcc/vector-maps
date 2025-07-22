import mapboxgl from 'mapbox-gl';

export interface Vessel {
  id: string;
  name: string;
  type: 'green' | 'orange' | 'circle';
  position: [number, number];
}

export type VesselType = 'green' | 'orange' | 'circle';

// No longer need addVessel as a separate function for HTML markers
// We will manage icons via Mapbox layers

// Helper to get the correct image path
const getVesselIconPath = (type: VesselType) => {
  if (type === 'circle') {
    return '/lovable-uploads/d4b87a52-a63f-4c54-9499-15bd05ef9037.png'; // Orange circle icon
  } else if (type === 'green') {
    return '/lovable-uploads/Variant12.png'; // New green vessel icon
  } else {
    return '/lovable-uploads/Variant13.png'; // New orange vessel icon
  }
};

// Function to load image into Mapbox map
const loadImageToMap = (map: mapboxgl.Map, id: string, url: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (map.hasImage(id)) {
      resolve(); // Image already loaded
      return;
    }
    map.loadImage(url, (error, image) => {
      if (error) {
        console.error(`Failed to load image ${id}:`, error);
        reject(error);
        return;
      }
      if (image) {
        map.addImage(id, image);
        resolve();
      } else {
        reject(new Error(`Image data is null for ${id}`));
      }
    });
  });
};

export const createVesselMarkers = (
  map: mapboxgl.Map,
  vessels: Vessel[],
  markersRef: React.MutableRefObject<{ [key: string]: mapboxgl.Marker }>,
  onVesselDragEnd: (vesselId: string, newPosition: [number, number]) => void
) => {
  // Cleanup existing markers before creating new ones
  Object.values(markersRef.current).forEach(marker => marker.remove());
  markersRef.current = {};

  vessels.forEach(vessel => {
    const el = document.createElement('div');
    el.className = 'vessel-marker';
    el.style.backgroundImage = `url(${getVesselIconPath(vessel.type)})`;
    el.style.width = '10px';
    el.style.height = '30px';
    el.style.backgroundSize = 'contain';
    el.style.cursor = 'pointer';

    const marker = new mapboxgl.Marker({
      element: el,
      draggable: true
    })
    .setLngLat(vessel.position)
    .addTo(map);

    marker.on('dragend', () => {
      const lngLat = marker.getLngLat();
      const newPosition: [number, number] = [lngLat.lng, lngLat.lat];
      onVesselDragEnd(vessel.id, newPosition);
    });

    // Add a popup to the marker
    const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
      <div style="padding: 10px; font-family: Arial, sans-serif;">
        <h3 style="margin: 0 0 5px 0; font-size: 14px; font-weight: bold;">${vessel.name}</h3>
        <p style="margin: 0; font-size: 12px; color: #666;">
          Type: ${vessel.type.charAt(0).toUpperCase() + vessel.type.slice(1)} Vessel<br>
          Position: ${vessel.position[1].toFixed(3)}°N, ${vessel.position[0].toFixed(3)}°E
        </p>
      </div>
    `);
    marker.setPopup(popup);

    markersRef.current[vessel.id] = marker;
  });

  console.log(`Created ${vessels.length} draggable vessel markers.`);
};

// --- CLEANUP ---
export const cleanupVesselMarkers = (
  map: mapboxgl.Map,
  markersRef: React.MutableRefObject<{ [key: string]: mapboxgl.Marker }>
) => {
  // Remove markers
  Object.values(markersRef.current).forEach(marker => marker.remove());
  markersRef.current = {};

  // Remove old layer and source if they somehow still exist from a previous version
  if (map.getLayer('vessels-layer')) {
    map.removeLayer('vessels-layer');
  }
  if (map.getSource('vessels-source')) {
    map.removeSource('vessels-source');
  }
  
  console.log('Cleaned up vessel markers and any old layers/sources.');
};