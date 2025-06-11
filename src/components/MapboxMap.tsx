import React, { useRef, useState, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import 'mapbox-gl/dist/mapbox-gl.css';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import MapTopControls from './MapTopControls';
import { dtnToken } from '@/utils/mapConstants';
import { createVesselMarkers, cleanupVesselMarkers, Vessel } from '@/utils/vesselMarkers';

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
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const [showLayers, setShowLayers] = useState(false);
  const [activeOverlays, setActiveOverlays] = useState<string[]>([]);
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
  const [heatmapGradient, setHeatmapGradient] = useState([
    { value: '0m', color: 'rgb(0, 0, 139)' },      
    { value: '1m', color: 'rgb(0, 100, 255)' },    
    { value: '2m', color: 'rgb(0, 150, 255)' },    
    { value: '3m', color: 'rgb(0, 200, 255)' },    
    { value: '4m', color: 'rgb(0, 255, 200)' },    
    { value: '5m', color: 'rgb(100, 255, 100)' },  
    { value: '6m', color: 'rgb(200, 255, 0)' },    
    { value: '8m', color: 'rgb(255, 255, 0)' },    
    { value: '10m', color: 'rgb(255, 200, 0)' },   
    { value: '12m', color: 'rgb(255, 150, 0)' },   
    { value: '14m', color: 'rgb(255, 100, 100)' }, 
    { value: '15m+', color: 'rgb(200, 0, 200)' }   
  ]);
  const { toast } = useToast();

  const token = dtnToken.replace('Bearer ', '');

  const dtnOverlays = {
    wind: { dtnLayerId: 'fcst-manta-wind-speed-contours', tileSetId: 'b864ff86-22af-41fc-963e-38837d457566' },
    pressure: { dtnLayerId: 'fcst-manta-mean-sea-level-pressure-isolines', tileSetId: '2703fb6d-0ace-43a3-aca1-76588e3ac9a8' },
    swell: { dtnLayerId: 'fcst-sea-wave-height-swell-waves-contours', tileSetId: 'd3f83398-2e88-4c2b-a82f-c10db6891bb3' },
    symbol: { dtnLayerId: 'fcst-manta-wind-symbol-grid', tileSetId: 'dd44281e-db07-41a1-a329-bedc225bb575' },
  };

  // Well-distributed vessel coordinates across the Indian Ocean region
  const mockVessels: Vessel[] = [
    { id: 'vessel-1', name: 'Green Vessel 1', type: 'green', position: [72.5, 15.2] }, // Arabian Sea Central
    { id: 'vessel-2', name: 'Orange Vessel 1', type: 'orange', position: [78.8, 12.1] }, // Indian Ocean West Central
    { id: 'vessel-3', name: 'Green Vessel 2', type: 'green', position: [85.2, 18.5] }, // Bay of Bengal Central
    { id: 'vessel-4', name: 'Orange Vessel 2', type: 'orange', position: [80.1, 6.8] }, // Indian Ocean South of India
    { id: 'vessel-5', name: 'Green Vessel 3', type: 'green', position: [90.5, 14.3] }, // Bay of Bengal East
    { id: 'vessel-6', name: 'Orange Vessel 3', type: 'orange', position: [75.2, 20.1] }, // Arabian Sea North
    { id: 'vessel-7', name: 'Green Vessel 4', type: 'green', position: [68.7, 18.9] }, // Arabian Sea West
    { id: 'vessel-8', name: 'Orange Vessel 4', type: 'orange', position: [82.4, 10.5] }, // Tamil Nadu Waters
    { id: 'vessel-9', name: 'Green Vessel 5', type: 'green', position: [87.9, 21.7] }, // Bay of Bengal North
    { id: 'vessel-10', name: 'Orange Vessel 5', type: 'orange', position: [76.8, 8.3] }, // Kerala Waters
    { id: 'vessel-11', name: 'Green Vessel 6', type: 'green', position: [81.6, 16.4] }, // Sri Lanka North
    { id: 'vessel-12', name: 'Orange Vessel 6', type: 'orange', position: [88.2, 11.7] }, // Bay of Bengal South
    { id: 'vessel-13', name: 'Green Vessel 7', type: 'green', position: [74.1, 13.6] }, // Goa Waters
    { id: 'vessel-14', name: 'Orange Vessel 7', type: 'orange', position: [79.5, 22.4] }, // Gujarat Waters
    { id: 'vessel-15', name: 'Green Vessel 8', type: 'green', position: [84.7, 7.2] }, // Indian Ocean East
  ];

  // Function to ensure vessels are always on top
  const ensureVesselsOnTop = () => {
    // Small delay to ensure all layers are loaded
    setTimeout(() => {
      if (mapref.current) {
        cleanupVesselMarkers(markersRef);
        createVesselMarkers(mapref.current, mockVessels, markersRef);
      }
    }, 100);
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
      
      // Ensure vessels are created on top after map loads
      ensureVesselsOnTop();
      
      toast({
        title: "Map Loaded",
        description: "Map has been successfully initialized with vessel markers"
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
        cleanupVesselMarkers(markersRef);
        mapref.current.remove();
        mapref.current = null;
      }
      setIsMapLoaded(false);
    };
  }, [toast]);

  useEffect(() => {
    if (!activeLayers || !isMapLoaded) return;

    Object.entries(activeLayers).forEach(([layerType, enabled]) => {
      if (enabled && layerType in dtnOverlays && !activeOverlays.includes(layerType)) {
        handleOverlayClick(layerType);
      } else if (!enabled && activeOverlays.includes(layerType)) {
        removeOverlay(layerType);
      }
    });
  }, [activeLayers, isMapLoaded]);

  const fetchDTNSourceLayer = async (layerId) => {
    const response = await fetch(`https://map.api.dtn.com/v2/styles/${layerId}`, {
      headers: {
        Authorization: dtnToken,
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
        console.log(`Swell is a filled layer with gradient colors`);
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
      mapref.current.setPaintProperty(layerId, 'fill-opacity', intensity * 0.8);
      console.log(`Updated swell fill opacity to ${intensity * 0.8}`);
    }
  };

  const updateHeatmapGradient = () => {
    if (!mapref.current || !mapref.current.isStyleLoaded()) return;
    
    const layerId = `dtn-layer-swell`;
    
    if (mapref.current.getLayer(layerId)) {
      const colorExpression: any[] = [
        'interpolate',
        ['linear'],
        ['to-number', ['get', 'value'], 0]
      ];

      heatmapGradient.forEach((item) => {
        const heightValue = parseFloat(item.value.replace('m', '').replace('+', ''));
        colorExpression.push(heightValue, item.color);
      });

      mapref.current.setPaintProperty(layerId, 'fill-color', colorExpression);
      console.log('Updated swell gradient colors');
    }
  };

  const handleOverlayClick = async (overlay) => {
    if (!mapref.current || !mapref.current.isStyleLoaded()) {
      console.warn("Map style not yet loaded");
      return;
    }

    // Toggle layer - if it exists, remove it; if not, add it
    if (activeOverlays.includes(overlay)) {
      removeOverlay(overlay);
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

        // Determine layer insertion order - all layers go below vessels
        let beforeId = undefined;

        if (overlay === 'swell') {
          // Heatmap should be the base layer - insert at the bottom
          const colorExpression: any[] = [
            'interpolate',
            ['linear'],
            ['to-number', ['get', 'value'], 0]
          ];

          heatmapGradient.forEach((item) => {
            const heightValue = parseFloat(item.value.replace('m', '').replace('+', ''));
            colorExpression.push(heightValue, item.color);
          });

          mapref.current.addLayer({
            id: layerId,
            type: "fill",
            source: sourceId,
            "source-layer": sourceLayer,
            paint: {
              "fill-color": colorExpression,
              "fill-opacity": heatmapIntensity * 0.8,
              "fill-outline-color": "transparent"
            },
          }, beforeId);
        } else if (overlay === 'wind') {
          // Wind layer should display as directional arrows showing wind direction and speed
          mapref.current.addLayer({
            id: layerId,
            type: "symbol",
            source: sourceId,
            "source-layer": sourceLayer,
            layout: {
              "text-field": "↑", // Wind direction arrow
              "text-size": [
                "interpolate",
                ["linear"],
                ["get", "speed"], // Assuming speed field exists
                0, 12,
                10, 16,
                20, 20,
                30, 24
              ],
              "text-rotation-alignment": "map",
              "text-rotate": ["get", "direction"], // Rotate based on wind direction
              "text-allow-overlap": true,
              "text-ignore-placement": true,
              "symbol-spacing": 80,
              "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"]
            },
            paint: {
              "text-color": layerColors[overlay] || "#ffffff",
              "text-opacity": 0.9,
              "text-halo-color": "#000000",
              "text-halo-width": 1
            },
          }, beforeId);
        } else if (overlay === 'symbol') {
          // Symbol layer for wind symbols grid
          mapref.current.addLayer({
            id: layerId,
            type: "symbol",
            source: sourceId,
            "source-layer": sourceLayer,
            layout: {
              "text-field": "→", // Simple arrow symbol
              "text-size": 16,
              "text-rotation-alignment": "map",
              "text-rotate": ["get", "direction"], // Rotate based on wind direction
              "text-allow-overlap": true,
              "text-ignore-placement": true,
              "symbol-spacing": 100
            },
            paint: {
              "text-color": layerColors[overlay] || "#ff0000",
              "text-opacity": 0.8
            },
          }, beforeId);
        } else {
          // Line layers (pressure) go above heatmaps but below vessels
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
          }, beforeId);
        }

        // Always ensure vessels are on top after adding any layer
        ensureVesselsOnTop();

        setActiveOverlays(prev => [...prev, overlay]);
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

    // Ensure vessels stay on top after removing layers
    ensureVesselsOnTop();

    setActiveOverlays(prev => prev.filter(item => item !== overlay));
  };

  const removeAllOverlays = () => {
    activeOverlays.forEach(overlay => removeOverlay(overlay));
    setActiveOverlays([]);
    
    // Ensure vessels are visible after removing all layers
    ensureVesselsOnTop();
    
    toast({
      title: "All Layers Removed",
      description: "All weather layers have been removed from the map"
    });
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
      description: `Swell opacity updated to ${heatmapIntensity}`
    });
  };

  const handleGradientUpdate = () => {
    updateHeatmapGradient();
    
    toast({
      title: "Gradient Updated",
      description: "Swell gradient colors updated"
    });
  };

  const updateGradientColor = (index, newColor) => {
    const updatedGradient = [...heatmapGradient];
    updatedGradient[index].color = newColor;
    setHeatmapGradient(updatedGradient);
  };

  const convertRgbToHex = (rgbString) => {
    const match = rgbString.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (!match) return rgbString;
    
    const r = parseInt(match[1]);
    const g = parseInt(match[2]);
    const b = parseInt(match[3]);
    
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  };

  const convertHexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return hex;
    
    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    
    return `rgb(${r}, ${g}, ${b})`;
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
                activeOverlays.includes(overlay)
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-black'
              }`}
            >
              {overlay.charAt(0).toUpperCase() + overlay.slice(1)}
              {activeOverlays.includes(overlay) && <span className="ml-2">✓</span>}
            </div>
          ))}
          {activeOverlays.length > 0 && (
            <button
              onClick={removeAllOverlays}
              className="w-full mt-2 p-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Remove All Layers ({activeOverlays.length})
            </button>
          )}
        </div>
      )}

      <div className="absolute top-32 right-4 z-20 bg-white rounded-lg shadow-lg p-4 min-w-[320px] max-h-[80vh] overflow-y-auto">
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
                <SelectItem value="swell">Swell (Filled)</SelectItem>
                <SelectItem value="symbol">Symbol</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Line Color {selectedWeatherType === 'swell' && '(N/A for filled)'}
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
            <>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Fill Opacity
                </label>
                <div className="flex gap-2">
                  <Input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={heatmapIntensity}
                    onChange={(e) => setHeatmapIntensity(parseFloat(e.target.value))}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={heatmapIntensity}
                    onChange={(e) => setHeatmapIntensity(parseFloat(e.target.value))}
                    className="w-16 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Wave Height Gradient Colors
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {heatmapGradient.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        type="color"
                        value={convertRgbToHex(item.color)}
                        onChange={(e) => updateGradientColor(index, convertHexToRgb(e.target.value))}
                        className="w-8 h-6 p-0 border rounded cursor-pointer"
                      />
                      <span className="text-xs text-gray-600 w-10 text-center">{item.value}</span>
                      <Input
                        type="text"
                        value={item.color}
                        onChange={(e) => updateGradientColor(index, e.target.value)}
                        className="flex-1 text-xs"
                        placeholder="rgb(255, 255, 255)"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleIntensityUpdate}
                  className="flex-1"
                  size="sm"
                >
                  Apply Opacity
                </Button>
                <Button 
                  onClick={handleGradientUpdate}
                  className="flex-1"
                  size="sm"
                >
                  Apply Gradient
                </Button>
              </div>
            </>
          )}

          {selectedWeatherType !== 'swell' && (
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
                    <span className="text-xs">Opacity: {heatmapIntensity}</span>
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

}
