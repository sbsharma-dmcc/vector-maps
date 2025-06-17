import React, { useRef, useState, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import 'mapbox-gl/dist/mapbox-gl.css';
import { useToast } from '@/hooks/use-toast';
import MapTopControls from './MapTopControls';
import LayerControlPanel from './LayerControlPanel';
import { dtnToken } from '@/utils/mapConstants';
import { createVesselMarkers, cleanupVesselMarkers, Vessel } from '@/utils/vesselMarkers';
import { dtnOverlays, fetchDTNSourceLayer, createSwellColorExpression } from '@/utils/dtnOverlayManager';
import { convertRgbToHex, convertHexToRgb, getSymbolByType } from '@/utils/colorHelpers';
import { defaultLayerConfigs } from '@/utils/layerConfigDefaults';
import { trackLayerAdded, trackLayerRemoved, trackLayerConfigurationApplied } from '@/utils/amplitudeTracking';

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
    if (!mapref.current || !mapref.current.isStyleLoaded()) return;
    
    const layerId = `dtn-layer-${layerType}`;
    if (mapref.current.getLayer(layerId)) {
      Object.entries(properties).forEach(([property, value]) => {
        try {
          mapref.current?.setPaintProperty(layerId, property, value);
        } catch (error) {
          console.error(`Error setting paint property ${property}:`, error);
        }
      });
    }
  };

  const updateLayoutProperties = (layerType: string, properties: any) => {
    if (!mapref.current || !mapref.current.isStyleLoaded()) return;
    
    const layerId = `dtn-layer-${layerType}`;
    if (mapref.current.getLayer(layerId)) {
      Object.entries(properties).forEach(([property, value]) => {
        try {
          mapref.current?.setLayoutProperty(layerId, property, value);
        } catch (error) {
          console.error(`Error setting layout property ${property}:`, error);
        }
      });
    }
  };

  const handleOverlayClick = async (overlayType: string) => {
    if (activeOverlays.includes(overlayType)) {
      removeOverlay(overlayType);
      return;
    }

    if (!mapref.current || !mapref.current.isStyleLoaded()) {
      toast({
        title: "Map Not Ready",
        description: "Please wait for the map to fully load before adding layers.",
        variant: "destructive"
      });
      return;
    }

    try {
      const overlayConfig = dtnOverlays[overlayType as keyof typeof dtnOverlays];
      if (!overlayConfig) return;

      console.log(`Adding ${overlayType} overlay with config:`, overlayConfig);
      
      // For swell layer, try a different approach if the main one fails
      let sourceLayerName;
      if (overlayType === 'swell') {
        // Try to get source layer, but provide fallback
        sourceLayerName = await fetchDTNSourceLayer(overlayConfig.dtnLayerId, token);
        if (!sourceLayerName) {
          console.log('Primary swell layer failed, trying alternative approach...');
          // Use a generic source layer name as fallback
          sourceLayerName = 'default';
        }
      } else {
        sourceLayerName = await fetchDTNSourceLayer(overlayConfig.dtnLayerId, token);
      }
      
      if (!sourceLayerName) {
        toast({
          title: "Layer Error", 
          description: `Could not fetch source layer for ${overlayType}. This layer may not be available with your current API permissions.`,
          variant: "destructive"
        });
        return;
      }

      const sourceId = `dtn-source-${overlayType}`;
      const layerId = `dtn-layer-${overlayType}`;

      // Add source if it doesn't exist
      if (!mapref.current.getSource(sourceId)) {
        const tileUrl = overlayType === 'swell' 
          ? `https://map.api.dtn.com/v2/tiles/${overlayConfig.tileSetId}/{z}/{x}/{y}?access_token=${token}`
          : `https://map.api.dtn.com/v2/tiles/${overlayConfig.tileSetId}/{z}/{x}/{y}?access_token=${token}`;
        
        console.log(`Adding source for ${overlayType} with URL template:`, tileUrl);
        
        mapref.current.addSource(sourceId, {
          type: 'vector',
          tiles: [tileUrl],
          minzoom: 0,
          maxzoom: 14
        });
      }

      // Configure layer based on type
      let layerConfig: any = {
        id: layerId,
        type: overlayType === 'swell' ? 'fill' : overlayType === 'pressure' ? 'line' : 'symbol',
        source: sourceId,
        'source-layer': sourceLayerName
      };

      if (overlayType === 'swell') {
        const colorExpression = createSwellColorExpression(layerConfigs.swell);
        layerConfig.paint = {
          'fill-color': colorExpression,
          'fill-opacity': layerConfigs.swell.fillOpacity,
          'fill-outline-color': layerConfigs.swell.fillOutlineColor,
          'fill-antialias': layerConfigs.swell.fillAntialias
        };
        
        // Add error handling for swell layer
        layerConfig.filter = ['has', 'value']; // Only show features with value property
      } else if (overlayType === 'pressure') {
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
        const config = layerConfigs[overlayType];
        layerConfig.paint = {
          'text-color': config.textColor,
          'text-opacity': config.textOpacity,
          'text-halo-color': config.haloColor,
          'text-halo-width': config.haloWidth
        };
        
        // Fix: Add type check for symbolType and customSymbol properties
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

      console.log(`Adding layer ${layerId} with config:`, layerConfig);
      mapref.current.addLayer(layerConfig);
      setActiveOverlays(prev => [...prev, overlayType]);

      // Track layer addition with Amplitude
      trackLayerAdded(overlayType, layerId);

      toast({
        title: "Layer Added",
        description: `${overlayType.charAt(0).toUpperCase() + overlayType.slice(1)} layer has been added to the map`
      });

      ensureVesselsOnTop();

    } catch (error) {
      console.error(`Error adding ${overlayType} overlay:`, error);
      toast({
        title: "Layer Error",
        description: `Failed to add ${overlayType} layer. This may be due to API permissions or network issues.`,
        variant: "destructive"
      });
    }
  };

  const removeOverlay = (overlayType: string) => {
    if (!mapref.current) return;

    const layerId = `dtn-layer-${overlayType}`;
    const sourceId = `dtn-source-${overlayType}`;

    if (mapref.current.getLayer(layerId)) {
      mapref.current.removeLayer(layerId);
    }

    if (mapref.current.getSource(sourceId)) {
      mapref.current.removeSource(sourceId);
    }

    setActiveOverlays(prev => prev.filter(overlay => overlay !== overlayType));

    // Track layer removal with Amplitude
    trackLayerRemoved(overlayType, layerId);

    toast({
      title: "Layer Removed",
      description: `${overlayType.charAt(0).toUpperCase() + overlayType.slice(1)} layer has been removed`
    });
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
