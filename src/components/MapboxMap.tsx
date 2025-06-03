import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useToast } from '@/hooks/use-toast';
import { defaultMapToken, baseLayerStyles } from '@/utils/mapConstants';
import { updateWeatherLayer } from '@/utils/weatherLayerManager';
import { createVesselMarkers, cleanupVesselMarkers, Vessel } from '@/utils/vesselMarkers';
import { addRoutesToMap, updateRouteVisibility } from '@/utils/routeManager';
import { initializeMap, addTerrainLayer } from '@/utils/mapInitializer';
import MapTokenInput from './MapTokenInput';
import MapTopControls from './MapTopControls';

interface MapboxMapProps {
  vessels: Vessel[];
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
  const [initialLayersApplied, setInitialLayersApplied] = useState(false);
  const [mapToken, setMapToken] = useState<string>(accessToken || defaultMapToken);
  const [appliedLayers, setAppliedLayers] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  // Memoize activeLayers to prevent unnecessary re-renders
  const memoizedActiveLayers = useMemo(() => activeLayers, [JSON.stringify(activeLayers)]);

  // Initialize map effect
  useEffect(() => {
    if (!mapToken || !mapContainer.current || map.current) return;

    console.log("Initializing map with token:", mapToken.substring(0, 10) + "...");

    try {
      // Initialize map with the default style only
      map.current = initializeMap(mapContainer.current, mapToken, showRoutes, baseRoute);

      // Add sources and layers for routes when the map loads
      map.current.on('load', () => {
        console.log("Map loaded successfully, setting mapReady to true");
        setMapReady(true);
        
        if (map.current) {
          addTerrainLayer(map.current);

          if (showRoutes && baseRoute.length > 0) {
            addRoutesToMap(map.current, baseRoute, weatherRoute);
            
            // Keep references to the sources for updates
            baseRouteRef.current = map.current?.getSource('base-route') as mapboxgl.GeoJSONSource;
            weatherRouteRef.current = map.current?.getSource('weather-route') as mapboxgl.GeoJSONSource;
          }
        }
      });

      map.current.on('error', (e) => {
        console.error("Map error:", e.error);
        toast({
          title: "Map Error",
          description: "Failed to load the map. Please check your internet connection.",
          variant: "destructive"
        });
      });

      // Create markers for vessels
      if (vessels.length > 0) {
        createVesselMarkers(map.current, vessels, markersRef);
      }

      // Cleanup
      return () => {
        if (map.current) {
          map.current.remove();
          map.current = null;
        }
        cleanupVesselMarkers(markersRef);
        setMapReady(false);
        setInitialLayersApplied(false);
        setAppliedLayers({});
      };
    } catch (error) {
      console.error("Error initializing map:", error);
      toast({
        title: "Map Error",
        description: "Failed to initialize the map. Please check your access token.",
        variant: "destructive"
      });
    }
  }, [mapToken, vessels, showRoutes, baseRoute, weatherRoute, toast]);

  // Update layers when activeLayers changes - only after initial setup and when explicitly changed
  useEffect(() => {
    if (!mapReady || !map.current) {
      console.log("Map not ready, skipping layer updates");
      return;
    }

    // Don't apply layers on initial load - only when user explicitly toggles them
    if (!initialLayersApplied) {
      setInitialLayersApplied(true);
      setAppliedLayers(memoizedActiveLayers);
      return;
    }

    // Only update layers that have actually changed
    const layersChanged = Object.keys(memoizedActiveLayers).some(
      layerType => appliedLayers[layerType] !== memoizedActiveLayers[layerType]
    );

    if (!layersChanged) {
      console.log("No layer changes detected, skipping update");
      return;
    }

    console.log("Active layers changed:", memoizedActiveLayers);
    Object.entries(memoizedActiveLayers).forEach(([layerType, enabled]) => {
      if (appliedLayers[layerType] !== enabled) {
        updateWeatherLayer(map.current, layerType, enabled, toast);
      }
    });

    setAppliedLayers({ ...memoizedActiveLayers });
  }, [memoizedActiveLayers, mapReady, initialLayersApplied, appliedLayers, toast]);

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
            addRoutesToMap(map.current!, baseRoute, weatherRoute);
          }
          
          // Re-apply active weather layers
          Object.entries(appliedLayers).forEach(([layerType, enabled]) => {
            if (enabled) {
              updateWeatherLayer(map.current, layerType, enabled, toast);
            }
          });
        });
      }
    } catch (error) {
      console.error("Error updating base layer:", error);
    }
  }, [activeBaseLayer, mapReady, appliedLayers, showRoutes, baseRoute, weatherRoute, toast]);

  // Update visible route when activeRouteType changes
  useEffect(() => {
    if (!map.current || !mapReady) return;
    
    updateRouteVisibility(map.current, activeRouteType);
  }, [activeRouteType, mapReady]);

  // If no token provided, show token input form
  if (!mapToken || mapToken === '') {
    return <MapTokenInput onTokenSubmit={setMapToken} />;
  }

  // Render the map with top controls
  return (
    <div className="relative h-full w-full bg-[#2B67AF]">
      <MapTopControls />
      <div ref={mapContainer} className="absolute inset-0" />
    </div>
  );
};

export default MapboxMap;
