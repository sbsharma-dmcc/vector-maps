import React, { useRef, useState, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import 'mapbox-gl/dist/mapbox-gl.css';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
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
  
  // Enhanced configuration state for each layer type
  const [layerConfigs, setLayerConfigs] = useState({
    wind: {
      textColor: '#ffffff',
      textSize: 16,
      textOpacity: 0.9,
      haloColor: '#000000',
      haloWidth: 1,
      symbolSpacing: 80,
      allowOverlap: true,
      barbStyle: 'full', // full, half, pennant
      speedUnit: 'knots' // knots, ms, kmh
    },
    pressure: {
      lineColor: '#ff6b35',
      lineWidth: 1,
      lineOpacity: 0.6,
      lineCap: 'round',
      lineJoin: 'round',
      lineBlur: 0,
      lineGapWidth: 0
    },
    swell: {
      fillOpacity: 0.8,
      fillOutlineColor: 'transparent',
      animationSpeed: 0.001,
      animationEnabled: true,
      fillAntialias: true,
      gradient: [
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
      ]
    },
    symbol: {
      textColor: '#ff0000',
      textSize: 16,
      textOpacity: 0.8,
      haloColor: '#000000',
      haloWidth: 1,
      symbolSpacing: 100,
      allowOverlap: true,
      rotationAlignment: 'map',
      symbolType: 'arrow', // arrow, triangle, circle, square
      customSymbol: '→'
    }
  });

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

  // Function to get symbol based on type
  const getSymbolByType = (symbolType: string, customSymbol?: string) => {
    switch (symbolType) {
      case 'arrow':
        return '→';
      case 'triangle':
        return '▲';
      case 'circle':
        return '●';
      case 'square':
        return '■';
      case 'custom':
        return customSymbol || '→';
      default:
        return '→';
    }
  };

  // Function to ensure vessels are always on top
  const ensureVesselsOnTop = () => {
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

  // Enhanced layer update functions
  const updateLayerProperties = (layerType, properties) => {
    if (!mapref.current || !mapref.current.isStyleLoaded()) return;
    
    const layerId = `dtn-layer-${layerType}`;
    
    if (!mapref.current.getLayer(layerId)) return;

    Object.entries(properties).forEach(([property, value]) => {
      try {
        mapref.current.setPaintProperty(layerId, property, value);
        console.log(`Updated ${layerType} ${property} to`, value);
      } catch (error) {
        console.warn(`Failed to update ${property}:`, error);
      }
    });
  };

  const updateLayoutProperties = (layerType, properties) => {
    if (!mapref.current || !mapref.current.isStyleLoaded()) return;
    
    const layerId = `dtn-layer-${layerType}`;
    
    if (!mapref.current.getLayer(layerId)) return;

    Object.entries(properties).forEach(([property, value]) => {
      try {
        mapref.current.setLayoutProperty(layerId, property, value);
        console.log(`Updated ${layerType} layout ${property} to`, value);
      } catch (error) {
        console.warn(`Failed to update layout ${property}:`, error);
      }
    });
  };

  // Add animation to swell layer
  const animateSwell = () => {
    if (!mapref.current || !mapref.current.isStyleLoaded()) return;
    
    const layerId = `dtn-layer-swell`;
    
    if (mapref.current.getLayer(layerId)) {
      let offset = 0;
      
      const animate = () => {
        if (!mapref.current || !mapref.current.getLayer(layerId)) return;
        
        offset += layerConfigs.swell.animationSpeed;
        
        if (layerConfigs.swell.animationEnabled) {
          mapref.current.setPaintProperty(layerId, 'fill-translate', [
            Math.sin(offset * 2) * 2,
            Math.cos(offset) * 1
          ]);
        }
        
        requestAnimationFrame(animate);
      };
      
      animate();
      console.log('Started swell animation');
    }
  };

  // Enhanced wind barb function to match meteorological standards
  const createStandardWindBarb = (speed: number, unit: string = 'knots') => {
    // Convert speed to knots if needed
    let speedKnots = speed;
    if (unit === 'ms') speedKnots = speed * 1.944;
    if (unit === 'kmh') speedKnots = speed * 0.54;

    // Calm conditions (0-2 knots) - Circle
    if (speedKnots < 3) {
      return '○';
    }

    // Light air (3-7 knots) - Staff only
    if (speedKnots < 8) {
      return '│';
    }

    let barb = '│'; // Base staff
    let remainingSpeed = Math.round(speedKnots);
    
    // Add pennants for every 50 knots (triangular flags)
    const pennants = Math.floor(remainingSpeed / 50);
    for (let i = 0; i < pennants; i++) {
      barb = '▲' + barb;
    }
    remainingSpeed = remainingSpeed % 50;
    
    // Add full barbs for every 10 knots
    const fullBarbs = Math.floor(remainingSpeed / 10);
    for (let i = 0; i < fullBarbs; i++) {
      barb = barb + '━';
    }
    remainingSpeed = remainingSpeed % 10;
    
    // Add half barb for 5-9 knots remainder
    if (remainingSpeed >= 5) {
      barb = barb + '╸';
    }
    
    return barb;
  };

  const handleOverlayClick = async (overlay) => {
    if (!mapref.current || !mapref.current.isStyleLoaded()) {
      console.warn("Map style not yet loaded");
      return;
    }

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

        let beforeId = undefined;

        if (overlay === 'swell') {
          const colorExpression: any[] = [
            'interpolate',
            ['linear'],
            ['to-number', ['get', 'value'], 0]
          ];

          layerConfigs.swell.gradient.forEach((item) => {
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
              "fill-opacity": layerConfigs.swell.fillOpacity,
              "fill-outline-color": layerConfigs.swell.fillOutlineColor,
              "fill-translate": [0, 0],
              "fill-translate-transition": {
                "duration": 0,
                "delay": 0
              },
              "fill-antialias": layerConfigs.swell.fillAntialias
            },
          }, beforeId);
          
          setTimeout(() => animateSwell(), 100);
        } else if (overlay === 'wind') {
          // Fixed wind barb expression with proper Mapbox GL JS syntax
          const windBarbExpression = [
            'case',
            ['has', 'value'],
            [
              'case',
              ['<', ['to-number', ['get', 'value']], 3], '○',
              ['<', ['to-number', ['get', 'value']], 8], '│',
              ['<', ['to-number', ['get', 'value']], 13], '│╸',
              ['<', ['to-number', ['get', 'value']], 18], '│━',
              ['<', ['to-number', ['get', 'value']], 23], '│━╸',
              ['<', ['to-number', ['get', 'value']], 28], '│━━',
              ['<', ['to-number', ['get', 'value']], 33], '│━━╸',
              ['<', ['to-number', ['get', 'value']], 38], '│━━━',
              ['<', ['to-number', ['get', 'value']], 43], '│━━━╸',
              ['<', ['to-number', ['get', 'value']], 48], '│━━━━',
              ['<', ['to-number', ['get', 'value']], 53], '│━━━━╸',
              ['<', ['to-number', ['get', 'value']], 63], '▲│',
              ['<', ['to-number', ['get', 'value']], 68], '▲│╸',
              ['<', ['to-number', ['get', 'value']], 73], '▲│━',
              ['<', ['to-number', ['get', 'value']], 78], '▲│━╸',
              ['<', ['to-number', ['get', 'value']], 83], '▲│━━',
              ['<', ['to-number', ['get', 'value']], 88], '▲│━━╸',
              ['<', ['to-number', ['get', 'value']], 93], '▲│━━━',
              ['<', ['to-number', ['get', 'value']], 98], '▲│━━━╸',
              ['<', ['to-number', ['get', 'value']], 103], '▲│━━━━',
              '▲▲│'
            ],
            '│'
          ];

          mapref.current.addLayer({
            id: layerId,
            type: "symbol",
            source: sourceId,
            "source-layer": sourceLayer,
            layout: {
              "text-field": windBarbExpression,
              "text-size": layerConfigs.wind.textSize,
              "text-rotation-alignment": "map",
              "text-rotate": ["get", "direction"],
              "text-allow-overlap": layerConfigs.wind.allowOverlap,
              "text-ignore-placement": true,
              "symbol-spacing": layerConfigs.wind.symbolSpacing,
              "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"]
            },
            paint: {
              "text-color": layerConfigs.wind.textColor,
              "text-opacity": layerConfigs.wind.textOpacity,
              "text-halo-color": layerConfigs.wind.haloColor,
              "text-halo-width": layerConfigs.wind.haloWidth
            },
          }, beforeId);
        } else if (overlay === 'symbol') {
          const symbolConfig = layerConfigs.symbol;
          const symbolText = getSymbolByType(symbolConfig.symbolType, symbolConfig.customSymbol);
          
          mapref.current.addLayer({
            id: layerId,
            type: "symbol",
            source: sourceId,
            "source-layer": sourceLayer,
            layout: {
              "text-field": symbolText,
              "text-size": symbolConfig.textSize,
              "text-rotation-alignment": symbolConfig.rotationAlignment,
              "text-rotate": ["get", "direction"],
              "text-allow-overlap": symbolConfig.allowOverlap,
              "text-ignore-placement": true,
              "symbol-spacing": symbolConfig.symbolSpacing
            },
            paint: {
              "text-color": symbolConfig.textColor,
              "text-opacity": symbolConfig.textOpacity,
              "text-halo-color": symbolConfig.haloColor,
              "text-halo-width": symbolConfig.haloWidth
            },
          }, beforeId);
        } else {
          mapref.current.addLayer({
            id: layerId,
            type: "line",
            source: sourceId,
            "source-layer": sourceLayer,
            layout: {
              "line-cap": layerConfigs.pressure.lineCap,
              "line-join": layerConfigs.pressure.lineJoin,
            },
            paint: {
              "line-color": layerConfigs.pressure.lineColor,
              "line-width": layerConfigs.pressure.lineWidth,
              "line-opacity": layerConfigs.pressure.lineOpacity,
              "line-blur": layerConfigs.pressure.lineBlur,
              "line-gap-width": layerConfigs.pressure.lineGapWidth
            },
          }, beforeId);
        }

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

    ensureVesselsOnTop();
    setActiveOverlays(prev => prev.filter(item => item !== overlay));
  };

  const removeAllOverlays = () => {
    activeOverlays.forEach(overlay => removeOverlay(overlay));
    setActiveOverlays([]);
    ensureVesselsOnTop();
    
    toast({
      title: "All Layers Removed",
      description: "All weather layers have been removed from the map"
    });
  };

  // Enhanced configuration update functions
  const updateConfigValue = (layerType, property, value) => {
    setLayerConfigs(prev => ({
      ...prev,
      [layerType]: {
        ...prev[layerType],
        [property]: value
      }
    }));
  };

  const applyLayerConfiguration = () => {
    const config = layerConfigs[selectedWeatherType];
    
    if (selectedWeatherType === 'swell') {
      const colorExpression: any[] = [
        'interpolate',
        ['linear'],
        ['to-number', ['get', 'value'], 0]
      ];

      config.gradient.forEach((item) => {
        const heightValue = parseFloat(item.value.replace('m', '').replace('+', ''));
        colorExpression.push(heightValue, item.color);
      });

      updateLayerProperties(selectedWeatherType, {
        'fill-color': colorExpression,
        'fill-opacity': config.fillOpacity,
        'fill-outline-color': config.fillOutlineColor,
        'fill-antialias': config.fillAntialias
      });
    } else if (selectedWeatherType === 'pressure') {
      updateLayerProperties(selectedWeatherType, {
        'line-color': config.lineColor,
        'line-width': config.lineWidth,
        'line-opacity': config.lineOpacity,
        'line-blur': config.lineBlur,
        'line-gap-width': config.lineGapWidth
      });
      
      updateLayoutProperties(selectedWeatherType, {
        'line-cap': config.lineCap,
        'line-join': config.lineJoin
      });
    } else if (selectedWeatherType === 'wind') {
      updateLayerProperties(selectedWeatherType, {
        'text-color': config.textColor,
        'text-opacity': config.textOpacity,
        'text-halo-color': config.haloColor,
        'text-halo-width': config.haloWidth
      });
      
      updateLayoutProperties(selectedWeatherType, {
        'text-size': config.textSize,
        'text-allow-overlap': config.allowOverlap,
        'symbol-spacing': config.symbolSpacing
      });
    } else if (selectedWeatherType === 'symbol') {
      const symbolText = getSymbolByType(config.symbolType, config.customSymbol);
      
      updateLayerProperties(selectedWeatherType, {
        'text-color': config.textColor,
        'text-opacity': config.textOpacity,
        'text-halo-color': config.haloColor,
        'text-halo-width': config.haloWidth
      });
      
      updateLayoutProperties(selectedWeatherType, {
        'text-size': config.textSize,
        'text-allow-overlap': config.allowOverlap,
        'symbol-spacing': config.symbolSpacing,
        'text-rotation-alignment': config.rotationAlignment,
        'text-field': symbolText
      });
    }

    toast({
      title: "Configuration Applied",
      description: `${selectedWeatherType} layer configuration updated successfully`
    });
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

  const renderConfigurationPanel = () => {
    const config = layerConfigs[selectedWeatherType];

    return (
      <div className="space-y-4">
        {selectedWeatherType === 'swell' && (
          <>
            <div>
              <Label className="text-xs font-medium text-gray-700">Fill Opacity</Label>
              <div className="flex items-center gap-2">
                <Slider
                  value={[config.fillOpacity]}
                  onValueChange={([value]) => updateConfigValue('swell', 'fillOpacity', value)}
                  min={0}
                  max={1}
                  step={0.1}
                  className="flex-1"
                />
                <span className="text-xs w-12">{config.fillOpacity}</span>
              </div>
            </div>

            <div>
              <Label className="text-xs font-medium text-gray-700">Fill Outline Color</Label>
              <Input
                type="color"
                value={config.fillOutlineColor === 'transparent' ? '#000000' : config.fillOutlineColor}
                onChange={(e) => updateConfigValue('swell', 'fillOutlineColor', e.target.value)}
                className="w-full h-8"
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={config.fillAntialias}
                onCheckedChange={(checked) => updateConfigValue('swell', 'fillAntialias', checked)}
              />
              <Label className="text-xs">Anti-aliasing</Label>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={config.animationEnabled}
                onCheckedChange={(checked) => updateConfigValue('swell', 'animationEnabled', checked)}
              />
              <Label className="text-xs">Animation</Label>
            </div>

            {config.animationEnabled && (
              <div>
                <Label className="text-xs font-medium text-gray-700">Animation Speed</Label>
                <Slider
                  value={[config.animationSpeed * 1000]}
                  onValueChange={([value]) => updateConfigValue('swell', 'animationSpeed', value / 1000)}
                  min={0.1}
                  max={5}
                  step={0.1}
                  className="flex-1"
                />
              </div>
            )}

            <div>
              <Label className="text-xs font-medium text-gray-700 mb-2">Wave Height Gradient</Label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {config.gradient.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      type="color"
                      value={convertRgbToHex(item.color)}
                      onChange={(e) => {
                        const newGradient = [...config.gradient];
                        newGradient[index].color = convertHexToRgb(e.target.value);
                        updateConfigValue('swell', 'gradient', newGradient);
                      }}
                      className="w-8 h-6 p-0"
                    />
                    <span className="text-xs w-10">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {selectedWeatherType === 'pressure' && (
          <>
            <div>
              <Label className="text-xs font-medium text-gray-700">Line Color</Label>
              <Input
                type="color"
                value={config.lineColor}
                onChange={(e) => updateConfigValue('pressure', 'lineColor', e.target.value)}
                className="w-full h-8"
              />
            </div>

            <div>
              <Label className="text-xs font-medium text-gray-700">Line Width</Label>
              <Slider
                value={[config.lineWidth]}
                onValueChange={([value]) => updateConfigValue('pressure', 'lineWidth', value)}
                min={0.5}
                max={10}
                step={0.5}
                className="flex-1"
              />
            </div>

            <div>
              <Label className="text-xs font-medium text-gray-700">Line Opacity</Label>
              <Slider
                value={[config.lineOpacity]}
                onValueChange={([value]) => updateConfigValue('pressure', 'lineOpacity', value)}
                min={0}
                max={1}
                step={0.1}
                className="flex-1"
              />
            </div>

            <div>
              <Label className="text-xs font-medium text-gray-700">Line Blur</Label>
              <Slider
                value={[config.lineBlur]}
                onValueChange={([value]) => updateConfigValue('pressure', 'lineBlur', value)}
                min={0}
                max={5}
                step={0.5}
                className="flex-1"
              />
            </div>

            <div>
              <Label className="text-xs font-medium text-gray-700">Line Gap Width</Label>
              <Slider
                value={[config.lineGapWidth]}
                onValueChange={([value]) => updateConfigValue('pressure', 'lineGapWidth', value)}
                min={0}
                max={10}
                step={1}
                className="flex-1"
              />
            </div>

            <div>
              <Label className="text-xs font-medium text-gray-700">Line Cap</Label>
              <Select 
                value={config.lineCap} 
                onValueChange={(value) => updateConfigValue('pressure', 'lineCap', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="butt">Butt</SelectItem>
                  <SelectItem value="round">Round</SelectItem>
                  <SelectItem value="square">Square</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-medium text-gray-700">Line Join</Label>
              <Select 
                value={config.lineJoin} 
                onValueChange={(value) => updateConfigValue('pressure', 'lineJoin', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bevel">Bevel</SelectItem>
                  <SelectItem value="round">Round</SelectItem>
                  <SelectItem value="miter">Miter</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {selectedWeatherType === 'wind' && (
          <>
            <div>
              <Label className="text-xs font-medium text-gray-700">Wind Barb Color</Label>
              <Input
                type="color"
                value={config.textColor}
                onChange={(e) => updateConfigValue('wind', 'textColor', e.target.value)}
                className="w-full h-8"
              />
            </div>

            <div>
              <Label className="text-xs font-medium text-gray-700">Wind Barb Size</Label>
              <Slider
                value={[config.textSize]}
                onValueChange={([value]) => updateConfigValue('wind', 'textSize', value)}
                min={8}
                max={32}
                step={1}
                className="flex-1"
              />
            </div>

            <div>
              <Label className="text-xs font-medium text-gray-700">Wind Barb Opacity</Label>
              <Slider
                value={[config.textOpacity]}
                onValueChange={([value]) => updateConfigValue('wind', 'textOpacity', value)}
                min={0}
                max={1}
                step={0.1}
                className="flex-1"
              />
            </div>

            <div>
              <Label className="text-xs font-medium text-gray-700">Halo Color</Label>
              <Input
                type="color"
                value={config.haloColor}
                onChange={(e) => updateConfigValue('wind', 'haloColor', e.target.value)}
                className="w-full h-8"
              />
            </div>

            <div>
              <Label className="text-xs font-medium text-gray-700">Halo Width</Label>
              <Slider
                value={[config.haloWidth]}
                onValueChange={([value]) => updateConfigValue('wind', 'haloWidth', value)}
                min={0}
                max={5}
                step={0.5}
                className="flex-1"
              />
            </div>

            <div>
              <Label className="text-xs font-medium text-gray-700">Barb Spacing</Label>
              <Slider
                value={[config.symbolSpacing]}
                onValueChange={([value]) => updateConfigValue('wind', 'symbolSpacing', value)}
                min={20}
                max={200}
                step={10}
                className="flex-1"
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={config.allowOverlap}
                onCheckedChange={(checked) => updateConfigValue('wind', 'allowOverlap', checked)}
              />
              <Label className="text-xs">Allow Overlap</Label>
            </div>

            <div>
              <Label className="text-xs font-medium text-gray-700">Speed Unit</Label>
              <Select 
                value={config.speedUnit} 
                onValueChange={(value) => updateConfigValue('wind', 'speedUnit', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="knots">Knots</SelectItem>
                  <SelectItem value="ms">m/s</SelectItem>
                  <SelectItem value="kmh">km/h</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-medium text-gray-700">Barb Style</Label>
              <Select 
                value={config.barbStyle} 
                onValueChange={(value) => updateConfigValue('wind', 'barbStyle', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Full Barbs</SelectItem>
                  <SelectItem value="half">Half Barbs</SelectItem>
                  <SelectItem value="pennant">Pennant Style</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="text-xs text-gray-500 mt-2 p-2 bg-gray-50 rounded">
              <div className="font-semibold mb-1">Wind Barb Legend:</div>
              <div>○ = Calm (0-2 kts)</div>
              <div>│ = Light air (3-7 kts)</div>
              <div>│╸ = Half barb (5 kts)</div>
              <div>│━ = Full barb (10 kts)</div>
              <div>▲ = Pennant (50 kts)</div>
            </div>
          </>
        )}

        {selectedWeatherType === 'symbol' && (
          <>
            <div>
              <Label className="text-xs font-medium text-gray-700">Symbol Type</Label>
              <Select 
                value={config.symbolType} 
                onValueChange={(value) => updateConfigValue('symbol', 'symbolType', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="arrow">Arrow (→)</SelectItem>
                  <SelectItem value="triangle">Triangle (▲)</SelectItem>
                  <SelectItem value="circle">Circle (●)</SelectItem>
                  <SelectItem value="square">Square (■)</SelectItem>
                  <SelectItem value="custom">Custom Symbol</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {config.symbolType === 'custom' && (
              <div>
                <Label className="text-xs font-medium text-gray-700">Custom Symbol</Label>
                <Input
                  type="text"
                  value={config.customSymbol}
                  onChange={(e) => updateConfigValue('symbol', 'customSymbol', e.target.value)}
                  placeholder="Enter custom symbol (e.g., ★, ✈, ⚡)"
                  maxLength={3}
                  className="w-full"
                />
              </div>
            )}

            <div>
              <Label className="text-xs font-medium text-gray-700">Symbol Color</Label>
              <Input
                type="color"
                value={config.textColor}
                onChange={(e) => updateConfigValue('symbol', 'textColor', e.target.value)}
                className="w-full h-8"
              />
            </div>

            <div>
              <Label className="text-xs font-medium text-gray-700">Symbol Size</Label>
              <Slider
                value={[config.textSize]}
                onValueChange={([value]) => updateConfigValue('symbol', 'textSize', value)}
                min={8}
                max={32}
                step={1}
                className="flex-1"
              />
            </div>

            <div>
              <Label className="text-xs font-medium text-gray-700">Symbol Opacity</Label>
              <Slider
                value={[config.textOpacity]}
                onValueChange={([value]) => updateConfigValue('symbol', 'textOpacity', value)}
                min={0}
                max={1}
                step={0.1}
                className="flex-1"
              />
            </div>

            <div>
              <Label className="text-xs font-medium text-gray-700">Halo Color</Label>
              <Input
                type="color"
                value={config.haloColor}
                onChange={(e) => updateConfigValue('symbol', 'haloColor', e.target.value)}
                className="w-full h-8"
              />
            </div>

            <div>
              <Label className="text-xs font-medium text-gray-700">Halo Width</Label>
              <Slider
                value={[config.haloWidth]}
                onValueChange={([value]) => updateConfigValue('symbol', 'haloWidth', value)}
                min={0}
                max={5}
                step={0.5}
                className="flex-1"
              />
            </div>

            <div>
              <Label className="text-xs font-medium text-gray-700">Symbol Spacing</Label>
              <Slider
                value={[config.symbolSpacing]}
                onValueChange={([value]) => updateConfigValue('symbol', 'symbolSpacing', value)}
                min={20}
                max={200}
                step={10}
                className="flex-1"
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={config.allowOverlap}
                onCheckedChange={(checked) => updateConfigValue('symbol', 'allowOverlap', checked)}
              />
              <Label className="text-xs">Allow Overlap</Label>
            </div>

            <div>
              <Label className="text-xs font-medium text-gray-700">Rotation Alignment</Label>
              <Select 
                value={config.rotationAlignment} 
                onValueChange={(value) => updateConfigValue('symbol', 'rotationAlignment', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="map">Map</SelectItem>
                  <SelectItem value="viewport">Viewport</SelectItem>
                  <SelectItem value="auto">Auto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}
      </div>
    );
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

      <div className="absolute top-32 right-4 z-20 bg-white rounded-lg shadow-lg p-4 min-w-[360px] max-h-[80vh] overflow-y-auto">
        <h3 className="text-sm font-semibold mb-3">Weather Layer Configuration</h3>
        
        <div className="space-y-4">
          <div>
            <Label className="block text-xs font-medium text-gray-700 mb-1">
              Weather Type
            </Label>
            <Select value={selectedWeatherType} onValueChange={setSelectedWeatherType}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select weather type" />
              </SelectTrigger>
              <SelectContent className="bg-white border shadow-lg z-50">
                <SelectItem value="wind">Wind Barbs</SelectItem>
                <SelectItem value="pressure">Pressure</SelectItem>
                <SelectItem value="swell">Swell (Filled)</SelectItem>
                <SelectItem value="symbol">Symbol</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {renderConfigurationPanel()}

          <Button 
            onClick={applyLayerConfiguration}
            className="w-full"
            size="sm"
          >
            Apply Configuration
          </Button>

          <div className="text-xs text-gray-500 mt-4 pt-4 border-t">
            <div className="font-medium mb-2">Active Layers: {activeOverlays.length}</div>
            {activeOverlays.map(layer => (
              <div key={layer} className="text-xs capitalize">
                • {layer}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapboxMap;

</edits_to_apply>
