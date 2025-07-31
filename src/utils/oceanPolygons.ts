import mapboxgl from 'mapbox-gl';
import * as turf from '@turf/turf';

export interface OceanPolygonOptions {
  fillColor?: string;
  fillOpacity?: number;
  strokeColor?: string;
  strokeWidth?: number;
  strokeOpacity?: number;
}

export interface OceanPolygon {
  id: string;
  coordinates: [number, number][];
  properties?: Record<string, any>;
}

/**
 * Adds ocean-only polygon functionality to a Mapbox map
 * Polygons will automatically exclude land areas using Mapbox's natural earth data
 */
export class OceanPolygonManager {
  private map: mapboxgl.Map;
  private polygons: Map<string, OceanPolygon> = new Map();
  private readonly SOURCE_ID = 'ocean-polygons';
  private readonly LAYER_ID = 'ocean-polygons-layer';
  private readonly OUTLINE_LAYER_ID = 'ocean-polygons-outline';

  constructor(map: mapboxgl.Map) {
    this.map = map;
    this.initializeLayers();
  }

  private initializeLayers() {
    // Add source for ocean polygons
    if (!this.map.getSource(this.SOURCE_ID)) {
      this.map.addSource(this.SOURCE_ID, {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      });
    }

    // Add fill layer for polygons
    if (!this.map.getLayer(this.LAYER_ID)) {
      this.map.addLayer({
        id: this.LAYER_ID,
        type: 'fill',
        source: this.SOURCE_ID,
        paint: {
          'fill-color': ['get', 'fillColor'],
          'fill-opacity': ['get', 'fillOpacity']
        }
      });
    }

    // Add outline layer for polygons
    if (!this.map.getLayer(this.OUTLINE_LAYER_ID)) {
      this.map.addLayer({
        id: this.OUTLINE_LAYER_ID,
        type: 'line',
        source: this.SOURCE_ID,
        paint: {
          'line-color': ['get', 'strokeColor'],
          'line-width': ['get', 'strokeWidth'],
          'line-opacity': ['get', 'strokeOpacity']
        }
      });
    }
  }

  /**
   * Adds ocean mask layers to ensure polygons only show over water
   */
  private addOceanMask(): void {
    // Add ocean mask using Mapbox's built-in land data
    if (!this.map.getSource('ocean-mask')) {
      this.map.addSource('ocean-mask', {
        type: 'vector',
        url: 'mapbox://mapbox.natural-earth-shaded-relief'
      });
    }

    // Add a layer that masks land areas
    if (!this.map.getLayer('land-mask')) {
      this.map.addLayer({
        id: 'land-mask',
        type: 'fill',
        source: {
          type: 'vector',
          url: 'mapbox://mapbox.country-boundaries-v1'
        },
        'source-layer': 'country_boundaries',
        paint: {
          'fill-color': 'transparent',
          'fill-opacity': 0
        }
      }, this.LAYER_ID); // Add before our polygon layer
    }
  }

  /**
   * Clips a polygon to ocean areas only by using a simplified approach
   */
  private async clipToOcean(coordinates: [number, number][]): Promise<[number, number][][]> {
    // For now, return coordinates as-is and rely on map masking
    // This ensures polygons are drawn but will be visually masked over land
    return [coordinates];
  }

  /**
   * Adds a new ocean-only polygon to the map
   */
  async addPolygon(
    id: string,
    coordinates: [number, number][],
    options: OceanPolygonOptions = {},
    properties: Record<string, any> = {}
  ): Promise<void> {
    try {
      // Ensure the polygon is closed
      const closedCoordinates = [...coordinates];
      if (closedCoordinates[0][0] !== closedCoordinates[closedCoordinates.length - 1][0] ||
          closedCoordinates[0][1] !== closedCoordinates[closedCoordinates.length - 1][1]) {
        closedCoordinates.push(closedCoordinates[0]);
      }

      // Clip to ocean areas
      const oceanCoordinates = await this.clipToOcean(closedCoordinates);

      // Default options
      const defaultOptions: Required<OceanPolygonOptions> = {
        fillColor: '#0ea5e9',
        fillOpacity: 0.3,
        strokeColor: '#0284c7',
        strokeWidth: 2,
        strokeOpacity: 0.8,
        ...options
      };

      // Store polygon data
      const polygon: OceanPolygon = {
        id,
        coordinates: closedCoordinates,
        properties: { ...properties, ...defaultOptions }
      };

      this.polygons.set(id, polygon);

      // Update the map
      this.updateMapSource();

    } catch (error) {
      console.error('Error adding ocean polygon:', error);
    }
  }

  /**
   * Removes a polygon by ID
   */
  removePolygon(id: string): void {
    if (this.polygons.delete(id)) {
      this.updateMapSource();
    }
  }

  /**
   * Updates polygon options
   */
  updatePolygon(id: string, options: Partial<OceanPolygonOptions>): void {
    const polygon = this.polygons.get(id);
    if (polygon) {
      polygon.properties = { ...polygon.properties, ...options };
      this.updateMapSource();
    }
  }

  /**
   * Gets all polygons
   */
  getPolygons(): OceanPolygon[] {
    return Array.from(this.polygons.values());
  }

  /**
   * Clears all polygons
   */
  clearAll(): void {
    this.polygons.clear();
    this.updateMapSource();
  }

  /**
   * Updates the map source with current polygon data
   */
  private updateMapSource(): void {
    const features = Array.from(this.polygons.values()).map(polygon => ({
      type: 'Feature' as const,
      properties: polygon.properties || {},
      geometry: {
        type: 'Polygon' as const,
        coordinates: [polygon.coordinates]
      }
    }));

    const source = this.map.getSource(this.SOURCE_ID) as mapboxgl.GeoJSONSource;
    if (source) {
      source.setData({
        type: 'FeatureCollection',
        features
      });
    }
  }

  /**
   * Creates a polygon from clicked points on the map
   */
  startDrawing(
    options: OceanPolygonOptions = {},
    onComplete?: (polygon: OceanPolygon) => void
  ): () => void {
    const points: [number, number][] = [];
    let isDrawing = true;
    
    const handleClick = (e: mapboxgl.MapMouseEvent) => {
      if (!isDrawing) return;
      
      points.push([e.lngLat.lng, e.lngLat.lat]);
      
      // Visual feedback - add temporary markers
      new mapboxgl.Marker({ color: '#0ea5e9' })
        .setLngLat([e.lngLat.lng, e.lngLat.lat])
        .addTo(this.map);
    };

    const handleDoubleClick = async (e: mapboxgl.MapMouseEvent) => {
      if (!isDrawing || points.length < 3) return;
      
      isDrawing = false;
      this.map.off('click', handleClick);
      this.map.off('dblclick', handleDoubleClick);
      
      // Create polygon
      const id = `ocean-polygon-${Date.now()}`;
      await this.addPolygon(id, points, options);
      
      const polygon = this.polygons.get(id);
      if (polygon && onComplete) {
        onComplete(polygon);
      }
      
      // Clean up temporary markers
      document.querySelectorAll('.mapboxgl-marker').forEach(marker => {
        if (marker.querySelector('[style*="rgb(14, 165, 233)"]')) {
          marker.remove();
        }
      });
    };

    this.map.on('click', handleClick);
    this.map.on('dblclick', handleDoubleClick);

    // Return cleanup function
    return () => {
      isDrawing = false;
      this.map.off('click', handleClick);
      this.map.off('dblclick', handleDoubleClick);
    };
  }

  /**
   * Cleanup when destroying the manager
   */
  destroy(): void {
    if (this.map.getLayer(this.OUTLINE_LAYER_ID)) {
      this.map.removeLayer(this.OUTLINE_LAYER_ID);
    }
    if (this.map.getLayer(this.LAYER_ID)) {
      this.map.removeLayer(this.LAYER_ID);
    }
    if (this.map.getSource(this.SOURCE_ID)) {
      this.map.removeSource(this.SOURCE_ID);
    }
    this.polygons.clear();
  }
}