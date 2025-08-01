
import mapboxgl from 'mapbox-gl';
import { layerConfigs, dtnToken } from './mapConstants';

export const updateWeatherLayer = (
  map: mapboxgl.Map | null,
  layerType: string,
  enabled: boolean,
  toast: (options: { title: string; description: string; variant?: string }) => void
) => {
  // Add comprehensive safety checks
  if (!map) {
    console.log(`Map not ready, skipping layer update for ${layerType}`);
    return;
  }

  // Additional safety check to ensure map methods exist
  if (typeof map.getSource !== 'function' || typeof map.getLayer !== 'function') {
    console.log(`Map methods not available, skipping layer update for ${layerType}`);
    return;
  }

  const sourceId = `${layerType}-layer`;
  const layerId = `${layerType}-layer-render`;
  const config = layerConfigs[layerType as keyof typeof layerConfigs];
  
  if (!config) return;

  console.log(`Updating weather layer ${layerType}, enabled: ${enabled}`);

  try {
    if (enabled) {
      // Special handling for tropical storms (vector tiles)
      if (layerType === 'tropicalStorms') {
        if (!map.getSource(sourceId)) {
          console.log("Adding tropical storms vector source:", sourceId);
          map.addSource(sourceId, {
            type: "vector",
            url: `https://map.api.dtn.com/v2/styles/${config.dtnLayerId}?token=${dtnToken.replace('Bearer ', '')}`
          });
        }

        // Add vector layers for tropical storms
        if (!map.getLayer(layerId)) {
          console.log("Adding tropical storms layers:", layerId);
          
          // Add storm track line
          map.addLayer({
            id: `${layerId}-track`,
            type: "line",
            source: sourceId,
            'source-layer': 'tropical_cyclone_consensus_history_track',
            paint: {
              "line-color": "#000000",
              "line-width": 2
            }
          });

          // Add forecast track line
          map.addLayer({
            id: `${layerId}-forecast`,
            type: "line", 
            source: sourceId,
            'source-layer': 'tropical_cyclone_consensus_forecast_track',
            paint: {
              "line-color": "#000000",
              "line-width": 1,
              "line-dasharray": [7, 5]
            }
          });

          // Add storm symbols
          map.addLayer({
            id: layerId,
            type: "symbol",
            source: sourceId,
            'source-layer': 'tropical_cyclone_consensus_points',
            layout: {
              "icon-image": "circle-15",
              "icon-size": 1.5,
              "icon-allow-overlap": true
            },
            paint: {
              "icon-color": "#FF0000",
              "icon-opacity": 0.9
            }
          });
        }
      } else {
        // Regular raster layer handling
        if (!map.getSource(sourceId)) {
          console.log("Adding new source:", sourceId);
          map.addSource(sourceId, {
            type: "raster",
            tiles: [
              `https://map.api.dtn.com/v2/tiles/${config.dtnLayerId}/${config.tileSetId}/{z}/{x}/{y}.webp?size=512&unit=metric-marine&token=${dtnToken.replace('Bearer ', '')}`,
            ],
            tileSize: 512,
          });
        }

        if (!map.getLayer(layerId)) {
          console.log("Adding new layer:", layerId);
          const layers = map.getStyle().layers;
          const topLayer = layers.find(layer => layer.type === 'symbol' && layer.id.includes('label'));

          map.addLayer({
            id: layerId,
            type: "raster",
            source: sourceId,
            paint: {
              "raster-opacity": 0.9
            }
          }, topLayer ? topLayer.id : undefined);
        } else {
          console.log("Updating existing layer:", layerId);
          // Make sure layer is visible and update opacity
          map.setLayoutProperty(layerId, 'visibility', 'visible');
          map.setPaintProperty(layerId, 'raster-opacity', 0.9);
        }
      }
      
      toast({
        title: `${layerType.charAt(0).toUpperCase() + layerType.slice(1)} Layer`,
        description: `Successfully loaded ${layerType} overlay`
      });
    } else {
      // Hide the layer(s)
      if (layerType === 'tropicalStorms') {
        // Hide all tropical storm layers
        [`${layerId}-track`, `${layerId}-forecast`, layerId].forEach(id => {
          if (map.getLayer(id)) {
            console.log("Hiding tropical storm layer:", id);
            map.setLayoutProperty(id, 'visibility', 'none');
          }
        });
      } else {
        if (map.getLayer(layerId)) {
          console.log("Hiding layer:", layerId);
          map.setLayoutProperty(layerId, 'visibility', 'none');
        }
      }
    }
  } catch (error) {
    console.error(`Error updating weather layer ${layerType}:`, error);
    toast({
      title: "Layer Error",
      description: `Failed to update ${layerType} layer`,
      variant: "destructive"
    });
  }
};
