
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useToast } from '@/hooks/use-toast';
import { Search, MapPin } from 'lucide-react';

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
  const [mapToken, setMapToken] = useState<string>(
    accessToken || 'pk.eyJ1IjoiZ2Vvc2VydmUiLCJhIjoiY201Z2J3dXBpMDU2NjJpczRhbmJubWtxMCJ9.6Kw-zTqoQcNdDokBgbI5_Q'
  );
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
      // Initialize map with the provided style
      mapboxgl.accessToken = mapToken;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/geoserve/cm5kwbsxd003w01sabztwggic",
        center: [83.167, 6.887],
        zoom: 4,
        attributionControl: false
      });

      // Add navigation controls
      map.current.addControl(
        new mapboxgl.NavigationControl(),
        'bottom-right'
      );

      // Add zoom controls
      map.current.scrollZoom.enable();

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

  // If the map is already initialized, render the map with top controls
  if (mapToken) {
    return (
      <div className="relative h-full w-full bg-[#2B67AF]">
        {/* Top controls similar to Figma design */}
        <div className="absolute top-0 left-0 right-0 z-10 flex justify-between items-center p-2">
          <div className="flex items-center bg-white rounded-md shadow-sm">
            <Search className="h-5 w-5 ml-2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search vessel or IMO" 
              className="py-2 px-2 bg-transparent outline-none text-sm w-56"
            />
          </div>
          
          <div className="flex gap-3">
            <button className="flex items-center bg-blue-500 text-white rounded-md px-3 py-2 text-sm shadow-sm">
              <span className="mr-1">+</span> New Voyage
            </button>
            
            <div className="flex items-center bg-white rounded-md shadow-sm px-3 py-2">
              <span className="text-sm mr-1">Notifications Feed</span>
              <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">5</span>
            </div>
          </div>
        </div>

        {/* Map container */}
        <div ref={mapContainer} className="absolute inset-0" />
      </div>
    );
  }

  // Show token input form if token not provided
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
};

export default MapboxMap;
