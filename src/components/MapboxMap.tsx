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
import { Lock, Unlock, Save, Trash2 } from 'lucide-react';
import MapTopControls from './MapTopControls';
import { dtnToken } from '@/utils/mapConstants';
import { createVesselMarkers, cleanupVesselMarkers, Vessel } from '@/utils/vesselMarkers';
import WeatherConfigDrafts from './WeatherConfigDrafts';

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

interface WeatherLayerDraft {
  id: string;
  name: string;
  weatherType: string;
  config: any;
  createdAt: string;
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
  const mapref = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const [showLayers, setShowLayers] = useState(false);
  const [activeOverlays, setActiveOverlays] = useState<string[]>([]);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [selectedWeatherType, setSelectedWeatherType] = useState('wind');
  const [selectedDraft, setSelectedDraft] = useState<string>('');
  const [weatherDrafts, setWeatherDrafts] = useState<WeatherLayerDraft[]>([]);
  const [swellConfigLocked, setSwellConfigLocked] = useState(false);
  
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
      barbStyle: 'full',
      speedUnit: 'knots'
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
      fillOpacity: 0.9,
      fillOutlineColor: 'transparent',
      animationSpeed: 0.0008,
      animationEnabled: true,
      fillAntialias: true,
      smoothing: true,
      blurRadius: 2,
      edgeFeathering: 1.5,
      // New radial gradient properties
      useRadialGradient: true,
      radialGradientCenter: [0.5, 0.5], // center point (0-1, 0-1)
      radialGradientRadius: 0.8, // radius (0-1)
      radialGradientInnerOpacity: 0.2,
      radialGradientOuterOpacity: 0.9,
      // New blur properties
      layerBlurEnabled: true,
      layerBlurRadius: 3,
      layerBlurIntensity: 0.5,
      gradient: [
        { value: '0m', color: 'rgba(30, 50, 80, 0.3)', opacity: 0.3 },        // Deep blue (very light)
        { value: '0.5m', color: 'rgba(45, 85, 120, 0.4)', opacity: 0.4 },     // Dark blue
        { value: '1m', color: 'rgba(60, 120, 160, 0.5)', opacity: 0.5 },      // Medium blue
        { value: '1.5m', color: 'rgba(80, 150, 180, 0.55)', opacity: 0.55 },  // Light blue
        { value: '2m', color: 'rgba(100, 180, 200, 0.6)', opacity: 0.6 },     // Cyan-blue
        { value: '2.5m', color: 'rgba(120, 200, 180, 0.65)', opacity: 0.65 }, // Blue-green
        { value: '3m', color: 'rgba(140, 210, 160, 0.7)', opacity: 0.7 },     // Green-blue
        { value: '3.5m', color: 'rgba(160, 220, 140, 0.75)', opacity: 0.75 }, // Light green
        { value: '4m', color: 'rgba(180, 230, 120, 0.8)', opacity: 0.8 },     // Yellow-green
        { value: '4.5m', color: 'rgba(200, 235, 100, 0.82)', opacity: 0.82 }, // Yellow
        { value: '5m', color: 'rgba(220, 220, 80, 0.84)', opacity: 0.84 },    // Orange-yellow
        { value: '5.5m', color: 'rgba(240, 200, 60, 0.86)', opacity: 0.86 },  // Orange
        { value: '6m', color: 'rgba(250, 180, 50, 0.88)', opacity: 0.88 },    // Dark orange
        { value: '6.5m', color: 'rgba(255, 160, 40, 0.9)', opacity: 0.9 },    // Red-orange
        { value: '7m', color: 'rgba(255, 140, 35, 0.9)', opacity: 0.9 },      // Red
        { value: '7.5m', color: 'rgba(255, 120, 30, 0.9)', opacity: 0.9 },    // Bright red
        { value: '8m', color: 'rgba(255, 100, 25, 0.9)', opacity: 0.9 },      // Dark red
        { value: '8.5m', color: 'rgba(250, 80, 20, 0.9)', opacity: 0.9 },     // Deep red
        { value: '9m', color: 'rgba(240, 60, 15, 0.9)', opacity: 0.9 },       // Crimson
        { value: '9.5m', color: 'rgba(220, 40, 10, 0.9)', opacity: 0.9 },     // Dark crimson
        { value: '10m+', color: 'rgba(200, 20, 5, 0.9)', opacity: 0.9 }       // Very dark red
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
      symbolType: 'arrow',
      customSymbol: '→'
    }
  });

  const { toast } = useToast();

  // Load weather drafts from localStorage on component mount
  useEffect(() => {
    const savedDrafts = localStorage.getItem('weatherLayerDrafts');
    if (savedDrafts) {
      try {
        setWeatherDrafts(JSON.parse(savedDrafts));
      } catch (error) {
        console.error('Error loading weather drafts:', error);
      }
    }
  }, []);

  // Save weather drafts to localStorage whenever drafts change
  useEffect(() => {
    localStorage.setItem('weatherLayerDrafts', JSON.stringify(weatherDrafts));
  }, [weatherDrafts]);

  const token = dtnToken.replace('Bearer ', '');
  console.log('DTN Token being used:', token.substring(0, 50) + '...');

  const dtnOverlays = {
    wind: { dtnLayerId: 'fcst-manta-wind-speed-contours', tileSetId: 'b864ff86-22af-41fc-963e-38837d457566' },
    pressure: { dtnLayerId: 'fcst-manta-mean-sea-level-pressure-isolines', tileSetId: '2703fb6d-0ace-43a3-aca1-76588e3ac9a8' },
    swell: { dtnLayerId: 'fcst-sea-wave-height-swell-waves-contours', tileSetId: 'd3f83398-2e88-4c2b-a82f-c10db6891bb3' },
    symbol: { dtnLayerId: 'fcst-manta-wind-symbol-grid', tileSetId: 'dd44281e-db07-41a1-a329-bedc225bb575' },
  };

  // Enhanced vessel coordinates with circle vessels added
  const mockVessels: Vessel[] = [
    { id: 'vessel-1', name: 'Green Vessel 1', type: 'green', position: [72.5, 15.2] },
    { id: 'vessel-2', name: 'Orange Vessel 1', type: 'orange', position: [78.8, 12.1] },
    { id: 'vessel-3', name: 'Green Vessel 2', type: 'green', position: [85.2, 18.5] },
    { id: 'vessel-4', name: 'Orange Vessel 2', type: 'orange', position: [80.1, 6.8] },
    { id: 'vessel-5', name: 'Green Vessel 3', type: 'green', position: [90.5, 14.3] },
    { id: 'vessel-6', name: 'Orange Vessel 3', type: 'orange', position: [75.2, 20.1] },
    { id: 'vessel-7', name: 'Green Vessel 4', type: 'green', position: [68.7, 18.9] },
    { id: 'vessel-8', name: 'Orange Vessel 4', type: 'orange', position: [82.4, 10.5] },
    { id: 'vessel-9', name: 'Green Vessel 5', type: 'green', position: [87.9, 21.7] },
    { id: 'vessel-10', name: 'Orange Vessel 5', type: 'orange', position: [76.8, 8.3] },
    { id: 'vessel-11', name: 'Green Vessel 6', type: 'green', position: [81.6, 16.4] },
    { id: 'vessel-12', name: 'Orange Vessel 6', type: 'orange', position: [88.2, 11.7] },
    { id: 'vessel-13', name: 'Green Vessel 7', type: 'green', position: [74.1, 13.6] },
    { id: 'vessel-14', name: 'Orange Vessel 7', type: 'orange', position: [79.5, 22.4] },
    { id: 'vessel-15', name: 'Green Vessel 8', type: 'green', position: [84.7, 7.2] },
    { id: 'circle-1', name: 'Circle Vessel 1', type: 'circle', position: [70.5, 12.8] },
    { id: 'circle-2', name: 'Circle Vessel 2', type: 'circle', position: [83.2, 15.7] },
    { id: 'circle-3', name: 'Circle Vessel 3', type: 'circle', position: [77.1, 9.5] },
    { id: 'circle-4', name: 'Circle Vessel 4', type: 'circle', position: [86.8, 19.2] },
    { id: 'circle-5', name: 'Circle Vessel 5', type: 'circle', position: [73.9, 17.4] },
  ];

  // Get the next available draft number for a weather type
  const getNextDraftNumber = (weatherType: string) => {
    const existingDrafts = weatherDrafts.filter(draft => draft.weatherType === weatherType);
    const numbers = existingDrafts.map(draft => {
      const match = draft.name.match(/Draft (\d+)/);
      return match ? parseInt(match[1]) : 0;
    });
    const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0;
    return maxNumber + 1;
  };

  // Save current configuration as a draft
  const saveConfigurationAsDraft = () => {
    const currentConfig = layerConfigs[selectedWeatherType];
    const draftNumber = getNextDraftNumber(selectedWeatherType);
    
    const newDraft: WeatherLayerDraft = {
      id: `${selectedWeatherType}-${Date.now()}`,
      name: `Draft ${draftNumber}`,
      weatherType: selectedWeatherType,
      config: JSON.parse(JSON.stringify(currentConfig)),
      createdAt: new Date().toISOString()
    };

    setWeatherDrafts(prev => [...prev, newDraft]);
    
    toast({
      title: "Configuration Saved",
      description: `${selectedWeatherType} configuration saved as ${newDraft.name}`
    });
  };

  // Load a draft configuration
  const loadDraft = (draftId: string) => {
    const draft = weatherDrafts.find(d => d.id === draftId);
    if (draft) {
      setLayerConfigs(prev => ({
        ...prev,
        [draft.weatherType]: draft.config
      }));
      
      // Apply the configuration if the layer is active
      if (activeOverlays.includes(draft.weatherType)) {
        applySpecificLayerConfiguration(draft.weatherType, draft.config);
      }
      
      setSelectedDraft(draftId);
      
      toast({
        title: "Draft Loaded",
        description: `${draft.weatherType} ${draft.name} has been loaded`
      });
    }
  };

  // Delete a draft
  const deleteDraft = (draftId: string) => {
    const draft = weatherDrafts.find(d => d.id === draftId);
    if (draft) {
      setWeatherDrafts(prev => prev.filter(d => d.id !== draftId));
      if (selectedDraft === draftId) {
        setSelectedDraft('');
      }
      
      toast({
        title: "Draft Deleted",
        description: `${draft.weatherType} ${draft.name} has been deleted`
      });
    }
  };

  // Get drafts for the currently selected weather type
  const getCurrentWeatherTypeDrafts = () => {
    return weatherDrafts.filter(draft => draft.weatherType === selectedWeatherType);
  };

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
      container: mapContainerRef.current!,
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

  // Clear selected draft when weather type changes
  useEffect(() => {
    setSelectedDraft('');
  }, [selectedWeatherType]);

  const fetchDTNSourceLayer = async (layerId: string) => {
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

  // Enhanced function to create radial gradient color expression
  const createRadialGradientExpression = (config: any) => {
    if (!config.useRadialGradient) {
      // Return regular color expression
      const colorExpression: any[] = [
        'interpolate',
        ['exponential', 1.5],
        ['to-number', ['get', 'value'], 0]
      ];

      config.gradient.forEach((item: any) => {
        const heightValue = parseFloat(item.value.replace('m', '').replace('+', ''));
        colorExpression.push(heightValue, item.color);
      });

      return colorExpression;
    }

    // Create radial gradient expression
    const baseColorExpression: any[] = [
      'interpolate',
      ['exponential', 1.5],
      ['to-number', ['get', 'value'], 0]
    ];

    config.gradient.forEach((item: any) => {
      const heightValue = parseFloat(item.value.replace('m', '').replace('+', ''));
      baseColorExpression.push(heightValue, item.color);
    });

    // Apply radial gradient effect using distance from center
    return [
      'interpolate',
      ['linear'],
      [
        'distance',
        ['literal', config.radialGradientCenter],
        [
          'array',
          ['/', ['get', 'x'], ['get', 'width']],
          ['/', ['get', 'y'], ['get', 'height']]
        ]
      ],
      0, baseColorExpression,
      config.radialGradientRadius, [
        'rgba',
        ['get', 'r', baseColorExpression],
        ['get', 'g', baseColorExpression],
        ['get', 'b', baseColorExpression],
        config.radialGradientOuterOpacity
      ]
    ];
  };

  // Enhanced layer update functions
  const updateLayerProperties = (layerType: string, properties: Record<string, any>) => {
    if (!mapref.current || !mapref.current.isStyleLoaded()) return;
    
    const layerId = `dtn-layer-${layerType}`;
    
    if (!mapref.current.getLayer(layerId)) return;

    Object.entries(properties).forEach(([property, value]) => {
      try {
        mapref.current!.setPaintProperty(layerId, property, value);
        console.log(`Updated ${layerType} ${property} to`, value);
      } catch (error) {
        console.warn(`Failed to update ${property}:`, error);
      }
    });
  };

  const updateLayoutProperties = (layerType: string, properties: Record<string, any>) => {
    if (!mapref.current || !mapref.current.isStyleLoaded()) return;
    
    const layerId = `dtn-layer-${layerType}`;
    
    if (!mapref.current.getLayer(layerId)) return;

    Object.entries(properties).forEach(([property, value]) => {
      try {
        mapref.current!.setLayoutProperty(layerId, property, value);
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

  // Enhanced meteorological wind barb function
  const createMeteorologicalWindBarb = (speed: number, direction: number, unit: string = 'knots') => {
    // Convert speed to knots if needed
    let speedKnots = speed;
    if (unit === 'ms') speedKnots = speed * 1.944;
    if (unit === 'kmh') speedKnots = speed * 0.54;

    // Calm conditions (0-2 knots) - Circle
    if (speedKnots < 3) {
      return {
        symbol: '○',
        rotation: 0
      };
    }

    // Light air (3-7 knots) - Staff only
    if (speedKnots < 8) {
      return {
        symbol: '│',
        rotation: direction
      };
    }

    let barb = '';
    let remainingSpeed = Math.round(speedKnots);
    
    // Build barb from left to right based on meteorological standards
    // Add pennants for every 50 knots (triangular flags)
    const pennants = Math.floor(remainingSpeed / 50);
    for (let i = 0; i < pennants; i++) {
      barb += '◤';
    }
    remainingSpeed = remainingSpeed % 50;
    
    // Add full barbs for every 10 knots
    const fullBarbs = Math.floor(remainingSpeed / 10);
    for (let i = 0; i < fullBarbs; i++) {
      barb += '━';
    }
    remainingSpeed = remainingSpeed % 10;
    
    // Add half barb for 5-9 knots remainder
    if (remainingSpeed >= 5) {
      barb += '╸';
    }
    
    // Add the staff
    barb += '│';
    
    return {
      symbol: barb,
      rotation: direction
    };
  };

  const handleOverlayClick = async (overlay: string) => {
    console.log(`Attempting to add overlay: ${overlay}`);
    
    if (!mapref.current || !mapref.current.isStyleLoaded()) {
      console.warn("Map style not yet loaded");
      toast({
        title: "Map Loading",
        description: "Please wait for the map to fully load before adding layers",
        variant: "destructive"
      });
      return;
    }

    if (activeOverlays.includes(overlay)) {
      console.log(`Removing overlay: ${overlay}`);
      removeOverlay(overlay);
      return;
    }

    const { dtnLayerId, tileSetId } = dtnOverlays[overlay];
    const sourceId = `dtn-source-${overlay}`;
    const layerId = `dtn-layer-${overlay}`;

    console.log(`Adding overlay details:`, {
      overlay,
      dtnLayerId,
      tileSetId,
      sourceId,
      layerId,
      token: token.substring(0, 20) + '...'
    });

    try {
      console.log(`Fetching source layer for: ${dtnLayerId}`);
      const sourceLayer = await fetchDTNSourceLayer(dtnLayerId);
      console.log(`Source layer found: ${sourceLayer}`);
      
      const tileURL = `https://map.api.dtn.com/v2/tiles/${dtnLayerId}/${tileSetId}/{z}/{x}/{y}.pbf?token=${token}`;
      console.log(`Tile URL: ${tileURL}`);
      
      if (!mapref.current.getSource(sourceId)) {
        console.log(`Adding source: ${sourceId}`);
        mapref.current.addSource(sourceId, {
          type: "vector",
          tiles: [tileURL],
          minzoom: 0,
          maxzoom: 14,
        });

        let beforeId = undefined;

        if (overlay === 'swell') {
          // Enhanced swell layer with radial gradient and blur support
          const config = layerConfigs.swell;
          const colorExpression = createRadialGradientExpression(config);

          // Main swell layer
          mapref.current.addLayer({
            id: layerId,
            type: "fill",
            source: sourceId,
            "source-layer": sourceLayer,
            paint: {
              "fill-color": colorExpression,
              "fill-opacity": [
                'interpolate',
                ['linear'],
                ['zoom'],
                2, 0.4,  // Lower opacity at far zoom levels
                6, config.fillOpacity,
                14, config.fillOpacity * 1.1
              ],
              "fill-outline-color": config.fillOutlineColor,
              "fill-translate": [0, 0],
              "fill-translate-transition": {
                "duration": 1000,
                "delay": 0
              },
              "fill-antialias": true
            },
            layout: {
              "visibility": "visible"
            }
          }, beforeId);

          // Enhanced blur layer with custom blur settings
          if (config.layerBlurEnabled) {
            mapref.current.addLayer({
              id: `${layerId}-blur`,
              type: "fill",
              source: sourceId,
              "source-layer": sourceLayer,
              paint: {
                "fill-color": colorExpression,
                "fill-opacity": [
                  'interpolate',
                  ['linear'],
                  ['to-number', ['get', 'value'], 0],
                  0, config.layerBlurIntensity * 0.1,
                  5, config.layerBlurIntensity * 0.15,
                  10, config.layerBlurIntensity * 0.2
                ],
                "fill-translate": [config.layerBlurRadius, config.layerBlurRadius],
                "fill-antialias": true
              },
              layout: {
                "visibility": "visible"
              }
            }, layerId);

            // Additional blur layers for more intense effect
            for (let i = 1; i <= Math.floor(config.layerBlurRadius); i++) {
              mapref.current.addLayer({
                id: `${layerId}-blur-${i}`,
                type: "fill",
                source: sourceId,
                "source-layer": sourceLayer,
                paint: {
                  "fill-color": colorExpression,
                  "fill-opacity": [
                    'interpolate',
                    ['linear'],
                    ['to-number', ['get', 'value'], 0],
                    0, config.layerBlurIntensity * 0.05,
                    5, config.layerBlurIntensity * 0.08,
                    10, config.layerBlurIntensity * 0.1
                  ],
                  "fill-translate": [i * 2, i * 2],
                  "fill-antialias": true
                },
                layout: {
                  "visibility": "visible"
                }
              }, `${layerId}-blur`);
            }
          }
          
          setTimeout(() => animateSwell(), 100);
        } else if (overlay === 'wind') {
          // Enhanced meteorological wind barb implementation
          mapref.current.addLayer({
            id: layerId,
            type: "symbol",
            source: sourceId,
            "source-layer": sourceLayer,
            layout: {
              "text-field": [
                "case",
                ["<", ["to-number", ["get", "value"], 0], 3], "○",
                ["<", ["to-number", ["get", "value"], 0], 8], "│",
                ["<", ["to-number", ["get", "value"], 0], 13], "╸│",
                ["<", ["to-number", ["get", "value"], 0], 18], "━│",
                ["<", ["to-number", ["get", "value"], 0], 23], "━╸│",
                ["<", ["to-number", ["get", "value"], 0], 28], "━━│",
                ["<", ["to-number", ["get", "value"], 0], 33], "━━╸│",
                ["<", ["to-number", ["get", "value"], 0], 38], "━━━│",
                ["<", ["to-number", ["get", "value"], 0], 43], "━━━╸│",
                ["<", ["to-number", ["get", "value"], 0], 48], "━━━━│",
                ["<", ["to-number", ["get", "value"], 0], 53], "━━━━╸│",
                ["<", ["to-number", ["get", "value"], 0], 63], "◤│",
                ["<", ["to-number", ["get", "value"], 0], 68], "◤╸│",
                ["<", ["to-number", ["get", "value"], 0], 73], "◤━│",
                ["<", ["to-number", ["get", "value"], 0], 78], "◤━╸│",
                ["<", ["to-number", ["get", "value"], 0], 83], "◤━━│",
                ["<", ["to-number", ["get", "value"], 0], 88], "◤━━╸│",
                ["<", ["to-number", ["get", "value"], 0], 93], "◤━━━│",
                ["<", ["to-number", ["get", "value"], 0], 98], "◤━━━╸│",
                ["<", ["to-number", ["get", "value"], 0], 103], "◤━━━━│",
                "◤◤│"
              ],
              "text-size": layerConfigs.wind.textSize,
              "text-rotation-alignment": "map",
              "text-rotate": [
                "case",
                ["has", "direction"],
                ["get", "direction"],
                ["has", "value1"], 
                ["get", "value1"],
                0
              ],
              "text-allow-overlap": layerConfigs.wind.allowOverlap,
              "text-ignore-placement": true,
              "symbol-spacing": layerConfigs.wind.symbolSpacing,
              "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
              "text-anchor": "bottom"
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
              "text-rotate": [
                "case",
                ["has", "direction"],
                ["get", "direction"],
                ["has", "value1"], 
                ["get", "value1"],
                0
              ],
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
        toast({
          title: "Layer Already Active",
          description: `${overlay} layer is already active on the map`
        });
      }
    } catch (error: any) {
      console.error(`Error adding ${overlay} layer:`, error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        response: error.response
      });
      
      toast({
        title: "Layer Error",
        description: `Failed to add ${overlay} layer. Please check the console for details.`,
        variant: "destructive"
      });
    }
  };

  const removeOverlay = (overlay: string) => {
    if (!mapref.current || !mapref.current.isStyleLoaded()) return;

    const sourceId = `dtn-source-${overlay}`;
    const layerId = `dtn-layer-${overlay}`;
    const blurLayerId = `${layerId}-blur`;

    // Remove swell blur layers
    if (overlay === 'swell') {
      // Remove additional blur layers
      for (let i = 1; i <= 10; i++) {
        const blurLayerIdWithIndex = `${layerId}-blur-${i}`;
        if (mapref.current.getLayer(blurLayerIdWithIndex)) {
          mapref.current.removeLayer(blurLayerIdWithIndex);
        }
      }
      
      if (mapref.current.getLayer(blurLayerId)) {
        mapref.current.removeLayer(blurLayerId);
      }
    }
    
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
  const updateConfigValue = (layerType: string, property: string, value: any) => {
    setLayerConfigs(prev => ({
      ...prev,
      [layerType]: {
        ...prev[layerType],
        [property]: value
      }
    }));
  };

  // Function to load configuration from drafts
  const loadConfigFromDraft = (config: any) => {
    setLayerConfigs(config);
    
    // Apply all configurations that are currently active
    Object.keys(config).forEach(layerType => {
      if (activeOverlays.includes(layerType)) {
        applySpecificLayerConfiguration(layerType, config[layerType]);
      }
    });

    toast({
      title: "Configuration Loaded",
      description: "Weather layer configuration has been loaded from draft"
    });
  };

  // Enhanced function to apply specific layer configuration
  const applySpecificLayerConfiguration = (layerType: string, config: any) => {
    if (layerType === 'swell') {
      const colorExpression = createRadialGradientExpression(config);

      updateLayerProperties(layerType, {
        'fill-color': colorExpression,
        'fill-opacity': config.fillOpacity,
        'fill-outline-color': config.fillOutlineColor,
        'fill-antialias': config.fillAntialias
      });

      // Update blur layers if they exist
      if (config.layerBlurEnabled) {
        const blurLayerId = `dtn-layer-${layerType}-blur`;
        if (mapref.current && mapref.current.getLayer(blurLayerId)) {
          updateLayerProperties(`${layerType}-blur`, {
            'fill-color': colorExpression,
            'fill-opacity': [
              'interpolate',
              ['linear'],
              ['to-number', ['get', 'value'], 0],
              0, config.layerBlurIntensity * 0.1,
              5, config.layerBlurIntensity * 0.15,
              10, config.layerBlurIntensity * 0.2
            ],
            'fill-translate': [config.layerBlurRadius, config.layerBlurRadius]
          });
        }
      }
    } else if (layerType === 'pressure') {
      updateLayerProperties(layerType, {
        'line-color': config.lineColor,
        'line-width': config.lineWidth,
        'line-opacity': config.lineOpacity,
        'line-blur': config.lineBlur,
        'line-gap-width': config.lineGapWidth
      });
      
      updateLayoutProperties(layerType, {
        'line-cap': config.lineCap,
        'line-join': config.lineJoin
      });
    } else if (layerType === 'wind') {
      updateLayerProperties(layerType, {
        'text-color': config.textColor,
        'text-opacity': config.textOpacity,
        'text-halo-color': config.haloColor,
        'text-halo-width': config.haloWidth
      });
      
      updateLayoutProperties(layerType, {
        'text-size': config.textSize,
        'text-allow-overlap': config.allowOverlap,
        'symbol-spacing': config.symbolSpacing
      });
    } else if (layerType === 'symbol') {
      const symbolText = getSymbolByType(config.symbolType, config.customSymbol);
      
      updateLayerProperties(layerType, {
        'text-color': config.textColor,
        'text-opacity': config.textOpacity,
        'text-halo-color': config.haloColor,
        'text-halo-width': config.haloWidth
      });
      
      updateLayoutProperties(layerType, {
        'text-size': config.textSize,
        'text-allow-overlap': config.allowOverlap,
        'symbol-spacing': config.symbolSpacing,
        'text-rotation-alignment': config.rotationAlignment,
        'text-field': symbolText
      });
    }
  };

  // Update the existing applyLayerConfiguration function
  const applyLayerConfiguration = () => {
    const config = layerConfigs[selectedWeatherType];
    applySpecificLayerConfiguration(selectedWeatherType, config);

    // Automatically save as draft after applying
    saveConfigurationAsDraft();

    toast({
      title: "Configuration Applied",
      description: `${selectedWeatherType} layer configuration updated and saved as draft`
    });
  };

  const convertRgbToHex = (rgbString: string) => {
    const match = rgbString.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (!match) return rgbString;
    
    const r = parseInt(match[1]);
    const g = parseInt(match[2]);
    const b = parseInt(match[3]);
    
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  };

  const convertHexToRgb = (hex: string) => {
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
            <div className="flex items-center justify-between mb-4">
              <Label className="text-sm font-medium text-gray-700">Swell Configuration</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSwellConfigLocked(!swellConfigLocked)}
                className="p-2"
              >
                {swellConfigLocked ? (
                  <Lock className="h-4 w-4 text-red-500" />
                ) : (
                  <Unlock className="h-4 w-4 text-green-500" />
                )}
              </Button>
            </div>

            {swellConfigLocked && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-yellow-800">
                  Swell configuration is locked. Click the lock icon to unlock and make changes.
                </p>
              </div>
            )}

            <div>
              <Label className="text-xs font-medium text-gray-700">Fill Opacity</Label>
              <div className="flex items-center gap-2">
                <Slider
                  value={[config.fillOpacity]}
                  onValueChange={([value]) => !swellConfigLocked && updateConfigValue('swell', 'fillOpacity', value)}
                  min={0}
                  max={1}
                  step={0.1}
                  className="flex-1"
                  disabled={swellConfigLocked}
                />
                <span className="text-xs w-12">{config.fillOpacity}</span>
              </div>
            </div>

            <div>
              <Label className="text-xs font-medium text-gray-700">Fill Outline Color</Label>
              <Input
                type="color"
                value={config.fillOutlineColor === 'transparent' ? '#000000' : config.fillOutlineColor}
                onChange={(e) => !swellConfigLocked && updateConfigValue('swell', 'fillOutlineColor', e.target.value)}
                className="w-full h-8"
                disabled={swellConfigLocked}
              />
            </div>

            {/* Radial Gradient Controls */}
            <div className="border-t pt-4">
              <Label className="text-sm font-medium text-gray-700 mb-3 block">Radial Gradient Settings</Label>
              
              <div className="flex items-center gap-2 mb-3">
                <Switch
                  checked={config.useRadialGradient}
                  onCheckedChange={(checked) => !swellConfigLocked && updateConfigValue('swell', 'useRadialGradient', checked)}
                  disabled={swellConfigLocked}
                />
                <Label className="text-xs">Enable Radial Gradient</Label>
              </div>

              {config.useRadialGradient && (
                <>
                  <div>
                    <Label className="text-xs font-medium text-gray-700">Gradient Center X</Label>
                    <Slider
                      value={[config.radialGradientCenter[0]]}
                      onValueChange={([value]) => !swellConfigLocked && updateConfigValue('swell', 'radialGradientCenter', [value, config.radialGradientCenter[1]])}
                      min={0}
                      max={1}
                      step={0.1}
                      className="flex-1"
                      disabled={swellConfigLocked}
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-medium text-gray-700">Gradient Center Y</Label>
                    <Slider
                      value={[config.radialGradientCenter[1]]}
                      onValueChange={([value]) => !swellConfigLocked && updateConfigValue('swell', 'radialGradientCenter', [config.radialGradientCenter[0], value])}
                      min={0}
                      max={1}
                      step={0.1}
                      className="flex-1"
                      disabled={swellConfigLocked}
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-medium text-gray-700">Gradient Radius</Label>
                    <Slider
                      value={[config.radialGradientRadius]}
                      onValueChange={([value]) => !swellConfigLocked && updateConfigValue('swell', 'radialGradientRadius', value)}
                      min={0.1}
                      max={2}
                      step={0.1}
                      className="flex-1"
                      disabled={swellConfigLocked}
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-medium text-gray-700">Inner Opacity</Label>
                    <Slider
                      value={[config.radialGradientInnerOpacity]}
                      onValueChange={([value]) => !swellConfigLocked && updateConfigValue('swell', 'radialGradientInnerOpacity', value)}
                      min={0}
                      max={1}
                      step={0.1}
                      className="flex-1"
                      disabled={swellConfigLocked}
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-medium text-gray-700">Outer Opacity</Label>
                    <Slider
                      value={[config.radialGradientOuterOpacity]}
                      onValueChange={([value]) => !swellConfigLocked && updateConfigValue('swell', 'radialGradientOuterOpacity', value)}
                      min={0}
                      max={1}
                      step={0.1}
                      className="flex-1"
                      disabled={swellConfigLocked}
                    />
                  </div>
                </>
              )}
            </div>

            {/* Layer Blur Controls */}
            <div className="border-t pt-4">
              <Label className="text-sm font-medium text-gray-700 mb-3 block">Layer Blur Settings</Label>
              
              <div className="flex items-center gap-2 mb-3">
                <Switch
                  checked={config.layerBlurEnabled}
                  onCheckedChange={(checked) => !swellConfigLocked && updateConfigValue('swell', 'layerBlurEnabled', checked)}
                  disabled={swellConfigLocked}
                />
                <Label className="text-xs">Enable Layer Blur</Label>
              </div>

              {config.layerBlurEnabled && (
                <>
                  <div>
                    <Label className="text-xs font-medium text-gray-700">Blur Radius</Label>
                    <div className="flex items-center gap-2">
                      <Slider
                        value={[config.layerBlurRadius]}
                        onValueChange={([value]) => !swellConfigLocked && updateConfigValue('swell', 'layerBlurRadius', value)}
                        min={1}
                        max={10}
                        step={1}
                        className="flex-1"
                        disabled={swellConfigLocked}
                      />
                      <span className="text-xs w-12">{config.layerBlurRadius}</span>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs font-medium text-gray-700">Blur Intensity</Label>
                    <div className="flex items-center gap-2">
                      <Slider
                        value={[config.layerBlurIntensity]}
                        onValueChange={([value]) => !swellConfigLocked && updateConfigValue('swell', 'layerBlurIntensity', value)}
                        min={0.1}
                        max={2}
                        step={0.1}
                        className="flex-1"
                        disabled={swellConfigLocked}
                      />
                      <span className="text-xs w-12">{config.layerBlurIntensity.toFixed(1)}</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={config.fillAntialias}
                onCheckedChange={(checked) => !swellConfigLocked && updateConfigValue('swell', 'fillAntialias', checked)}
                disabled={swellConfigLocked}
              />
              <Label className="text-xs">Anti-aliasing</Label>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={config.animationEnabled}
                onCheckedChange={(checked) => !swellConfigLocked && updateConfigValue('swell', 'animationEnabled', checked)}
                disabled={swellConfigLocked}
              />
              <Label className="text-xs">Animation</Label>
            </div>

            {config.animationEnabled && (
              <div>
                <Label className="text-xs font-medium text-gray-700">Animation Speed</Label>
                <Slider
                  value={[config.animationSpeed * 1000]}
                  onValueChange={([value]) => !swellConfigLocked && updateConfigValue('swell', 'animationSpeed', value / 1000)}
                  min={0.1}
                  max={5}
                  step={0.1}
                  className="flex-1"
                  disabled={swellConfigLocked}
                />
              </div>
            )}

            <div>
              <Label className="text-xs font-medium text-gray-700 mb-2">Wave Height Gradient (0m to 10m+)</Label>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {config.gradient.map((item, index) => (
                  <div key={index} className={`flex items-center gap-2 p-2 border rounded ${swellConfigLocked ? 'bg-gray-50' : 'bg-white'}`}>
                    <Input
                      type="color"
                      value={convertRgbToHex(item.color)}
                      onChange={(e) => {
                        if (!swellConfigLocked) {
                          const newGradient = [...config.gradient];
                          newGradient[index].color = convertHexToRgb(e.target.value);
                          updateConfigValue('swell', 'gradient', newGradient);
                        }
                      }}
                      className="w-10 h-8 p-0 border-2"
                      disabled={swellConfigLocked}
                    />
                    <span className="text-xs w-14 font-medium text-gray-700">{item.value}</span>
                    <div className="flex-1">
                      <Label className="text-xs text-gray-600 mb-1 block">Opacity: {item.opacity.toFixed(1)}</Label>
                      <Slider
                        value={[item.opacity]}
                        onValueChange={([value]) => {
                          if (!swellConfigLocked) {
                            const newGradient = [...config.gradient];
                            newGradient[index].opacity = value;
                            updateConfigValue('swell', 'gradient', newGradient);
                          }
                        }}
                        min={0}
                        max={1}
                        step={0.1}
                        className="w-full"
                        disabled={swellConfigLocked}
                      />
                    </div>
                  </div>
                ))}
              </div>
              {!swellConfigLocked && (
                <div className="mt-2 text-xs text-gray-500 bg-blue-50 p-2 rounded">
                  <strong>Tip:</strong> Click the color boxes to change wave height colors and adjust the sliders to modify individual opacity for each height range.
                </div>
              )}
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

            <div className="text-xs text-gray-500 mt-2 p-2 bg-gray-50 rounded">
              <div className="font-semibold mb-1">Meteorological Wind Barb Legend:</div>
              <div>○ = Calm (0-2 kts)</div>
              <div>│ = Light air (3-7 kts)</div>
              <div>╸│ = Half barb (5 kts)</div>
              <div>━│ = Full barb (10 kts)</div>
              <div>◤│ = Pennant (50 kts)</div>
              <div className="mt-1 text-xs text-blue-600">
                Wind direction: Points toward where wind is blowing
              </div>
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

          {/* Draft Selection */}
          {getCurrentWeatherTypeDrafts().length > 0 && (
            <div>
              <Label className="block text-xs font-medium text-gray-700 mb-1">
                Load Draft
              </Label>
              <div className="flex gap-2">
                <Select value={selectedDraft} onValueChange={loadDraft}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select a draft" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border shadow-lg z-50">
                    {getCurrentWeatherTypeDrafts().map((draft) => (
                      <SelectItem key={draft.id} value={draft.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{draft.name}</span>
                          <span className="text-xs text-gray-400">
                            {new Date(draft.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedDraft && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteDraft(selectedDraft)}
                    className="p-2"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                )}
              </div>
              {getCurrentWeatherTypeDrafts().length > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  {getCurrentWeatherTypeDrafts().length} draft(s) available for {selectedWeatherType}
                </p>
              )}
            </div>
          )}

          {renderConfigurationPanel()}

          <Button 
            onClick={applyLayerConfiguration}
            className="w-full"
            size="sm"
          >
            <Save className="h-4 w-4 mr-2" />
            Apply & Save as Draft
          </Button>

          {/* Add the Weather Config Drafts component */}
          <WeatherConfigDrafts
            currentConfig={layerConfigs}
            onLoadConfig={loadConfigFromDraft}
          />

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
