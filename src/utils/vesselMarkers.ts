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
    return '/lovable-uploads/0f873953-504d-4dad-92ca-1beb7dcadb7e.png'; // New green vessel icon
  } else {
    return '/lovable-uploads/014473a7-fb4d-4278-a424-5697503bb89a.png'; // New orange vessel icon
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

export const createVesselMarkers = async ( // Made async to handle image loading
  map: mapboxgl.Map,
  vessels: Vessel[],
  markersRef: React.MutableRefObject<{ [key: string]: mapboxgl.Marker }> // This ref will now store layer IDs or simply be empty if we're not using individual markers
) => {
  // Load vessel icons into the map's style
  const vesselTypes = ['green', 'orange', 'circle'] as VesselType[];
  const loadPromises = vesselTypes.map(type => {
    const iconId = `vessel-${type}-icon`;
    const iconUrl = getVesselIconPath(type);
    return loadImageToMap(map, iconId, iconUrl);
  });

  await Promise.all(loadPromises); // Wait for all images to load

  // Define source and layer IDs
  const sourceId = 'vessels-source';
  const layerId = 'vessels-layer';

  // --- CLEANUP EXISTING LAYERS AND SOURCES ---
  if (map.getLayer(layerId)) {
    map.removeLayer(layerId);
  }
  if (map.getSource(sourceId)) {
    map.removeSource(sourceId);
  }
  // No need to cleanup markersRef if we're not using individual HTML markers

  // Prepare GeoJSON features from vessel data
  const geojsonFeatures: GeoJSON.Feature[] = vessels.map(vessel => ({
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: vessel.position,
    },
    properties: {
      id: vessel.id,
      name: vessel.name,
      type: vessel.type,
      icon: `vessel-${vessel.type}-icon`, // This will reference the loaded image ID
    },
  }));

  const geojsonSource: GeoJSON.FeatureCollection = {
    type: 'FeatureCollection',
    features: geojsonFeatures,
  };

  // Add a GeoJSON source to the map
  map.addSource(sourceId, {
    type: 'geojson',
    data: geojsonSource,
  });

  const layers = map.getStyle().layers;
  const topLayer = layers.find(layer => layer.type === 'symbol' && layer.id.includes('label'));

  map.addLayer({
    id: layerId,
    type: 'symbol',
    source: sourceId,
    layout: {
      'icon-image': ['get', 'icon'],
      'icon-size': 0.2,
      'icon-allow-overlap': true,
      'icon-ignore-placement': true,
    },
    paint: {}
  }, 'vessel-layer');

  // Add click event for the layer to show popups
  map.on('click', layerId, (e) => {
    if (!e.features || e.features.length === 0) return;

    const feature = e.features[0];
    const vessel = {
      id: feature.properties?.id,
      name: feature.properties?.name,
      type: feature.properties?.type,
      position: feature.geometry && 'coordinates' in feature.geometry ? (feature.geometry.coordinates as [number, number]) : [0, 0]
    };

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

  // Optional: Change the cursor to a pointer when hovering over the vessels layer
  map.on('mouseenter', layerId, () => {
    map.getCanvas().style.cursor = 'pointer';
  });
  map.on('mouseleave', layerId, () => {
    map.getCanvas().style.cursor = '';
  });

  console.log(`Created ${vessels.length} vessel markers on the map using a symbol layer for stable positioning and constant sizing.`);
};

// --- CLEANUP ---
export const cleanupVesselMarkers = (
  map: mapboxgl.Map, // Now needs the map instance to remove layers/sources
  markersRef: React.MutableRefObject<{ [key: string]: mapboxgl.Marker }>
) => {
  const layerId = 'vessels-layer';
  const sourceId = 'vessels-source';

  // Remove the layer and source if they exist
  if (map.getLayer(layerId)) {
    map.removeLayer(layerId);
  }
  if (map.getSource(sourceId)) {
    map.removeSource(sourceId);
  }

  // If you were previously storing mapboxgl.Marker instances in markersRef,
  // this loop will still be useful for removing any lingering ones
  Object.values(markersRef.current).forEach(marker => {
    marker.remove();
  });
  markersRef.current = {};
  
  // Remove the styles as they are still useful for the hover effect and popup styling
  const existingStyle = document.getElementById('vessel-marker-styles');
  if (existingStyle) {
    existingStyle.remove();
  }
  
  const existingPopupStyle = document.getElementById('vessel-popup-styles');
  if (existingPopupStyle) {
    existingPopupStyle.remove();
  }
  console.log('Cleaned up vessel layers and sources.');
};