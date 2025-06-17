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
  const mapref = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const [showLayers, setShowLayers] = useState(false);
  const [activeOverlays, setActiveOverlays] = useState<string[]>([]);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [selectedWeatherType, setSelectedWeatherType] = useState('wind');
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
      fillOpacity: 0.7,
      fillOutlineColor: 'transparent',
      gradient: [
        { value: '980mb', color: 'rgba(128, 0, 128, 0.8)', opacity: 0.8 },     // Purple - very low pressure
        { value: '990mb', color: 'rgba(0, 0, 255, 0.7)', opacity: 0.7 },       // Blue - low pressure
        { value: '1000mb', color: 'rgba(0, 128, 255, 0.6)', opacity: 0.6 },    // Light blue
        { value: '1010mb', color: 'rgba(0, 255, 255, 0.5)', opacity: 0.5 },    // Cyan
        { value: '1013mb', color: 'rgba(128, 255, 128, 0.4)', opacity: 0.4 },  // Light green - standard pressure
        { value: '1020mb', color: 'rgba(255, 255, 0, 0.5)', opacity: 0.5 },    // Yellow
        { value: '1030mb', color: 'rgba(255, 128, 0, 0.6)', opacity: 0.6 },    // Orange
        { value: '1040mb', color: 'rgba(255, 0, 0, 0.7)', opacity: 0.7 },      // Red - high pressure
        { value: '1050mb+', color: 'rgba(128, 0, 0, 0.8)', opacity: 0.8 }      // Dark red - very high pressure
      ],
      smoothing: true,
      blurRadius: 3,
      contourLines: true,
      contourColor: '#333333',
      contourWidth: 1,
      contourOpacity: 0.4
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

  const [currentDTNToken, setCurrentDTNToken] = useState<string>('');

  // Initialize DTN token on component mount
  useEffect(() => {
    const initializeToken = async () => {
      try {
        const { getValidDTNToken } = await import('../utils/dtnTokenManager');
        const token = await getValidDTNToken();
        setCurrentDTNToken(token.replace('Bearer ', ''));
        console.log('DTN Token initialized:', token.substring(0, 50) + '...');
      } catch (error) {
        console.error('Failed to initialize DTN token:', error);
        // Fallback to the legacy token
        setCurrentDTNToken(dtnToken.replace('Bearer ', ''));
      }
    };
    
    initializeToken();
  }, []);

  console.log('DTN Token being used:', currentDTNToken.substring(0, 50) + '...');

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

  const fetchDTNSourceLayer = async (layerId: string, token?: string) => {
    const authToken = token || currentDTNToken;
    const response = await fetch(`https://map.api.dtn.com/v2/styles/${layerId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch source layer: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const sourceLayerName = data[0]?.mapBoxStyle?.layers?.[0]?.["source-layer"];
    return sourceLayerName;
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

    // Ensure we have a valid token before making requests
    let token = currentDTNToken;
    if (!token) {
      console.log('No DTN token available, fetching new one...');
      try {
        const { getValidDTNToken } = await import('../utils/dtnTokenManager');
        const newToken = await getValidDTNToken();
        token = newToken.replace('Bearer ', '');
        setCurrentDTNToken(token);
        console.log('Fetched new DTN token for overlay request');
      } catch (error) {
        console.error('Failed to fetch DTN token:', error);
        toast({
          title: "Authentication Error",
          description: "Failed to get valid authentication token. Please try again.",
          variant: "destructive"
        });
        return;
      }
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
      const sourceLayer = await fetchDTNSourceLayer(dtnLayerId, token);
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

        if (overlay === 'pressure') {
          // Enhanced pressure gradient implementation
          const colorExpression: any[] = [
            'interpolate',
            ['exponential', 1.5],
            ['to-number', ['get', 'value'], 1013]
          ];

          layerConfigs.pressure.gradient.forEach((item) => {
            const pressureValue = parseFloat(item.value.replace('mb', '').replace('+', ''));
            colorExpression.push(pressureValue, item.color);
          });

          // Main pressure fill layer with gradient
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
                2, 0.3,
                6, layerConfigs.pressure.fillOpacity,
                14, layerConfigs.pressure.fillOpacity * 1.1
              ],
              "fill-outline-color": layerConfigs.pressure.fillOutlineColor,
              "fill-antialias": true
            },
            layout: {
              "visibility": "visible"
            }
          }, beforeId);

          // Add pressure contour lines if enabled
          if (layerConfigs.pressure.contourLines) {
            mapref.current.addLayer({
              id: `${layerId}-contours`,
              type: "line",
              source: sourceId,
              "source-layer": sourceLayer,
              paint: {
                "line-color": layerConfigs.pressure.contourColor,
                "line-width": layerConfigs.pressure.contourWidth,
                "line-opacity": layerConfigs.pressure.contourOpacity,
                "line-blur": 0.5
              },
              layout: {
                "line-cap": "round",
                "line-join": "round",
                "visibility": "visible"
              }
            }, layerId);
          }

          // Add pressure blur layer for enhanced smoothing
          if (layerConfigs.pressure.smoothing) {
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
                  ['to-number', ['get', 'value'], 1013],
                  980, 0.1,
                  1013, 0.05,
                  1050, 0.1
                ],
                "fill-translate": [layerConfigs.pressure.blurRadius, layerConfigs.pressure.blurRadius],
                "fill-antialias": true
              },
              layout: {
                "visibility": "visible"
              }
            }, layerId);
          }
        } else if (overlay === 'swell') {
          const colorExpression: any[] = [
            'interpolate',
            ['exponential', 1.5],
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
              "fill-opacity": [
                'interpolate',
                ['linear'],
                ['zoom'],
                2, 0.4,
                6, layerConfigs.swell.fillOpacity,
                14, layerConfigs.swell.fillOpacity * 1.1
              ],
              "fill-outline-color": layerConfigs.swell.fillOutlineColor,
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
                0, 0.1,
                5, 0.15,
                10, 0.2
              ],
              "fill-translate": [1, 1],
              "fill-antialias": true
            },
            layout: {
              "visibility": "visible"
            }
          }, layerId);
          
          setTimeout(() => animateSwell(), 100);
        } else if (overlay === 'wind') {
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
      
      if (error.message?.includes('401') || error.status === 401) {
        console.log('401 error detected, attempting to refresh token...');
        try {
          const { getValidDTNToken } = await import('../utils/dtnTokenManager');
          const newToken = await getValidDTNToken();
          setCurrentDTNToken(newToken.replace('Bearer ', ''));
          
          toast({
            title: "Token Refreshed",
            description: "Authentication token has been refreshed. Please try adding the layer again.",
          });
        } catch (refreshError) {
          console.error('Failed to refresh token:', refreshError);
          toast({
            title: "Authentication Error",
            description: "Failed to refresh authentication token. Please reload the page.",
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Layer Error",
          description: `Failed to add ${overlay} layer. Please check the console for details.`,
          variant: "destructive"
        });
      }
    }
  };

  const removeOverlay = (overlay: string) => {
    if (!mapref.current || !mapref.current.isStyleLoaded()) return;

    const sourceId = `dtn-source-${overlay}`;
    const layerId = `dtn-layer-${overlay}`;
    const blurLayerId = `${layerId}-blur`;
    const contourLayerId = `${layerId}-contours`;

    // Remove all related layers
    if (mapref.current.getLayer(contourLayerId)) {
      mapref.current.removeLayer(contourLayerId);
    }
    if (mapref.current.getLayer(blurLayerId)) {
      mapref.current.removeLayer(blurLayerId);
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

  const applyLayerConfiguration = () => {
    const config = layerConfigs[selectedWeatherType];
    
    if (selectedWeatherType === 'pressure') {
      const colorExpression: any[] = [
        'interpolate',
        ['exponential', 1.5],
        ['to-number', ['get', 'value'], 1013]
      ];

      config.gradient.forEach((item: any) => {
        const pressureValue = parseFloat(item.value.replace('mb', '').replace('+', ''));
        colorExpression.push(pressureValue, item.color);
      });

      updateLayerProperties(selectedWeatherType, {
        'fill-color': colorExpression,
        'fill-opacity': config.fillOpacity,
        'fill-outline-color': config.fillOutlineColor,
        'fill-antialias': true
      });

      // Update contour lines if they exist
      const contourLayerId = `dtn-layer-${selectedWeatherType}-contours`;
      if (mapref.current && mapref.current.getLayer(contourLayerId)) {
        mapref.current.setPaintProperty(contourLayerId, 'line-color', config.contourColor);
        mapref.current.setPaintProperty(contourLayerId, 'line-width', config.contourWidth);
        mapref.current.setPaintProperty(contourLayerId, 'line-opacity', config.contourOpacity);
      }
    } else if (selectedWeatherType === 'swell') {
      const colorExpression: any[] = [
        'interpolate',
        ['exponential', 1.5],
        ['to-number', ['get', 'value'], 0]
      ];

      config.gradient.forEach((item: any) => {
        const heightValue = parseFloat(item.value.replace('m', '').replace('+', ''));
        colorExpression.push(heightValue, item.color);
      });

      updateLayerProperties(selectedWeatherType, {
        'fill-color': colorExpression,
        'fill-opacity': config.fillOpacity,
        'fill-outline-color': config.fillOutlineColor,
        'fill-antialias': config.fillAntialias
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
      description: `${selectedWeatherType} layer configuration updated`
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
        {selectedWeatherType === 'pressure' && (
          <>
            <div className="flex items-center justify-between mb-4">
              <Label className="text-sm font-medium text-gray-700">Pressure Configuration</Label>
            </div>

            <div>
              <Label className="text-xs font-medium text-gray-700">Fill Opacity</Label>
              <div className="flex items-center gap-2">
                <Slider
                  value={[config.fillOpacity]}
                  onValueChange={([value]) => updateConfigValue('pressure', 'fillOpacity', value)}
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
                onChange={(e) => updateConfigValue('pressure', 'fillOutlineColor', e.target.value)}
                className="w-full h-8"
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={config.contourLines}
                onCheckedChange={(checked) => updateConfigValue('pressure', 'contourLines', checked)}
              />
              <Label className="text-xs">Show Contour Lines</Label>
            </div>

            {config.contourLines && (
              <>
                <div>
                  <Label className="text-xs font-medium text-gray-700">Contour Color</Label>
                  <Input
                    type="color"
                    value={config.contourColor}
                    onChange={(e) => updateConfigValue('pressure', 'contourColor', e.target.value)}
                    className="w-full h-8"
                  />
                </div>

                <div>
                  <Label className="text-xs font-medium text-gray-700">Contour Width</Label>
                  <Slider
                    value={[config.contourWidth]}
                    onValueChange={([value]) => updateConfigValue('pressure', 'contourWidth', value)}
                    min={0.5}
                    max={5}
                    step={0.5}
                    className="flex-1"
                  />
                </div>

                <div>
                  <Label className="text-xs font-medium text-gray-700">Contour Opacity</Label>
                  <Slider
                    value={[config.contourOpacity]}
                    onValueChange={([value]) => updateConfigValue('pressure', 'contourOpacity', value)}
                    min={0}
                    max={1}
                    step={0.1}
                    className="flex-1"
                  />
                </div>
              </>
            )}

            <div className="flex items-center gap-2">
              <Switch
                checked={config.smoothing}
                onCheckedChange={(checked) => updateConfigValue('pressure', 'smoothing', checked)}
              />
              <Label className="text-xs">Enhanced Smoothing</Label>
            </div>

            {config.smoothing && (
              <div>
                <Label className="text-xs font-medium text-gray-700">Blur Radius</Label>
                <Slider
                  value={[config.blurRadius]}
                  onValueChange={([value]) => updateConfigValue('pressure', 'blurRadius', value)}
                  min={0}
                  max={10}
                  step={1}
                  className="flex-1"
                />
              </div>
            )}

            <div>
              <Label className="text-xs font-medium text-gray-700 mb-2">Pressure Gradient (980mb to 1050mb+)</Label>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {config.gradient.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 border rounded bg-white">
                    <Input
                      type="color"
                      value={convertRgbToHex(item.color)}
                      onChange={(e) => {
                        const newGradient = [...config.gradient];
                        newGradient[index].color = convertHexToRgb(e.target.value);
                        updateConfigValue('pressure', 'gradient', newGradient);
                      }}
                      className="w-10 h-8 p-0 border-2"
                    />
                    <span className="text-xs w-16 font-medium text-gray-700">{item.value}</span>
                    <div className="flex-1">
                      <Label className="text-xs text-gray-600 mb-1 block">Opacity: {item.opacity.toFixed(1)}</Label>
                      <Slider
                        value={[item.opacity]}
                        onValueChange={([value]) => {
                          const newGradient = [...config.gradient];
                          newGradient[index].opacity = value;
                          updateConfigValue('pressure', 'gradient', newGradient);
                        }}
                        min={0}
                        max={1}
                        step={0.1}
                        className="w-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

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

          {renderConfigurationPanel()}

          <Button 
            onClick={applyLayerConfiguration}
            className="w-full"
            size="sm"
          >
            <Save className="h-4 w-4 mr-2" />
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
