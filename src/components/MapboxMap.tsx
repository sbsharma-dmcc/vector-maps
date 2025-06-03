import React, { useEffect, useRef, useState } from 'react';
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
  const { toast } = useToast();

  // Update layers when activeLayers changes - only after initial setup and when explicitly changed
  useEffect(() => {
    if (!mapReady || !map.current) {
      console.log("Map not ready, skipping layer updates");
      return;
    }

    // Don't apply layers on initial load - only when user explicitly toggles them
    if (!initialLayersApplied) {
      setInitialLayersApplied(true);
      return;
    }

    console.log("Active layers changed:", activeLayers);
    Object.entries(activeLayers).forEach(([layerType, enabled]) => {
      updateWeatherLayer(map.current, layerType, enabled, toast);
    });
  }, [activeLayers, mapReady, initialLayersApplied]);

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
          Object.entries(activeLayers).forEach(([layerType, enabled]) => {
            if (enabled) {
              updateWeatherLayer(map.current, layerType, enabled, toast);
            }
          });
        });
      }
    } catch (error) {
      console.error("Error updating base layer:", error);
    }
  }, [activeBaseLayer, mapReady]);

  useEffect(() => {
    if (!mapToken || !mapContainer.current) return;

    try {
      // Initialize map with the default style only
      map.current = initializeMap(mapContainer.current, mapToken, showRoutes, baseRoute);

      // Add sources and layers for routes when the map loads
      map.current.on('load', () => {
        console.log("Map loaded, setting mapReady to true");
        setMapReady(true);
        
        addTerrainLayer(map.current!);

        if (showRoutes) {
          addRoutesToMap(map.current!, baseRoute, weatherRoute);
          
          // Keep references to the sources for updates
          baseRouteRef.current = map.current?.getSource('base-route') as mapboxgl.GeoJSONSource;
          weatherRouteRef.current = map.current?.getSource('weather-route') as mapboxgl.GeoJSONSource;
        }
      });

      // Create markers for vessels
      createVesselMarkers(map.current, vessels, markersRef);

      // Cleanup
      return () => {
        map.current?.remove();
        cleanupVesselMarkers(markersRef);
        setMapReady(false);
        setInitialLayersApplied(false);
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
    if (!map.current || !mapReady) return;
    
    updateRouteVisibility(map.current, activeRouteType);
  }, [activeRouteType, mapReady]);

  // If the map is already initialized, render the map with top controls
  if (mapToken) {
    return (
      <div className="relative h-full w-full bg-[#2B67AF]">
        <MapTopControls />
        <div ref={mapContainer} className="absolute inset-0" />
      </div>
    );
  }

  // Show token input form if token not provided
  return <MapTokenInput onTokenSubmit={setMapToken} />;
};

export default MapboxMap;
