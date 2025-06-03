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
  showRoutes?: boolean;
  baseRoute?: [number, number][];
  weatherRoute?: [number, number][];
  activeRouteType?: 'base' | 'weather';
  activeLayers?: Record<string, boolean>;
  activeBaseLayer?: string;
}

const MapboxMap: React.FC<MapboxMapProps> = ({ 
  vessels, 
  accessToken,
  showRoutes = false,
  baseRoute = [],
  weatherRoute = [],
  activeRouteType = 'base',
  activeLayers = {},
  activeBaseLayer = 'default'
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const baseRouteRef = useRef<mapboxgl.GeoJSONSource | null>(null);
  const weatherRouteRef = useRef<mapboxgl.GeoJSONSource | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapToken, setMapToken] = useState<string>(
    accessToken || 'pk.eyJ1IjoiZ2Vvc2VydmUiLCJhIjoiY201Z2J3dXBpMDU2NjJpczRhbmJubWtxMCJ9.6Kw-zTqoQcNdDokBgbI5_Q'
  );
  const { toast } = useToast();

  // DTN API token for weather layers
  const dtnToken = "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InpfX21pZW13NGhoTmdvQWQxR3N6ciJ9.eyJodHRwczovL2F1dGguZHRuLmNvbS9hY2NvdW50SWQiOiIyNTY1Mzk5IiwiaHR0cHM6Ly9hdXRoLmR0bi5jb20vdmVuZG9ySWQiOiJ1bmtub3duIiwiaHR0cHM6Ly9hdXRoLmR0bi5jb20vY3VzdG9tZXJJZCI6IjI1NjUzOTkiLCJodHRwczovL2F1dGguZHRuLmNvbS9wcm9kdWN0Q29kZSI6IkRUTld4QVBJXzI1NjUzOTkiLCJodHRwczovL2F1dGguZHRuLmNvbS9yZXF1ZXN0ZXJJcCI6IjE4LjIxMy4xNzQuMjciLCJodHRwczovL2F1dGguZHRuLmNvbS9ycHMiOiIyNTAiLCJodHRwczovL2F1dGguZHRuLmNvbS90aWVyIjoiRW50ZXJwcmlzZSIsImh0dHBzOi8vYXV0aC5kdG4uY29tL3F1b3RhIjoiMTAwMDAwIiwiaHR0cHM6Ly9hdXRoLmR0bi5jb20vYXJlYVNpemUiOiIwIiwiaXNzIjoiaHR0cHM6Ly9pZC5hdXRoLmR0bi5jb20vIiwic3ViIjoiRnpGbHZJajNjUFBhejhlc3B5ckhEN0FySnVlY0xOR1BAY2xpZW50cyIsImF1ZCI6Imh0dHBzOi8vbWFwLmFwaS5kdG4uY29tIiwiaWF0IjoxNzQ4OTM1Njk4LCJleHAiOjE3NDkwMjIwOTgsInNjb3BlIjoicmVhZDpjYXRhbG9nLWRlZmF1bHQgd2VhdGhlci5tYXAuY2F0YWxvZy1wbHVzOnJlYWQiLCJndHkiOiJjbGllbnQtY3JlZGVudGlhbHMiLCJhenAiOiJGekZsdklqM2NQUGF6OGVzcHlySEQ3QXJKdWVjTE5HUCIsInBlcm1pc3Npb25zIjpbInJlYWQ6Y2F0YWxvZy1kZWZhdWx0Iiwid2VhdGhlci5tYXAuY2F0YWxvZy1wbHVzOnJlYWQiXX0.19iCQXTMcrWkN0WC6NJYtwJ3tIh7-7Jnk_E37ndlbIXzGV9ckkJFeXJyQAFRRqNMnTZxRmuf3QWy5YZHsbwt-EeEIEIBJS5nJqnqSaBs5tpX1C072Bf-GFV3fOnailne6BUT9GNkJ2TUEvpbsbmGsFZn47E0a8vJC-szKrB9ETVkEHlnSED7KvFC6t6pnfI5khmgbQK1Fwxw6RpXaacqy1iObJmMdOMiNPQxUHt0fF2jkbItDDV3QGVihQ-UWZ2eeJsMoUE8ELr_5Vov0gPQv8keezfUtRxXFeuT2LS9Ryc69kan2JxYQWFg76LydTg6t9CR1t0R7ftXnBXtoFk5SQ";

  // Layer configurations for DTN API
  const layerConfigs = {
    pressure: { dtnLayerId: 'pressure', tileSetId: 'pressure-latest' },
    storm: { dtnLayerId: 'storm', tileSetId: 'storm-latest' },
    current: { dtnLayerId: 'current', tileSetId: 'current-latest' },
    wind: { dtnLayerId: 'fcst-onefx-wind-speed-contours', tileSetId: '1fed7688-ee77-4c15-acfa-3e6d5d0fb2a9' }
  };

  // Base layer styles
  const baseLayerStyles = {
    default: "mapbox://styles/geoserve/cmb8z5ztq00rw01qxauh6gv66",
    swell: "mapbox://styles/geoserve/cmb8z5ztq00rw01qxauh6gv66",
    wave: "mapbox://styles/geoserve/cmb8z5ztq00rw01qxauh6gv66"
  };

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

  // Function to add or update weather layer
  const updateWeatherLayer = (layerType: string, enabled: boolean) => {
    // Add comprehensive safety checks
    if (!map.current || !mapReady) {
      console.log(`Map not ready, skipping layer update for ${layerType}`);
      return;
    }

    // Additional safety check to ensure map methods exist
    if (typeof map.current.getSource !== 'function' || typeof map.current.getLayer !== 'function') {
      console.log(`Map methods not available, skipping layer update for ${layerType}`);
      return;
    }

    const sourceId = `${layerType}-layer`;
    const layerId = `${layerType}-layer-render`;
    const config = layerConfigs[layerType as keyof typeof layerConfigs];
    
    if (!config) return;

    console.log(`Updating weather layer ${layerType}, enabled: ${enabled}`);

    try {
      if (enabled) {
        // Add or update the source
        if (!map.current.getSource(sourceId)) {
          console.log("Adding new source:", sourceId);
          map.current.addSource(sourceId, {
            type: "raster",
            tiles: [
              `https://map.api.dtn.com/v2/tiles/${config.dtnLayerId}/${config.tileSetId}/{z}/{x}/{y}.webp?size=512&unit=metric-marine&token=${dtnToken}`,
            ],
            tileSize: 512,
          });
        }

        // Add layer if it doesn't exist - add it as the top layer
        if (!map.current.getLayer(layerId)) {
          console.log("Adding new layer:", layerId);
          map.current.addLayer({
            id: layerId,
            type: "raster",
            source: sourceId,
            paint: {
              "raster-opacity": 0.9
            }
          });
        } else {
          console.log("Updating existing layer:", layerId);
          // Make sure layer is visible and update opacity
          map.current.setLayoutProperty(layerId, 'visibility', 'visible');
          map.current.setPaintProperty(layerId, 'raster-opacity', 0.9);
        }
        
        toast({
          title: `${layerType.charAt(0).toUpperCase() + layerType.slice(1)} Layer`,
          description: `Successfully loaded ${layerType} overlay`
        });
      } else {
        // Hide the layer
        if (map.current.getLayer(layerId)) {
          console.log("Hiding layer:", layerId);
          map.current.setLayoutProperty(layerId, 'visibility', 'none');
        }
      }
    } catch (error) {
      console.error(`Error updating weather layer ${layerType}:`, error);
      toast({
        title: "Layer Error",
        description: `Failed to update ${layerType} layer`,
        variant: "destructive"
      });
    }
  };

  // Update layers when activeLayers changes - only when map is ready
  useEffect(() => {
    if (!mapReady || !map.current) {
      console.log("Map not ready, skipping layer updates");
      return;
    }

    console.log("Active layers changed:", activeLayers);
    Object.entries(activeLayers).forEach(([layerType, enabled]) => {
      updateWeatherLayer(layerType, enabled);
    });
  }, [activeLayers, mapReady]);

  // Update base layer when activeBaseLayer changes
  useEffect(() => {
    if (!map.current || !mapReady) return;

    try {
      const styleUrl = baseLayerStyles[activeBaseLayer as keyof typeof baseLayerStyles];
      if (styleUrl && map.current.getStyle()?.name !== activeBaseLayer) {
        map.current.setStyle(styleUrl);
        
        // Re-add routes and other layers after style change
        map.current.once('style.load', () => {
          // Re-add routes if they exist
          if (showRoutes && baseRoute.length > 0) {
            // Re-add route sources and layers
            // This would be the same code as in the initial load
          }
          
          // Re-apply active weather layers
          Object.entries(activeLayers).forEach(([layerType, enabled]) => {
            if (enabled) {
              updateWeatherLayer(layerType, enabled);
            }
          });
        });
      }
    } catch (error) {
      console.error("Error updating base layer:", error);
    }
  }, [activeBaseLayer, mapReady]);

  useEffect(() => {
    if (!mapToken || !mapContainer.current) return;

    try {
      // Initialize map with the provided style
      mapboxgl.accessToken = mapToken;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: baseLayerStyles[activeBaseLayer as keyof typeof baseLayerStyles] || baseLayerStyles.default,
        center: showRoutes && baseRoute.length > 0 
          ? [(baseRoute[0][0] + baseRoute[baseRoute.length - 1][0]) / 2, 
             (baseRoute[0][1] + baseRoute[baseRoute.length - 1][1]) / 2] 
          : [83.167, 6.887],
        zoom: showRoutes ? 5 : 4,
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

      // Add sources and layers for routes when the map loads
      map.current.on('load', () => {
        console.log("Map loaded, setting mapReady to true");
        setMapReady(true);
        
        // Add vector tile source for terrain/elevation data instead of raster
        map.current?.addSource('mapbox-dem-vector', {
          'type': 'vector',
          'url': 'mapbox://mapbox.mapbox-terrain-v2',
          'maxzoom': 14
        });

        // Add terrain layer using vector tiles
        map.current?.addLayer({
          'id': 'terrain-layer',
          'type': 'fill-extrusion',
          'source': 'mapbox-dem-vector',
          'source-layer': 'contour',
          'paint': {
            'fill-extrusion-color': [
              'interpolate',
              ['linear'],
              ['get', 'ele'],
              0, '#4264fb',
              100, '#4fb3d9',
              500, '#85C1E5',
              1000, '#B8DBF0'
            ],
            'fill-extrusion-height': ['*', ['get', 'ele'], 10],
            'fill-extrusion-opacity': 0.3
          }
        });

        if (showRoutes) {
          // Add base route source and layer
          map.current?.addSource('base-route', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: baseRoute
              }
            }
          });
          
          map.current?.addLayer({
            id: 'base-route-line',
            type: 'line',
            source: 'base-route',
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': '#000',
              'line-width': 3,
              'line-dasharray': [1, 0]
            }
          });
          
          // Add weather route source and layer
          map.current?.addSource('weather-route', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: weatherRoute
              }
            }
          });
          
          map.current?.addLayer({
            id: 'weather-route-line',
            type: 'line',
            source: 'weather-route',
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': '#4ade80',
              'line-width': 3,
              'line-dasharray': [1, 0]
            }
          });
          
          // Add start and end markers
          if (baseRoute.length > 0) {
            // Start marker (S)
            const startEl = document.createElement('div');
            startEl.className = 'start-marker';
            startEl.style.width = '30px';
            startEl.style.height = '30px';
            startEl.style.backgroundImage = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="%234ade80" stroke="white" stroke-width="2"><circle cx="12" cy="12" r="10"/><text x="12" y="16" text-anchor="middle" fill="white" font-size="12px" font-family="Arial">S</text></svg>')`;
            
            new mapboxgl.Marker(startEl)
              .setLngLat([baseRoute[0][0], baseRoute[0][1]])
              .addTo(map.current!);
            
            // End marker (destination)
            const endEl = document.createElement('div');
            endEl.className = 'end-marker';
            endEl.style.width = '30px';
            endEl.style.height = '30px';
            endEl.style.backgroundImage = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="red" stroke="white" stroke-width="2"><circle cx="12" cy="12" r="10"/><text x="12" y="16" text-anchor="middle" fill="white" font-size="12px" font-family="Arial">D</text></svg>')`;
            
            new mapboxgl.Marker(endEl)
              .setLngLat([baseRoute[baseRoute.length - 1][0], baseRoute[baseRoute.length - 1][1]])
              .addTo(map.current!);
          }
          
          // Keep references to the sources for updates
          baseRouteRef.current = map.current?.getSource('base-route') as mapboxgl.GeoJSONSource;
          weatherRouteRef.current = map.current?.getSource('weather-route') as mapboxgl.GeoJSONSource;
          
          // Set initial bounds to fit routes
          const coordinates = [...baseRoute, ...weatherRoute];
          const bounds = coordinates.reduce((bounds, coord) => {
            return bounds.extend(coord as mapboxgl.LngLatLike);
          }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));
          
          map.current?.fitBounds(bounds, {
            padding: 50
          });
        }
      });

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
        setMapReady(false);
      };
    } catch (error) {
      console.error("Error initializing map:", error);
      toast({
        title: "Map Error",
        description: "Failed to initialize the map. Please check your access token.",
        variant: "destructive"
      });
    }
  }, [mapToken, vessels, showRoutes, baseRoute, weatherRoute]);

  // Update visible route when activeRouteType changes
  useEffect(() => {
    if (!map.current || !mapReady) return;
    
    try {
      if (map.current.getLayer('base-route-line') && map.current.getLayer('weather-route-line')) {
        if (activeRouteType === 'base') {
          map.current.setLayoutProperty('base-route-line', 'visibility', 'visible');
          map.current.setLayoutProperty('weather-route-line', 'visibility', 'none');
        } else {
          map.current.setLayoutProperty('base-route-line', 'visibility', 'none');
          map.current.setLayoutProperty('weather-route-line', 'visibility', 'visible');
        }
      }
    } catch (error) {
      console.error("Error updating route visibility:", error);
    }
  }, [activeRouteType, mapReady]);

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
