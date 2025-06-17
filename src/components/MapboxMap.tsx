
import React, { useRef, useState, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import 'mapbox-gl/dist/mapbox-gl.css';
import { useToast } from '@/hooks/use-toast';
import MapTopControls from './MapTopControls';
import LayerControlPanel from './LayerControlPanel';
import { dtnToken, getDTNTokenForMap } from '@/utils/mapConstants';
import { createVesselMarkers, cleanupVesselMarkers, Vessel } from '@/utils/vesselMarkers';
import { dtnOverlays, fetchDTNSourceLayer, createSwellColorExpression } from '@/utils/dtnOverlayManager';
import { convertRgbToHex, convertHexToRgb, getSymbolByType } from '@/utils/colorHelpers';
import { defaultLayerConfigs } from '@/utils/layerConfigDefaults';
import { trackLayerAdded, trackLayerRemoved, trackLayerConfigurationApplied } from '@/utils/amplitudeTracking';
import { ensureValidDTNToken, validateDTNToken } from '@/utils/dtnTokenManager';

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
  const [layerConfigs, setLayerConfigs] = useState(defaultLayerConfigs);
  const [tokenValidation, setTokenValidation] = useState<{
    isValid: boolean;
    error: string | null;
    lastChecked: Date | null;
  }>({
    isValid: false,
    error: null,
    lastChecked: null
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

  // Get initial token for logging
  const initialToken = dtnToken.replace('Bearer ', '');
  console.log('Initial DTN Token being used:', initialToken.substring(0, 50) + '...');

  // Enhanced DTN token validation on component mount
  useEffect(() => {
    const initializeDTNAuth = async () => {
      console.log('=== Initializing DTN Authentication ===');
      
      try {
        // Get a valid token (this will fetch a new one if needed)
        const validToken = await ensureValidDTNToken();
        const cleanToken = validToken.replace('Bearer ', '');
        
        console.log('✅ DTN Authentication initialized successfully');
        console.log('Token length:', cleanToken.length);
        
        setTokenValidation({
          isValid: true,
          error: null,
          lastChecked: new Date()
        });
        
        toast({
          title: "DTN Authentication Ready",
          description: "Successfully authenticated with DTN API"
        });
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown authentication error';
        console.error('❌ DTN Authentication failed:', errorMessage);
        
        setTokenValidation({
          isValid: false,
          error: errorMessage,
          lastChecked: new Date()
        });
        
        toast({
          title: "DTN Authentication Failed",
          description: `Failed to authenticate with DTN API: ${errorMessage}`,
          variant: "destructive"
        });
      }
    };

    initializeDTNAuth();
  }, [toast]);

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

  // Helper functions for layer management
  const updateLayerProperties = (layerType: string, properties: any) => {
    if (!mapref.current || !mapref.current.isStyleLoaded()) {
      console.warn('Map not ready for layer property updates');
      return;
    }
    
    const layerId = `dtn-layer-${layerType}`;
    if (mapref.current.getLayer(layerId)) {
      Object.entries(properties).forEach(([property, value]) => {
        try {
          console.log(`Setting paint property ${property} to:`, value, 'on layer:', layerId);
          mapref.current?.setPaintProperty(layerId, property, value);
        } catch (error) {
          console.error(`Error setting paint property ${property}:`, error);
        }
      });
    } else {
      console.warn(`Layer ${layerId} not found for property updates`);
    }
  };

  const updateLayoutProperties = (layerType: string, properties: any) => {
    if (!mapref.current || !mapref.current.isStyleLoaded()) {
      console.warn('Map not ready for layout property updates');
      return;
    }
    
    const layerId = `dtn-layer-${layerType}`;
    if (mapref.current.getLayer(layerId)) {
      Object.entries(properties).forEach(([property, value]) => {
        try {
          console.log(`Setting layout property ${property} to:`, value, 'on layer:', layerId);
          mapref.current?.setLayoutProperty(layerId, property, value);
        } catch (error) {
          console.error(`Error setting layout property ${property}:`, error);
        }
      });
    } else {
      console.warn(`Layer ${layerId} not found for layout updates`);
    }
  };

  const handleOverlayClick = async (overlayType: string) => {
    console.log(`=== Starting overlay click for: ${overlayType} ===`);
    
    if (activeOverlays.includes(overlayType)) {
      console.log(`Removing existing overlay: ${overlayType}`);
      removeOverlay(overlayType);
      return;
    }

    if (!mapref.current || !mapref.current.isStyleLoaded()) {
      console.error('Map not ready - style not loaded');
      toast({
        title: "Map Not Ready",
        description: "Please wait for the map to fully load before adding layers.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Get a fresh, validated token for this request
      console.log('🔄 Getting validated DTN token for layer request...');
      const validToken = await ensureValidDTNToken();
      const cleanToken = validToken.replace('Bearer ', '');
      
      console.log(`✅ Using validated DTN token: ${cleanToken.substring(0, 20)}...`);
      
      const overlayConfig = dtnOverlays[overlayType as keyof typeof dtnOverlays];
      if (!overlayConfig) {
        console.error(`No overlay config found for: ${overlayType}`);
        return;
      }

      console.log(`Adding ${overlayType} overlay with config:`, overlayConfig);
      
      // Fetch source layer name with the validated token
      let sourceLayerName;
      if (overlayType === 'swell') {
        sourceLayerName = await fetchDTNSourceLayer(overlayConfig.dtnLayerId, cleanToken);
        if (!sourceLayerName) {
          console.log('Primary swell layer failed, using fallback...');
          sourceLayerName = 'default';
        }
      } else {
        sourceLayerName = await fetchDTNSourceLayer(overlayConfig.dtnLayerId, cleanToken);
      }
      
      console.log(`Source layer name for ${overlayType}:`, sourceLayerName);
      
      if (!sourceLayerName) {
        throw new Error(`Could not fetch source layer for ${overlayType}`);
      }

      const sourceId = `dtn-source-${overlayType}`;
      const layerId = `dtn-layer-${overlayType}`;

      // Remove existing source/layer if they exist
      if (mapref.current.getLayer(layerId)) {
        console.log(`Removing existing layer: ${layerId}`);
        mapref.current.removeLayer(layerId);
      }
      if (mapref.current.getSource(sourceId)) {
        console.log(`Removing existing source: ${sourceId}`);
        mapref.current.removeSource(sourceId);
      }

      // Add source with the validated token
      const tileUrl = `https://map.api.dtn.com/v2/tiles/${overlayConfig.tileSetId}/{z}/{x}/{y}?access_token=${cleanToken}`;
      console.log(`Adding source for ${overlayType} with URL template:`, tileUrl);
      
      mapref.current.addSource(sourceId, {
        type: 'vector',
        tiles: [tileUrl],
        minzoom: 0,
        maxzoom: 14
      });

      // Wait a moment for source to be added
      await new Promise(resolve => setTimeout(resolve, 100));

      // Configure layer based on type
      let layerConfig: any = {
        id: layerId,
        source: sourceId,
        'source-layer': sourceLayerName
      };

      console.log(`Configuring ${overlayType} layer...`);

      if (overlayType === 'swell') {
        layerConfig.type = 'fill';
        const colorExpression = createSwellColorExpression(layerConfigs.swell);
        layerConfig.paint = {
          'fill-color': colorExpression,
          'fill-opacity': layerConfigs.swell.fillOpacity,
          'fill-outline-color': layerConfigs.swell.fillOutlineColor,
          'fill-antialias': layerConfigs.swell.fillAntialias
        };
        layerConfig.filter = ['has', 'value'];
      } else if (overlayType === 'pressure') {
        layerConfig.type = 'line';
        layerConfig.paint = {
          'line-color': layerConfigs.pressure.lineColor,
          'line-width': layerConfigs.pressure.lineWidth,
          'line-opacity': layerConfigs.pressure.lineOpacity,
          'line-blur': layerConfigs.pressure.lineBlur,
          'line-gap-width': layerConfigs.pressure.lineGapWidth
        };
        layerConfig.layout = {
          'line-cap': layerConfigs.pressure.lineCap,
          'line-join': layerConfigs.pressure.lineJoin
        };
      } else if (overlayType === 'wind' || overlayType === 'symbol') {
        layerConfig.type = 'symbol';
        const config = layerConfigs[overlayType];
        layerConfig.paint = {
          'text-color': config.textColor,
          'text-opacity': config.textOpacity,
          'text-halo-color': config.haloColor,
          'text-halo-width': config.haloWidth
        };
        
        let textField;
        if (overlayType === 'symbol' && 'symbolType' in config && 'customSymbol' in config) {
          textField = getSymbolByType(config.symbolType, config.customSymbol);
        } else {
          textField = ['get', 'speed'];
        }
        
        layerConfig.layout = {
          'text-field': textField,
          'text-size': config.textSize,
          'text-allow-overlap': config.allowOverlap,
          'symbol-spacing': config.symbolSpacing
        };
      }

      console.log(`Adding layer ${layerId} with config:`, JSON.stringify(layerConfig, null, 2));
      
      try {
        mapref.current.addLayer(layerConfig);
        console.log(`Layer ${layerId} added successfully`);
        
        // Wait for layer to be fully added
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Verify layer was added
        const addedLayer = mapref.current.getLayer(layerId);
        if (addedLayer) {
          console.log(`Layer ${layerId} verified as added:`, addedLayer);
          setActiveOverlays(prev => [...prev, overlayType]);

          // Update token validation status to success
          setTokenValidation(prev => ({
            ...prev,
            isValid: true,
            error: null,
            lastChecked: new Date()
          }));

          // Track layer addition with Amplitude
          trackLayerAdded(overlayType, layerId);

          toast({
            title: "Layer Added Successfully",
            description: `${overlayType.charAt(0).toUpperCase() + overlayType.slice(1)} layer is now visible on the map`
          });

          ensureVesselsOnTop();
        } else {
          throw new Error(`Layer ${layerId} was not found after adding`);
        }
        
      } catch (layerError) {
        console.error(`Error adding layer ${layerId}:`, layerError);
        throw layerError;
      }

    } catch (error) {
      console.error(`=== Error adding ${overlayType} overlay ===`, error);
      
      // Update token validation status
      setTokenValidation(prev => ({
        ...prev,
        isValid: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        lastChecked: new Date()
      }));
      
      toast({
        title: "Layer Error",
        description: `Failed to add ${overlayType} layer: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  };

  const removeOverlay = (overlayType: string) => {
    console.log(`=== Removing overlay: ${overlayType} ===`);
    
    if (!mapref.current) {
      console.warn('Map reference not available');
      return;
    }

    const layerId = `dtn-layer-${overlayType}`;
    const sourceId = `dtn-source-${overlayType}`;

    try {
      if (mapref.current.getLayer(layerId)) {
        console.log(`Removing layer: ${layerId}`);
        mapref.current.removeLayer(layerId);
      } else {
        console.warn(`Layer ${layerId} not found for removal`);
      }

      if (mapref.current.getSource(sourceId)) {
        console.log(`Removing source: ${sourceId}`);
        mapref.current.removeSource(sourceId);
      } else {
        console.warn(`Source ${sourceId} not found for removal`);
      }

      setActiveOverlays(prev => prev.filter(overlay => overlay !== overlayType));

      // Track layer removal with Amplitude
      trackLayerRemoved(overlayType, layerId);

      toast({
        title: "Layer Removed",
        description: `${overlayType.charAt(0).toUpperCase() + overlayType.slice(1)} layer has been removed`
      });
      
      console.log(`Successfully removed ${overlayType} overlay`);
    } catch (error) {
      console.error(`Error removing ${overlayType} overlay:`, error);
    }
  };

  const removeAllOverlays = () => {
    activeOverlays.forEach(overlay => {
      removeOverlay(overlay);
    });
  };

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

  // Function to ensure vessels are always on top
  const ensureVesselsOnTop = () => {
    setTimeout(() => {
      if (mapref.current) {
        cleanupVesselMarkers(markersRef);
        createVesselMarkers(mapref.current, mockVessels, markersRef);
        console.log('Vessels repositioned on top of layers');
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
      const colorExpression = createSwellColorExpression(config);

      updateLayerProperties(layerType, {
        'fill-color': colorExpression,
        'fill-opacity': config.fillOpacity,
        'fill-outline-color': config.fillOutlineColor,
        'fill-antialias': config.fillAntialias
      });

      // Update blur layers if they exist
      if (config.layerBlurEnabled) {
        for (let i = 1; i <= Math.floor(config.layerBlurRadius); i++) {
          const blurLayerId = `dtn-layer-${layerType}-blur-${i}`;
          if (mapref.current && mapref.current.getLayer(blurLayerId)) {
            updateLayerProperties(`${layerType}-blur-${i}`, {
              'fill-color': colorExpression,
              'fill-opacity': [
                'interpolate',
                ['linear'],
                ['to-number', ['get', 'value'], 0],
                0, config.layerBlurIntensity * 0.1,
                5, config.layerBlurIntensity * 0.15,
                10, config.layerBlurIntensity * 0.2
              ],
              'fill-translate': [i * 2, i * 2]
            });
          }
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
      // Fix: Add type check for symbol-specific properties
      let symbolText = '→'; // default symbol
      if ('symbolType' in config && 'customSymbol' in config) {
        symbolText = getSymbolByType(config.symbolType, config.customSymbol);
      }
      
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
        'text-rotation-alignment': config.rotationAlignment || 'map',
        'text-field': symbolText
      });
    }
  };

  // Update the existing applyLayerConfiguration function
  const applyLayerConfiguration = () => {
    const config = layerConfigs[selectedWeatherType];
    applySpecificLayerConfiguration(selectedWeatherType, config);

    // Track configuration application with Amplitude
    trackLayerConfigurationApplied(selectedWeatherType, {
      config_type: selectedWeatherType,
      config_properties: Object.keys(config).length
    });

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
          
          {/* Token Status */}
          <div className={`mb-4 p-2 rounded text-xs ${tokenValidation.isValid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="font-semibold">
              Token Status: {tokenValidation.isValid ? '✅ Valid' : '❌ Invalid'}
            </div>
            {!tokenValidation.isValid && tokenValidation.error && (
              <div className="mt-1 text-red-600">{tokenValidation.error}</div>
            )}
            {tokenValidation.lastChecked && (
              <div className="mt-1 text-gray-500">
                Checked: {tokenValidation.lastChecked.toLocaleTimeString()}
              </div>
            )}
          </div>
          
          {Object.keys(dtnOverlays).map((overlay) => (
            <div
              key={overlay}
              onClick={() => handleOverlayClick(overlay)}
              className={`p-2 m-1 rounded cursor-pointer transition-colors ${
                activeOverlays.includes(overlay)
                  ? 'bg-blue-500 text-white' 
                  : tokenValidation.isValid 
                    ? 'bg-gray-100 hover:bg-gray-200 text-black'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
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
          <div className="mt-4 p-2 bg-gray-50 rounded text-xs">
            <div className="font-semibold">Debug Info:</div>
            <div>Map Loaded: {isMapLoaded ? 'Yes' : 'No'}</div>
            <div>Active Overlays: {activeOverlays.length}</div>
            <div>Token Length: {initialToken.length}</div>
            <div>Token Valid: {tokenValidation.isValid ? 'Yes' : 'No'}</div>
          </div>
        </div>
      )}

      <LayerControlPanel
        selectedWeatherType={selectedWeatherType}
        setSelectedWeatherType={setSelectedWeatherType}
        selectedDraft={selectedDraft}
        setSelectedDraft={setSelectedDraft}
        weatherDrafts={weatherDrafts}
        layerConfigs={layerConfigs}
        updateConfigValue={updateConfigValue}
        swellConfigLocked={swellConfigLocked}
        setSwellConfigLocked={setSwellConfigLocked}
        activeOverlays={activeOverlays}
        loadDraft={loadDraft}
        deleteDraft={deleteDraft}
        applyLayerConfiguration={applyLayerConfiguration}
        loadConfigFromDraft={loadConfigFromDraft}
        getCurrentWeatherTypeDrafts={getCurrentWeatherTypeDrafts}
        convertRgbToHex={convertRgbToHex}
        convertHexToRgb={convertHexToRgb}
        getSymbolByType={getSymbolByType}
      />
    </div>
  );
};

export default MapboxMap;
