
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useToast } from '@/hooks/use-toast';

interface MapboxMapProps {
  vessels: {
    id: string;
    name: string;
    type: 'green' | 'orange';
    position: [number, number];
  }[];
  accessToken?: string;
}

const MapboxMap: React.FC<MapboxMapProps> = ({ vessels, accessToken }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const [mapToken, setMapToken] = useState<string>(accessToken || '');
  const { toast } = useToast();

  // If no access token is provided, ask the user to input one
  const handleTokenSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const token = formData.get('token') as string;
    if (token) {
      setMapToken(token);
    } else {
      toast({
        title: "Error",
        description: "Please enter a valid Mapbox access token",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (!mapToken || !mapContainer.current) return;

    try {
      // Initialize map
      mapboxgl.accessToken = mapToken;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/navigation-night-v1', // Dark blue style for the ocean
        center: [0, 20], // Center on the Atlantic Ocean
        zoom: 2,
      });

      // Add navigation controls
      map.current.addControl(
        new mapboxgl.NavigationControl(),
        'top-right'
      );

      // Add zoom controls
      map.current.scrollZoom.enable();

      // Create markers for vessels
      vessels.forEach(vessel => {
        // Create marker element
        const el = document.createElement('div');
        el.className = `vessel-marker vessel-${vessel.type}`;
        el.style.width = '16px';
        el.style.height = '16px';
        el.style.borderRadius = '50%';
        el.style.backgroundColor = vessel.type === 'green' ? '#4ade80' : '#fb923c';
        el.style.border = '2px solid white';
        el.style.animation = 'pulse-vessel 2s infinite';
        el.style.cursor = 'pointer';
        
        // Create popup
        const popup = new mapboxgl.Popup({ offset: 25 })
          .setHTML(`<h3 class="font-bold">${vessel.name}</h3><p>Vessel ID: ${vessel.id}</p>`);

        // Create and store marker
        const marker = new mapboxgl.Marker(el)
          .setLngLat(vessel.position)
          .setPopup(popup)
          .addTo(map.current!);
          
        markersRef.current[vessel.id] = marker;
      });

      // Cleanup
      return () => {
        map.current?.remove();
        Object.values(markersRef.current).forEach(marker => marker.remove());
      };
    } catch (error) {
      console.error("Error initializing map:", error);
      toast({
        title: "Map Error",
        description: "Failed to initialize the map. Please check your access token.",
        variant: "destructive"
      });
    }
  }, [mapToken, vessels]);

  if (!mapToken) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100 p-4">
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-xl font-bold mb-4">Mapbox Access Token Required</h2>
          <p className="mb-4 text-gray-700">
            To view the vessel tracking map, please enter your Mapbox public access token.
            You can find this in your Mapbox account dashboard.
          </p>
          <form onSubmit={handleTokenSubmit} className="space-y-4">
            <div>
              <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-1">
                Mapbox Access Token:
              </label>
              <input 
                type="text" 
                id="token" 
                name="token" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="pk.eyJ1IjoieW91..." 
                required
              />
            </div>
            <button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
            >
              Load Map
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <div ref={mapContainer} className="absolute inset-0" />
    </div>
  );
};

export default MapboxMap;
