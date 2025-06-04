
import React, { useRef, useState, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import 'mapbox-gl/dist/mapbox-gl.css';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import MapTopControls from './MapTopControls';

mapboxgl.accessToken = "pk.eyJ1IjoiZ2Vvc2VydmUiLCJhIjoiY201Z2J3dXBpMDU2NjJpczRhbmJubWtxMCJ9.6Kw-zTqoQcNdDokBgbI5_Q";

interface MapboxMapProps {
  vessels?: any[];
  accessToken?: string;
  showRoutes?: boolean;
  baseRoute?: [number, number][];
  weatherRoute?: [number, number][];
  activeRouteType?: 'base' | 'weather';
  activeLayers?: Record<string, boolean>;
  activeBaseLayer?: string;
}

const MapboxMap: React.FC<MapboxMapProps> = ({ 
  vessels = [],
  accessToken,
  showRoutes = false,
  baseRoute = [],
  weatherRoute = [],
  activeRouteType = 'base',
  activeLayers = {},
  activeBaseLayer = 'default'
}) => {
  const mapContainerRef = useRef(null);
  const mapref = useRef(null);
  const [showLayers, setShowLayers] = useState(false);
  const [activeOverlay, setActiveOverlay] = useState(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [selectedWeatherType, setSelectedWeatherType] = useState('wind');
  const [lineColor, setLineColor] = useState('#ffffff');
  const [heatmapIntensity, setHeatmapIntensity] = useState(1);
  const [layerColors, setLayerColors] = useState({
    wind: '#ffffff',
    pressure: '#ff6b35',
    swell: '#00ff00',
    symbol: '#ff0000'
  });
  const { toast } = useToast();

  const token = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InpfX21pZW13NGhoTmdvQWQxR3N6ciJ9.eyJodHRwczovL2F1dGguZHRuLmNvbS9hY2NvdW50SWQiOiIyNTY1Mzk5IiwiaHR0cHM6Ly9hdXRoLmR0bi5jb20vdmVuZG9ySWQiOiJ1bmtub3duIiwiaHR0cHM6Ly9hdXRoLmR0bi5jb20vY3VzdG9tZXJJZCI6IjI1NjUzOTkiLCJodHRwczovL2F1dGguZHRuLmNvbS9wcm9kdWN0Q29kZSI6IkRUTld4QVBJXzI1NjUzOTkiLCJodHRwczovL2F1dGguZHRuLmNvbS9yZXF1ZXN0ZXJJcCI6IjE4LjIxMy4xNzQuMjciLCJodHRwczovL2F1dGguZHRuLmNvbS9ycHMiOiIyNTAiLCJodHRwczovL2F1dGguZHRuLmNvbS90aWVyIjoiRW50ZXJwcmlzZSIsImh0dHBzOi8vYXV0aC5kdG4uY29tL3F1b3RhIjoiMTAwMDAwIiwiaHR0cHM6Ly9hdXRoLmR0bi5jb20vYXJlYVNpemUiOiIwIiwiaXNzIjoiaHR0cHM6Ly9pZC5hdXRoLmR0bi5jb20vIiwic3ViIjoiRnpGbHZJajNjUFBhejhlc3B5ckhEN0FySnVlY0xOR1BAY2xpZW50cyIsImF1ZCI6Imh0dHBzOi8vbWFwLmFwaS5kdG4uY29tIiwiaWF0IjoxNzQ5MDIxODk4LCJleHAiOjE3NDkxMDgyOTgsInNjb3BlIjoicmVhZDpjYXRhbG9nLWRlZmF1bHQgd2VhdGhlci5tYXAuY2F0YWxvZy1wbHVzOnJlYWQiLCJndHkiOiJjbGllbnQtY3JlZGVudGlhbHMiLCJhenAiOiJGekZsdklqM2NQUGF6OGVzcHlySEQ3QXJKdWVjTE5HUCIsInBlcm1pc3Npb25zIjpbInJlYWQ6Y2F0YWxvZy1kZWZhdWx0Iiwid2VhdGhlci5tYXAuY2F0YWxvZy1wbHVzOnJlYWQiXX0.lcYv0PVc-udtw59zLvxAi0AqVVYnliEGlQapLrS_jc84If6tY8c9Qu_j1IaEUKv6IE4utH1z6KABF299wayBLFe355yasc3dsxqWbpP1YosD-NW_BNnAo48x7cJXzK1ZnnIWzB8_t0pvX8MVVqu9r_G-yz0Vd48CokXwJ06ErTLod-YG15vq7MVhBoa-_mvjJl2bR96SIobC_RaN60ybdwX6sxhAJTYBV-KU8a2yd2b0WZofEGs1_G7cCp5f2ecSeJcKc111l8etJy7zd01Ch23KjMpueSUwQU1ruWmAFKLKtBjbZ-1Pel0G-1HZaCtIuUqZQhUPtXcAf5G8g5j7KA';

  const dtnOverlays = {
    wind: { dtnLayerId: 'fcst-manta-wind-speed-contours', tileSetId: 'b864ff86-22af-41fc-963e-38837d457566' },
    pressure: { dtnLayerId: 'fcst-manta-mean-sea-level-pressure-isolines', tileSetId: '2703fb6d-0ace-43a3-aca1-76588e3ac9a8' },
    swell: { dtnLayerId: 'fcst-sea-wave-height-swell-waves-contours', tileSetId: 'd3f83398-2e88-4c2b-a82f-c10db6891bb3' },
    symbol: { dtnLayerId: 'fcst-manta-wind-symbol-grid', tileSetId: 'dd44281e-db07-41a1-a329-bedc225bb575' },
  };

  useEffect(() => {
    if (mapref.current) return;

    console.log("Initializing new map");

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/geoserve/cmb8z5ztq00rw01qxauh6gv66',
      center: [83.167, 6.887],
      zoom: 4,
      attributionControl: false
    });

    mapref.current = map;

    map.addControl(
      new mapboxgl.NavigationControl(),
      'bottom-right'
    );

    map.on('load', () => {
      setIsMapLoaded(true);
      console.log("Map fully loaded");
      
      toast({
        title: "Map Loaded",
        description: "Map has been successfully initialized"
      });
    });

    map.on('error', (e) => {
      console.error("Map error:", e.error);
      toast({
        title: "Map Error",
        description: "Failed to load the map. Please check your internet connection.",
        variant: "destructive"
      });
    });

    return () => {
      if (mapref.current) {
        mapref.current.remove();
        mapref.current = null;
      }
      setIsMapLoaded(false);
    };
  }, [toast]);

  useEffect(() => {
    if (!activeLayers || !isMapLoaded) return;

    Object.entries(activeLayers).forEach(([layerType, enabled]) => {
      if (enabled && layerType in dtnOverlays) {
        handleOverlayClick(layerType);
      } else if (!enabled && activeOverlay === layerType) {
        removeOverlay(layerType);
      }
    });
  }, [activeLayers, isMapLoaded]);

  const fetchDTNSourceLayer = async (layerId) => {
    const response = await fetch(`https://map.api.dtn.com/v2/styles/${layerId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    const data = await response.json();
    const sourceLayerName = data[0]?.mapBoxStyle?.layers?.[0]?.["source-layer"];
    return sourceLayerName;
  };

  const updateLayerColor = (layerType, color) => {
    if (!mapref.current || !mapref.current.isStyleLoaded()) return;
    
    const layerId = `dtn-layer-${layerType}`;
    
    if (mapref.current.getLayer(layerId)) {
      if (layerType === 'swell') {
        console.log(`Swell is a heatmap layer with predefined colors`);
      } else {
        mapref.current.setPaintProperty(layerId, 'line-color', color);
        console.log(`Updated ${layerType} layer color to ${color}`);
      }
    }
  };

  const updateHeatmapIntensity = (intensity) => {
    if (!mapref.current || !mapref.current.isStyleLoaded()) return;
    
    const layerId = `dtn-layer-swell`;
    
    if (mapref.current.getLayer(layerId)) {
      mapref.current.setPaintProperty(layerId, 'heatmap-intensity', [
        'interpolate',
        ['linear'],
        ['zoom'],
        0, intensity,
        9, intensity * 3
      ]);
      console.log(`Updated swell heatmap intensity to ${intensity}`);
    }
  };

  const handleOverlayClick = async (overlay) => {
    if (!mapref.current || !mapref.current.isStyleLoaded()) {
      console.warn("Map style not yet loaded");
      return;
    }

    const { dtnLayerId, tileSetId } = dtnOverlays[overlay];
    const sourceId = `dtn-source-${overlay}`;
    const layerId = `dtn-layer-${overlay}`;

    console.log(`Adding overlay: ${overlay}, DTN Layer: ${dtnLayerId}, TileSet: ${tileSetId}`);

    try {
      const sourceLayer = await fetchDTNSourceLayer(dtnLayerId);
      const tileURL = `https://map.api.dtn.com/v2/tiles/${dtnLayerId}/${tileSetId}/{z}/{x}/{y}.pbf?token=${token}`;
      
      if (!mapref.current.getSource(sourceId)) {
        mapref.current.addSource(sourceId, {
          type: "vector",
          tiles: [tileURL],
          minzoom: 0,
          maxzoom: 14,
        });

        // Special handling for swell layer as heatmap
        if (overlay === 'swell') {
          mapref.current.addLayer({
            id: layerId,
            type: "heatmap",
            source: sourceId,
            "source-layer": sourceLayer,
            paint: {
              "heatmap-weight": [
                'interpolate',
                ['linear'],
                ['get', 'value'],
                0, 0,
                15, 1  // max wave height in meters (0-15m based on your reference image)
              ],
              "heatmap-intensity": [
                'interpolate',
                ['linear'],
                ['zoom'],
                0, heatmapIntensity,
                9, heatmapIntensity * 3
              ],
              "heatmap-color": [
                'interpolate',
                ['linear'],
                ['heatmap-density'],
                0, 'rgba(0, 0, 139, 0)',      // Transparent dark blue
                0.1, 'rgb(0, 0, 139)',        // Dark blue (0-0.5m)
                0.2, 'rgb(0, 100, 255)',      // Blue (0.5-1.0m)
                0.3, 'rgb(0, 150, 255)',      // Light blue (1.0-1.5m)
                0.4, 'rgb(0, 200, 255)',      // Cyan (1.5-2.0m)
                0.5, 'rgb(0, 255, 200)',      // Light cyan (2.0-2.5m)
                0.6, 'rgb(100, 255, 100)',    // Light green (2.5-3.0m)
                0.7, 'rgb(200, 255, 0)',      // Yellow-green (3.0-3.5m)
                0.8, 'rgb(255, 255, 0)',      // Yellow (3.5-4.0m)
                0.85, 'rgb(255, 200, 0)',     // Orange (4.0-4.5m)
                0.9, 'rgb(255, 150, 0)',      // Orange-red (4.5-5.0m)
                0.95, 'rgb(255, 100, 100)',   // Pink (5.0-10.0m)
                1, 'rgb(200, 0, 200)'         // Purple (10.0m+)
              ],
              "heatmap-radius": [
                'interpolate',
                ['linear'],
                ['zoom'],
                0, 2,
                9, 20
              ],
              "heatmap-opacity": 0.8,
            },
          });
        } else {
          // Regular line layer for other overlays
          mapref.current.addLayer({
            id: layerId,
            type: "line",
            source: sourceId,
            "source-layer": sourceLayer,
            layout: {
              "line-cap": "round",
              "line-join": "round",
            },
            paint: {
              "line-color": layerColors[overlay] || "#64748b",
              "line-width": 1,
              "line-opacity": 0.6,
            },
          });
        }

        setActiveOverlay(overlay);
        console.log(`Successfully added ${overlay} layer`);
        
        toast({
          title: `${overlay.charAt(0).toUpperCase() + overlay.slice(1)} Layer`,
          description: `Successfully loaded ${overlay} overlay`
        });
      } else {
        console.log(`Layer "${overlay}" already exists`);
      }
    } catch (error) {
      console.error(`Error adding ${overlay} layer:`, error);
      toast({
        title: "Layer Error",
        description: `Failed to add ${overlay} layer: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const removeOverlay = (overlay) => {
    if (!mapref.current || !mapref.current.isStyleLoaded()) return;

    const sourceId = `dtn-source-${overlay}`;
    const layerId = `dtn-layer-${overlay}`;

    if (mapref.current.getLayer(layerId)) {
      mapref.current.removeLayer(layerId);
    }
    if (mapref.current.getSource(sourceId)) {
      mapref.current.removeSource(sourceId);
    }

    if (activeOverlay === overlay) {
      setActiveOverlay(null);
    }
  };

  const handleColorUpdate = () => {
    const newColors = { ...layerColors, [selectedWeatherType]: lineColor };
    setLayerColors(newColors);
    updateLayerColor(selectedWeatherType, lineColor);
    
    toast({
      title: "Color Updated",
      description: `${selectedWeatherType} layer color updated to ${lineColor}`
    });
  };

  const handleIntensityUpdate = () => {
    updateHeatmapIntensity(heatmapIntensity);
    
    toast({
      title: "Intensity Updated",
      description: `Swell heatmap intensity updated to ${heatmapIntensity}`
    });
  };

  return (
    <div className="relative h-full w-full">
      <MapTopControls />
      <div ref={mapContainerRef} className="absolute inset-0" />

      <button
        onClick={() => setShowLayers(!showLayers)}
        className="absolute top-20 left-4 z-20 bg-white rounded-lg shadow-lg p-3 hover:bg-gray-50 transition-colors"
      >
        Toggle DTN Layers
      </button>

      {showLayers && (
        <div className="absolute top-32 left-4 z-20 bg-white rounded-lg shadow-lg p-4 min-w-[200px]">
          <h3 className="text-sm font-semibold mb-3">DTN Weather Layers</h3>
          {Object.keys(dtnOverlays).map((overlay) => (
            <div
              key={overlay}
              onClick={() => handleOverlayClick(overlay)}
              className={`p-2 m-1 rounded cursor-pointer transition-colors ${
                activeOverlay === overlay 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-black'
              }`}
            >
              {overlay.charAt(0).toUpperCase() + overlay.slice(1)}
            </div>
          ))}
          {activeOverlay && (
            <button
              onClick={() => removeOverlay(activeOverlay)}
              className="w-full mt-2 p-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Remove Active Layer
            </button>
          )}
        </div>
      )}

      {/* Weather Layer Configuration Box */}
      <div className="absolute top-32 right-4 z-20 bg-white rounded-lg shadow-lg p-4 min-w-[280px]">
        <h3 className="text-sm font-semibold mb-3">Weather Layer Configuration</h3>
        
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Weather Type
            </label>
            <Select value={selectedWeatherType} onValueChange={setSelectedWeatherType}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select weather type" />
              </SelectTrigger>
              <SelectContent className="bg-white border shadow-lg z-50">
                <SelectItem value="wind">Wind</SelectItem>
                <SelectItem value="pressure">Pressure</SelectItem>
                <SelectItem value="swell">Swell (Heatmap)</SelectItem>
                <SelectItem value="symbol">Symbol</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Line Color {selectedWeatherType === 'swell' && '(N/A for heatmap)'}
            </label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={lineColor}
                onChange={(e) => setLineColor(e.target.value)}
                className="w-16 h-8 p-1 border rounded"
                disabled={selectedWeatherType === 'swell'}
              />
              <Input
                type="text"
                value={lineColor}
                onChange={(e) => setLineColor(e.target.value)}
                placeholder="#ffffff"
                className="flex-1 text-xs"
                disabled={selectedWeatherType === 'swell'}
              />
            </div>
          </div>

          {selectedWeatherType === 'swell' && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Heatmap Intensity
              </label>
              <div className="flex gap-2">
                <Input
                  type="range"
                  min="0.1"
                  max="3"
                  step="0.1"
                  value={heatmapIntensity}
                  onChange={(e) => setHeatmapIntensity(parseFloat(e.target.value))}
                  className="flex-1"
                />
                <Input
                  type="number"
                  min="0.1"
                  max="3"
                  step="0.1"
                  value={heatmapIntensity}
                  onChange={(e) => setHeatmapIntensity(parseFloat(e.target.value))}
                  className="w-16 text-xs"
                />
              </div>
            </div>
          )}

          {selectedWeatherType === 'swell' ? (
            <Button 
              onClick={handleIntensityUpdate}
              className="w-full"
              size="sm"
            >
              Apply Intensity
            </Button>
          ) : (
            <Button 
              onClick={handleColorUpdate}
              className="w-full"
              size="sm"
            >
              Apply Color
            </Button>
          )}

          <div className="text-xs text-gray-500 mt-2">
            <div className="font-medium mb-1">Current Settings:</div>
            {Object.entries(layerColors).map(([type, color]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="capitalize">{type}:</span>
                <div className="flex items-center gap-1">
                  {type === 'swell' ? (
                    <span className="text-xs">Intensity: {heatmapIntensity}</span>
                  ) : (
                    <>
                      <div 
                        className="w-3 h-3 rounded border" 
                        style={{ backgroundColor: color }}
                      ></div>
                      <span className="text-xs">{color}</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapboxMap;
