
import React, { useRef, useState, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import 'mapbox-gl/dist/mapbox-gl.css';
import { useToast } from '@/hooks/use-toast';
import { getDTNToken } from '@/utils/dtnTokenManager';

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
  const [showLayers, setShowLayers] = useState(false);
  const [activeOverlays, setActiveOverlays] = useState<string[]>([]);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  const { toast } = useToast();

  // Enhanced DTN overlays with two pressure layers
  const dtnOverlays = {
    'pressure-gradient': { 
      dtnLayerId: 'fcst-manta-mean-sea-level-pressure-isolines', 
      tileSetId: '2703fb6d-0ace-43a3-aca1-76588e3ac9a8',
      name: 'Pressure Gradient'
    },
    'pressure-lines': { 
      dtnLayerId: 'fcst-manta-mean-sea-level-pressure-isolines', 
      tileSetId: '2703fb6d-0ace-43a3-aca1-76588e3ac9a8',
      name: 'Pressure Lines'
    },
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

    try {
      console.log(`Adding overlay details:`, { overlay, dtnLayerId, tileSetId, sourceId, layerId });
      
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

        if (overlay === 'pressure-gradient') {
          // Beautiful gradient like the reference image
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
              ],
              "heatmap-radius": [
                'interpolate',
                ['exponential', 2],
                ['zoom'],
                0, 30,
                6, 60,
                10, 120,
                14, 180
              ],
              "heatmap-intensity": [
                'interpolate',
                ['exponential', 1.5],
                ['zoom'],
                0, 2.5,
                6, 3,
                10, 3.5,
                14, 4
              ],
              "heatmap-opacity": [
                'interpolate',
                ['linear'],
                ['zoom'],
                0, 0.7,
                6, 0.8,
                10, 0.85,
                14, 0.9
              ],
              "heatmap-weight": [
                'interpolate',
                ['linear'],
                ['to-number', ['get', 'value'], 1013],
                980, 1,
                1013, 0.5,
                1050, 1
              ]
            },
            layout: {
              "visibility": "visible"
            }
          });
        } else if (overlay === 'pressure-lines') {
          // Clean pressure lines/contours
          mapref.current.addLayer({
            id: layerId,
            type: "line",
            source: sourceId,
            "source-layer": sourceLayer,
            paint: {
              "line-color": [
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
                0, 1,
                6, 1.5,
                10, 2,
                14, 2.5
              ],
              "line-opacity": 0.8
            },
            layout: {
              "visibility": "visible",
              "line-cap": "round",
              "line-join": "round"
            }
          });
        }

        setActiveOverlays(prev => [...prev, overlay]);
        console.log(`Successfully added ${overlay} layer`);
        
        toast({
          title: `${dtnOverlays[overlay].name} Layer`,
          description: `Successfully loaded ${dtnOverlays[overlay].name} overlay`
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
        <div className="absolute top-16 left-4 z-20 bg-white rounded-lg shadow-lg p-4 min-w-[200px]">
          <h3 className="text-sm font-semibold mb-3">DTN Pressure Layers</h3>
          {Object.entries(dtnOverlays).map(([overlay, config]) => (
            <div
              key={overlay}
              onClick={() => handleOverlayClick(overlay)}
              className={`p-2 m-1 rounded cursor-pointer transition-colors ${
                activeOverlays.includes(overlay)
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-black'
              }`}
            >
              {config.name}
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
    </div>
  );
};

export default MapboxMap;
