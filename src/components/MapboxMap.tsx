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
  const [mapToken, setMapToken] = useState<string>(
    accessToken || 'pk.eyJ1IjoiZ2Vvc2VydmUiLCJhIjoiY201Z2J3dXBpMDU2NjJpczRhbmJubWtxMCJ9.6Kw-zTqoQcNdDokBgbI5_Q'
  );
  const { toast } = useToast();

  // Layer configurations for DTN API
  const layerConfigs = {
    pressure: { dtnLayerId: 'pressure', tileSetId: 'pressure-latest' },
    storm: { dtnLayerId: 'storm', tileSetId: 'storm-latest' },
    current: { dtnLayerId: 'current', tileSetId: 'current-latest' },
    wind: { dtnLayerId: 'wind', tileSetId: 'wind-latest' }
  };

  // Base layer styles
  const baseLayerStyles = {
    default: "mapbox://styles/geoserve/cmb8z5ztq00rw01qxauh6gv66",
    swell: "mapbox://styles/geoserve/cmb8z5ztq00rw01qxauh6gv66", // You can change these to different styles
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
    if (!map.current) return;

    const sourceId = `${layerType}-layer`;
    const layerId = `${layerType}-layer-render`;
    const config = layerConfigs[layerType as keyof typeof layerConfigs];
    
    if (!config) return;

    const token = 'your-dtn-api-token'; // You'll need to get this from user or environment

    if (enabled) {
      // Add or update the source
      if (!map.current.getSource(sourceId)) {
        console.log("Adding new source:", sourceId);
        map.current.addSource(sourceId, {
          type: "raster",
          tiles: [
            `https://map.api.dtn.com/v2/tiles/${config.dtnLayerId}/${config.tileSetId}/{z}/{x}/{y}.webp?size=512&unit=metric-marine&token=${token}`,
          ],
          tileSize: 512,
        });
      } else {
        console.log("Updating existing source:", sourceId);
        // Update the existing source tiles
        const source = map.current.getSource(sourceId) as mapboxgl.RasterSource;
        source.setTiles([
          `https://map.api.dtn.com/v2/tiles/${config.dtnLayerId}/${config.tileSetId}/{z}/{x}/{y}.webp?size=512&unit=metric-marine&token=${token}`,
        ]);
      }

      // Add layer if it doesn't exist
      if (!map.current.getLayer(layerId)) {
        map.current.addLayer({
          id: layerId,
          type: "raster",
          source: sourceId,
          paint: {
            "raster-opacity": 0.7
          }
        });
      } else {
        // Make sure layer is visible
        map.current.setLayoutProperty(layerId, 'visibility', 'visible');
      }
    } else {
      // Hide the layer
      if (map.current.getLayer(layerId)) {
        map.current.setLayoutProperty(layerId, 'visibility', 'none');
      }
    }
  };

  // Update layers when activeLayers changes
  useEffect(() => {
    if (!map.current) return;

    Object.entries(activeLayers).forEach(([layerType, enabled]) => {
      updateWeatherLayer(layerType, enabled);
    });
  }, [activeLayers]);

  // Update base layer when activeBaseLayer changes
  useEffect(() => {
    if (!map.current) return;

    const styleUrl = baseLayerStyles[activeBaseLayer as keyof typeof baseLayerStyles];
    if (styleUrl && map.current.getStyle().name !== activeBaseLayer) {
      map.current.setStyle(styleUrl);
      
      // Re-add routes and other layers after style change
      map.current.once('style.load', () => {
        // Re-add routes if they exist
        if (showRoutes && baseRoute.length > 0) {
          // Re-add route sources and layers
          // This would be the same code as in the initial load
        }
      });
    }
  }, [activeBaseLayer]);

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

        // Apply any initially active layers
        Object.entries(activeLayers).forEach(([layerType, enabled]) => {
          if (enabled) {
            updateWeatherLayer(layerType, enabled);
          }
        });
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
    if (!map.current) return;
    
    if (map.current.getLayer('base-route-line') && map.current.getLayer('weather-route-line')) {
      if (activeRouteType === 'base') {
        map.current.setLayoutProperty('base-route-line', 'visibility', 'visible');
        map.current.setLayoutProperty('weather-route-line', 'visibility', 'none');
      } else {
        map.current.setLayoutProperty('base-route-line', 'visibility', 'none');
        map.current.setLayoutProperty('weather-route-line', 'visibility', 'visible');
      }
    }
  }, [activeRouteType]);

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
