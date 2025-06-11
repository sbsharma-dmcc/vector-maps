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
  // No longer creating vessel markers - function is now empty
  console.log('Vessel markers creation disabled');
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
