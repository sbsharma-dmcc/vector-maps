
import React, { useRef, useState, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import 'mapbox-gl/dist/mapbox-gl.css';
import { useToast } from '@/hooks/use-toast';
import { getDTNToken } from '@/utils/dtnTokenManager';

mapboxgl.accessToken = "pk.eyJ1IjoiZ2Vvc2VydmUiLCJhIjoiY201Z2J3dXBpMDU2NjJpczRhbmJubWtxMCJ9.6Kw-zTqoQcNdDokBgbI5_Q";

interface WeatherConfig {
  fillOpacity: number;
  heatmapIntensity: number;
  heatmapRadius: number;
  heatmapWeight: number;
  lineOpacity: number;
  lineWidth: number;
  colorScheme: string;
  customColors: {
    lowPressure: string;
    mediumPressure: string;
    highPressure: string;
  };
  enableAnimation: boolean;
  animationSpeed: number;
  blendMode: string;
  smoothing: boolean;
  contourInterval: number;
}

interface MapboxMapProps {
  vessels?: any[];
  accessToken?: string;
  showRoutes?: boolean;
  baseRoute?: [number, number][];
  weatherRoute?: [number, number][];
  activeRouteType?: 'base' | 'weather';
  activeLayers?: Record<string, boolean>;
  activeBaseLayer?: string;
  weatherConfigs?: Record<string, WeatherConfig>;
}

const MapboxMap: React.FC<MapboxMapProps> = ({ 
  vessels = [],
  accessToken,
  showRoutes = false,
  baseRoute = [],
  weatherRoute = [],
  activeRouteType = 'base',
  activeLayers = {},
  activeBaseLayer = 'default',
  weatherConfigs = {}
}) => {
  const mapContainerRef = useRef(null);
  const mapref = useRef<mapboxgl.Map | null>(null);
  const [showLayers, setShowLayers] = useState(false);
  const [activeOverlays, setActiveOverlays] = useState<string[]>([]);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  const { toast } = useToast();

  // Complete DTN layers collection including all requested layers
  const dtnOverlays = {
    'symbol': { 
      dtnLayerId: 'fcst-manta-weather-symbols', 
      tileSetId: 'weather-symbols-latest',
      name: 'Weather Symbols'
    },
    'wind-barb': { 
      dtnLayerId: 'fcst-manta-wind-barbs', 
      tileSetId: 'wind-barbs-latest',
      name: 'Wind Barbs'
    },
    'swell': { 
      dtnLayerId: 'fcst-manta-swell-height-contours', 
      tileSetId: 'swell-height-latest',
      name: 'Swell Height'
    },
    'pressure-lines': { 
      dtnLayerId: 'fcst-manta-mean-sea-level-pressure-isolines', 
      tileSetId: '2703fb6d-0ace-43a3-aca1-76588e3ac9a8',
      name: 'Pressure Lines'
    },
    'pressure-gradient': { 
      dtnLayerId: 'fcst-manta-mean-sea-level-pressure-isolines', 
      tileSetId: '2703fb6d-0ace-43a3-aca1-76588e3ac9a8',
      name: 'Pressure Gradient'
    },
    'pressure-analysis': {
      dtnLayerId: 'analysis-manta-mean-sea-level-pressure-isolines',
      tileSetId: 'analysis-pressure-latest',
      name: 'Pressure Analysis'
    },
    'pressure-tendency': {
      dtnLayerId: 'fcst-manta-pressure-tendency-isolines',
      tileSetId: 'pressure-tendency-latest',
      name: 'Pressure Tendency'
    },
    'high-pressure-centers': {
      dtnLayerId: 'fcst-manta-high-pressure-centers',
      tileSetId: 'high-pressure-centers-latest',
      name: 'High Pressure Centers'
    },
    'low-pressure-centers': {
      dtnLayerId: 'fcst-manta-low-pressure-centers',
      tileSetId: 'low-pressure-centers-latest',
      name: 'Low Pressure Centers'
    },
    'pressure-systems': {
      dtnLayerId: 'fcst-manta-pressure-systems',
      tileSetId: 'pressure-systems-latest',
      name: 'Pressure Systems'
    },
    'surface-pressure': {
      dtnLayerId: 'fcst-manta-surface-pressure-contours',
      tileSetId: 'surface-pressure-latest',
      name: 'Surface Pressure'
    }
  };

  const getColorScheme = (scheme: string, customColors?: any) => {
    switch (scheme) {
      case 'rainbow':
        return [
          0, 'rgba(138, 43, 226, 0)',
          0.1, 'rgba(75, 0, 130, 0.3)',
          0.2, 'rgba(0, 0, 255, 0.4)',
          0.3, 'rgba(0, 255, 255, 0.5)',
          0.4, 'rgba(0, 255, 0, 0.6)',
          0.5, 'rgba(255, 255, 0, 0.7)',
          0.6, 'rgba(255, 165, 0, 0.75)',
          0.7, 'rgba(255, 69, 0, 0.8)',
          0.8, 'rgba(255, 0, 0, 0.85)',
          0.9, 'rgba(139, 0, 0, 0.9)',
          1, 'rgba(128, 0, 0, 0.95)'
        ];
      case 'ocean':
        return [
          0, 'rgba(8, 48, 107, 0)',
          0.2, 'rgba(8, 81, 156, 0.3)',
          0.4, 'rgba(33, 113, 181, 0.5)',
          0.6, 'rgba(66, 146, 198, 0.7)',
          0.8, 'rgba(107, 174, 214, 0.8)',
          1, 'rgba(158, 202, 225, 0.9)'
        ];
      case 'thermal':
        return [
          0, 'rgba(0, 0, 0, 0)',
          0.2, 'rgba(128, 0, 128, 0.4)',
          0.4, 'rgba(255, 0, 0, 0.6)',
          0.6, 'rgba(255, 165, 0, 0.7)',
          0.8, 'rgba(255, 255, 0, 0.8)',
          1, 'rgba(255, 255, 255, 0.9)'
        ];
      case 'custom':
        return [
          0, 'rgba(0, 0, 0, 0)',
          0.33, customColors?.lowPressure || '#0066cc',
          0.66, customColors?.mediumPressure || '#ffff00',
          1, customColors?.highPressure || '#ff3300'
        ];
      default:
        return [
          0, 'rgba(0, 100, 150, 0)',
          0.1, 'rgba(0, 150, 200, 0.3)',
          0.2, 'rgba(50, 200, 220, 0.4)',
          0.3, 'rgba(100, 220, 200, 0.5)',
          0.4, 'rgba(150, 240, 180, 0.6)',
          0.5, 'rgba(200, 250, 150, 0.7)',
          0.6, 'rgba(240, 230, 120, 0.75)',
          0.7, 'rgba(250, 200, 100, 0.8)',
          0.8, 'rgba(255, 160, 80, 0.85)',
          0.9, 'rgba(255, 120, 60, 0.9)',
          1, 'rgba(220, 80, 40, 0.95)'
        ];
    }
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

  const fetchDTNSourceLayer = async (layerId: string) => {
    try {
      const token = getDTNToken();
      console.log(`Fetching source layer for: ${layerId}`);
      
      const response = await fetch(`https://map.api.dtn.com/v2/styles/${layerId}`, {
        headers: {
          Authorization: token,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch source layer: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const sourceLayerName = data[0]?.mapBoxStyle?.layers?.[0]?.["source-layer"];
      console.log(`Source layer found: ${sourceLayerName}`);
      return sourceLayerName;
    } catch (error) {
      console.error('Error fetching DTN source layer:', error);
      throw error;
    }
  };

  const getLayerConfig = (overlay: string): WeatherConfig => {
    return weatherConfigs[overlay] || {
      fillOpacity: 0.8,
      heatmapIntensity: 2.5,
      heatmapRadius: 25,
      heatmapWeight: 1,
      lineOpacity: 0.8,
      lineWidth: 2,
      colorScheme: 'default',
      customColors: {
        lowPressure: '#0066cc',
        mediumPressure: '#ffff00',
        highPressure: '#ff3300'
      },
      enableAnimation: false,
      animationSpeed: 1,
      blendMode: 'normal',
      smoothing: true,
      contourInterval: 4
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
    const config = getLayerConfig(overlay);

    try {
      console.log(`Adding overlay with config:`, { overlay, config });
      
      const token = getDTNToken();
      const authToken = token.replace('Bearer ', '');
      
      const sourceLayer = await fetchDTNSourceLayer(dtnLayerId);
      
      const tileURL = `https://map.api.dtn.com/v2/tiles/${dtnLayerId}/${tileSetId}/{z}/{x}/{y}.pbf?token=${authToken}`;
      console.log(`Tile URL: ${tileURL}`);
      
      if (!mapref.current.getSource(sourceId)) {
        console.log(`Adding source: ${sourceId}`);
        mapref.current.addSource(sourceId, {
          type: "vector",
          tiles: [tileURL],
          minzoom: 0,
          maxzoom: 14,
        });

        // Layer styling based on type with applied configuration
        if (overlay === 'symbol') {
          mapref.current.addLayer({
            id: layerId,
            type: "symbol",
            source: sourceId,
            "source-layer": sourceLayer,
            layout: {
              "icon-image": [
                'case',
                ['has', 'symbol_type'], ['get', 'symbol_type'],
                'circle'
              ],
              "icon-size": [
                'interpolate',
                ['linear'],
                ['zoom'],
                0, 0.5,
                6, 0.8,
                10, 1.2,
                14, 1.5
              ],
              "icon-allow-overlap": true,
              "visibility": "visible"
            },
            paint: {
              "icon-opacity": config.fillOpacity,
              "icon-color": config.colorScheme === 'custom' ? config.customColors.mediumPressure : '#ff6600'
            }
          });
        } else if (overlay === 'wind-barb') {
          mapref.current.addLayer({
            id: layerId,
            type: "symbol",
            source: sourceId,
            "source-layer": sourceLayer,
            layout: {
              "icon-image": "wind-barb",
              "icon-size": [
                'interpolate',
                ['linear'],
                ['zoom'],
                0, 0.3,
                6, 0.6,
                10, 1.0,
                14, 1.4
              ],
              "icon-rotation-alignment": "map",
              "icon-rotate": ['get', 'wind_direction'],
              "icon-allow-overlap": false,
              "symbol-spacing": 100,
              "visibility": "visible"
            },
            paint: {
              "icon-opacity": config.fillOpacity,
              "icon-color": [
                'interpolate',
                ['linear'],
                ['to-number', ['get', 'wind_speed'], 0],
                0, '#0066cc',
                10, '#00ccff',
                20, '#66ff66',
                30, '#ffff00',
                40, '#ff9900',
                50, '#ff3300'
              ]
            }
          });
        } else if (overlay === 'swell') {
          const colorScheme = getColorScheme(config.colorScheme, config.customColors);
          
          mapref.current.addLayer({
            id: layerId,
            type: "fill",
            source: sourceId,
            "source-layer": sourceLayer,
            paint: {
              "fill-color": [
                'interpolate',
                ['linear'],
                ['to-number', ['get', 'swell_height'], 0],
                0, 'rgba(0, 100, 200, 0.2)',
                1, 'rgba(0, 150, 255, 0.4)',
                2, 'rgba(50, 200, 255, 0.5)',
                3, 'rgba(100, 255, 200, 0.6)',
                4, 'rgba(150, 255, 150, 0.7)',
                5, 'rgba(200, 255, 100, 0.75)',
                6, 'rgba(255, 200, 50, 0.8)',
                7, 'rgba(255, 150, 0, 0.85)',
                8, 'rgba(255, 100, 0, 0.9)',
                10, 'rgba(200, 50, 0, 0.95)'
              ],
              "fill-opacity": config.fillOpacity,
              "fill-outline-color": 'rgba(255, 255, 255, 0.5)'
            },
            layout: {
              "visibility": "visible"
            }
          });
        } else if (overlay === 'pressure-gradient') {
          const colorScheme = getColorScheme(config.colorScheme, config.customColors);
          
          mapref.current.addLayer({
            id: layerId,
            type: "heatmap",
            source: sourceId,
            "source-layer": sourceLayer,
            paint: {
              "heatmap-color": [
                'interpolate',
                ['linear'],
                ['heatmap-density'],
                ...colorScheme
              ],
              "heatmap-radius": [
                'interpolate',
                ['exponential', 2],
                ['zoom'],
                0, config.heatmapRadius * 0.5,
                6, config.heatmapRadius,
                10, config.heatmapRadius * 2,
                14, config.heatmapRadius * 3
              ],
              "heatmap-intensity": [
                'interpolate',
                ['exponential', 1.5],
                ['zoom'],
                0, config.heatmapIntensity,
                6, config.heatmapIntensity * 1.2,
                10, config.heatmapIntensity * 1.4,
                14, config.heatmapIntensity * 1.6
              ],
              "heatmap-opacity": config.fillOpacity,
              "heatmap-weight": [
                'interpolate',
                ['linear'],
                ['to-number', ['get', 'value'], 1013],
                980, config.heatmapWeight,
                1013, config.heatmapWeight * 0.5,
                1050, config.heatmapWeight
              ]
            },
            layout: {
              "visibility": "visible"
            }
          });
        } else if (overlay === 'pressure-lines' || overlay === 'surface-pressure' || overlay === 'pressure-analysis') {
          mapref.current.addLayer({
            id: layerId,
            type: "line",
            source: sourceId,
            "source-layer": sourceLayer,
            paint: {
              "line-color": config.colorScheme === 'custom' ? [
                'interpolate',
                ['linear'],
                ['to-number', ['get', 'value'], 1013],
                980, config.customColors.lowPressure,
                1013, config.customColors.mediumPressure,
                1050, config.customColors.highPressure
              ] : [
                'interpolate',
                ['linear'],
                ['to-number', ['get', 'value'], 1013],
                980, '#0066cc',
                990, '#0080ff',
                1000, '#00ccff',
                1010, '#66ff66',
                1013, '#ffff00',
                1020, '#ff9900',
                1030, '#ff6600',
                1040, '#ff3300',
                1050, '#cc0000'
              ],
              "line-width": [
                'interpolate',
                ['linear'],
                ['zoom'],
                0, config.lineWidth * 0.5,
                6, config.lineWidth,
                10, config.lineWidth * 1.5,
                14, config.lineWidth * 2
              ],
              "line-opacity": config.lineOpacity
            },
            layout: {
              "visibility": "visible",
              "line-cap": "round",
              "line-join": "round"
            }
          });
        } else if (overlay === 'pressure-tendency') {
          mapref.current.addLayer({
            id: layerId,
            type: "line",
            source: sourceId,
            "source-layer": sourceLayer,
            paint: {
              "line-color": [
                'interpolate',
                ['linear'],
                ['to-number', ['get', 'value'], 0],
                -5, '#ff0000',
                -2, '#ff6600',
                -1, '#ffaa00',
                0, '#ffffff',
                1, '#66ff66',
                2, '#00ff00',
                5, '#006600'
              ],
              "line-width": config.lineWidth,
              "line-opacity": config.lineOpacity
            },
            layout: {
              "visibility": "visible",
              "line-cap": "round",
              "line-join": "round"
            }
          });
        } else if (overlay === 'high-pressure-centers' || overlay === 'low-pressure-centers') {
          mapref.current.addLayer({
            id: layerId,
            type: "circle",
            source: sourceId,
            "source-layer": sourceLayer,
            paint: {
              "circle-radius": [
                'interpolate',
                ['linear'],
                ['zoom'],
                0, 8,
                6, 12,
                10, 16,
                14, 20
              ],
              "circle-color": overlay === 'high-pressure-centers' ? '#ff6600' : '#0066ff',
              "circle-opacity": config.fillOpacity,
              "circle-stroke-width": 2,
              "circle-stroke-color": '#ffffff',
              "circle-stroke-opacity": 1
            },
            layout: {
              "visibility": "visible"
            }
          });
        } else if (overlay === 'pressure-systems') {
          mapref.current.addLayer({
            id: layerId,
            type: "fill",
            source: sourceId,
            "source-layer": sourceLayer,
            paint: {
              "fill-color": [
                'interpolate',
                ['linear'],
                ['to-number', ['get', 'pressure_type'], 0],
                0, 'rgba(0, 100, 200, 0.3)',
                1, 'rgba(200, 100, 0, 0.3)'
              ],
              "fill-opacity": config.fillOpacity,
              "fill-outline-color": '#ffffff'
            },
            layout: {
              "visibility": "visible"
            }
          });
        }

        // Apply blend mode if supported
        if (config.blendMode !== 'normal' && mapref.current.getLayer(layerId)) {
          try {
            mapref.current.setPaintProperty(layerId, 'raster-blend-mode', config.blendMode);
          } catch (e) {
            console.log('Blend mode not supported for this layer type');
          }
        }

        setActiveOverlays(prev => [...prev, overlay]);
        console.log(`Successfully added ${overlay} layer with config`);
        
        toast({
          title: `${dtnOverlays[overlay].name} Layer`,
          description: `Successfully loaded ${dtnOverlays[overlay].name} overlay with custom configuration`
        });
      } else {
        console.log(`Layer "${overlay}" already exists`);
        toast({
          title: "Layer Already Active",
          description: `${dtnOverlays[overlay].name} layer is already active on the map`
        });
      }
    } catch (error: any) {
      console.error(`Error adding ${overlay} layer:`, error);
      
      toast({
        title: "Layer Error",
        description: `Failed to add ${dtnOverlays[overlay].name} layer. Please check the token and try again.`,
        variant: "destructive"
      });
    }
  };

  const removeOverlay = (overlay: string) => {
    if (!mapref.current || !mapref.current.isStyleLoaded()) return;

    const sourceId = `dtn-source-${overlay}`;
    const layerId = `dtn-layer-${overlay}`;

    if (mapref.current.getLayer(layerId)) {
      mapref.current.removeLayer(layerId);
    }
    if (mapref.current.getSource(sourceId)) {
      mapref.current.removeSource(sourceId);
    }

    setActiveOverlays(prev => prev.filter(item => item !== overlay));
  };

  const removeAllOverlays = () => {
    activeOverlays.forEach(overlay => removeOverlay(overlay));
    setActiveOverlays([]);
    
    toast({
      title: "All Layers Removed",
      description: "All weather layers have been removed from the map"
    });
  };

  // Update layer configuration when weatherConfigs change
  useEffect(() => {
    if (!mapref.current || !isMapLoaded) return;

    activeOverlays.forEach(overlay => {
      const layerId = `dtn-layer-${overlay}`;
      const config = getLayerConfig(overlay);
      
      if (mapref.current.getLayer(layerId)) {
        // Update layer properties based on type
        if (overlay === 'pressure-gradient') {
          const colorScheme = getColorScheme(config.colorScheme, config.customColors);
          mapref.current.setPaintProperty(layerId, 'heatmap-color', [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            ...colorScheme
          ]);
          mapref.current.setPaintProperty(layerId, 'heatmap-opacity', config.fillOpacity);
          mapref.current.setPaintProperty(layerId, 'heatmap-intensity', [
            'interpolate',
            ['exponential', 1.5],
            ['zoom'],
            0, config.heatmapIntensity,
            6, config.heatmapIntensity * 1.2,
            10, config.heatmapIntensity * 1.4,
            14, config.heatmapIntensity * 1.6
          ]);
        } else if (overlay === 'pressure-lines' || overlay === 'surface-pressure' || overlay === 'pressure-analysis') {
          mapref.current.setPaintProperty(layerId, 'line-opacity', config.lineOpacity);
          mapref.current.setPaintProperty(layerId, 'line-width', [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, config.lineWidth * 0.5,
            6, config.lineWidth,
            10, config.lineWidth * 1.5,
            14, config.lineWidth * 2
          ]);
          
          if (config.colorScheme === 'custom') {
            mapref.current.setPaintProperty(layerId, 'line-color', [
              'interpolate',
              ['linear'],
              ['to-number', ['get', 'value'], 1013],
              980, config.customColors.lowPressure,
              1013, config.customColors.mediumPressure,
              1050, config.customColors.highPressure
            ]);
          }
        }
      }
    });
  }, [weatherConfigs, activeOverlays, isMapLoaded]);

  return (
    <div className="relative h-full w-full">
      <div ref={mapContainerRef} className="absolute inset-0" />

      <button
        onClick={() => setShowLayers(!showLayers)}
        className="absolute top-4 left-4 z-20 bg-white rounded-lg shadow-lg p-3 hover:bg-gray-50 transition-colors"
      >
        Toggle DTN Layers
      </button>

      {showLayers && (
        <div className="absolute top-16 left-4 z-20 bg-white rounded-lg shadow-lg p-4 min-w-[250px] max-h-[70vh] overflow-y-auto">
          <h3 className="text-sm font-semibold mb-3">DTN Weather Layers</h3>
          <div className="grid gap-1">
            {Object.entries(dtnOverlays).map(([overlay, config]) => (
              <div
                key={overlay}
                onClick={() => handleOverlayClick(overlay)}
                className={`p-2 rounded cursor-pointer transition-colors text-sm ${
                  activeOverlays.includes(overlay)
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200 text-black'
                }`}
              >
                {config.name}
                {activeOverlays.includes(overlay) && <span className="ml-2">✓</span>}
              </div>
            ))}
          </div>
          {activeOverlays.length > 0 && (
            <button
              onClick={removeAllOverlays}
              className="w-full mt-3 p-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm"
            >
              Remove All Layers ({activeOverlays.length})
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default MapboxMap;
