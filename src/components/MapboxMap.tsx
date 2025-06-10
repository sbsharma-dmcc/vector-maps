import React, { useRef, useState, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import 'mapbox-gl/dist/mapbox-gl.css';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import MapTopControls from './MapTopControls';
import { dtnToken } from '@/utils/mapConstants';

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
  const [heatmapGradient, setHeatmapGradient] = useState([
    { value: '0m', color: 'rgb(0, 0, 139)' },      // Dark blue (0-0.5m)
    { value: '1m', color: 'rgb(0, 100, 255)' },    // Blue (0.5-1.0m)
    { value: '2m', color: 'rgb(0, 150, 255)' },    // Light blue (1.0-1.5m)
    { value: '3m', color: 'rgb(0, 200, 255)' },    // Cyan (1.5-2.0m)
    { value: '4m', color: 'rgb(0, 255, 200)' },    // Light cyan (2.0-2.5m)
    { value: '5m', color: 'rgb(100, 255, 100)' },  // Light green (2.5-3.0m)
    { value: '6m', color: 'rgb(200, 255, 0)' },    // Yellow-green (3.0-3.5m)
    { value: '8m', color: 'rgb(255, 255, 0)' },    // Yellow (3.5-4.0m)
    { value: '10m', color: 'rgb(255, 200, 0)' },   // Orange (4.0-4.5m)
    { value: '12m', color: 'rgb(255, 150, 0)' },   // Orange-red (4.5-5.0m)
    { value: '14m', color: 'rgb(255, 100, 100)' }, // Pink (5.0-10.0m)
    { value: '15m+', color: 'rgb(200, 0, 200)' }   // Purple (10.0m+)
  ]);
  const { toast } = useToast();

  const token = dtnToken.replace('Bearer ', '');

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
      // Create color expression based on wave height values
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

        // Special handling for swell layer as filled polygons with gradient
        if (overlay === 'swell') {
          // Create color expression based on wave height values
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
