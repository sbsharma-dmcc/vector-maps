import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { WaypointData } from '@/types/voyage';
import { MapPin } from 'lucide-react';
import { toast } from 'sonner';

interface InteractiveWaypointMapProps {
  mapboxToken: string;
  waypoints: WaypointData[];
  onWaypointUpdate: (waypoints: WaypointData[]) => void;
  onWaypointClick?: (waypoint: WaypointData) => void;
  zoomToWaypoint?: WaypointData | null;
}

const InteractiveWaypointMap = ({ 
  mapboxToken, 
  waypoints, 
  onWaypointUpdate,
  onWaypointClick,
  zoomToWaypoint 
}: InteractiveWaypointMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      zoom: 8,
      center: waypoints.length > 0 ? [waypoints[0].lon, waypoints[0].lat] : [69.2, 22.6],
    });

    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    return () => {
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current.clear();
      map.current?.remove();
    };
  }, [mapboxToken]);

  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current.clear();

    // Add new markers for each waypoint
    waypoints.forEach((waypoint, index) => {
      const markerElement = createWaypointMarker(waypoint, index);
      
      const marker = new mapboxgl.Marker(markerElement)
        .setLngLat([waypoint.lon, waypoint.lat])
        .addTo(map.current!);

      markersRef.current.set(waypoint.id, marker);
    });

    // Fit map to show all waypoints
    if (waypoints.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      waypoints.forEach(wp => bounds.extend([wp.lon, wp.lat]));
      
      map.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 12
      });
    }

    // Add route line if multiple waypoints
    if (waypoints.length > 1) {
      addRouteVisualization();
    }
  }, [waypoints]);

  const createWaypointMarker = (waypoint: WaypointData, index: number) => {
    const markerDiv = document.createElement('div');
    markerDiv.className = 'waypoint-marker';
    markerDiv.innerHTML = `
      <div class="relative group cursor-pointer">
        <div class="w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-xs font-bold text-white transition-all hover:scale-110 ${
          waypoint.isLocked 
            ? 'bg-red-500 hover:bg-red-600' 
            : 'bg-blue-500 hover:bg-blue-600'
        }">
          ${waypoint.waypointNumber}
        </div>
        ${waypoint.isLocked ? 
          '<div class="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full border border-white flex items-center justify-center"><svg class="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"></path></svg></div>' 
          : ''
        }
        <div class="absolute top-10 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-2 min-w-[200px] opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none group-hover:pointer-events-auto">
          <div class="text-sm font-medium text-gray-900">${waypoint.name || `Waypoint ${waypoint.waypointNumber}`}</div>
          <div class="text-xs text-gray-500">
            ${waypoint.lat.toFixed(6)}, ${waypoint.lon.toFixed(6)}
          </div>
          <div class="flex gap-1 mt-2">
            <button class="waypoint-action-btn lock-btn p-1 rounded hover:bg-gray-100" data-waypoint-id="${waypoint.id}" data-action="toggle-lock">
              ${waypoint.isLocked 
                ? '<svg class="w-3 h-3 text-orange-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"></path></svg>' 
                : '<svg class="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z"></path></svg>'
              }
            </button>
            <button class="waypoint-action-btn delete-btn p-1 rounded hover:bg-red-100" data-waypoint-id="${waypoint.id}" data-action="delete">
              <svg class="w-3 h-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clip-rule="evenodd"></path>
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `;

    // Add event listeners to action buttons and waypoint clicks
    markerDiv.addEventListener('click', (e) => {
      e.stopPropagation();
      const target = e.target as HTMLElement;
      const button = target.closest('.waypoint-action-btn') as HTMLElement;
      
      if (button) {
        const waypointId = button.dataset.waypointId!;
        const action = button.dataset.action!;
        
        if (action === 'toggle-lock') {
          handleToggleLock(waypointId);
        } else if (action === 'delete') {
          handleDeleteWaypoint(waypointId);
        }
      } else {
        // Click on waypoint itself - trigger onWaypointClick
        if (onWaypointClick) {
          onWaypointClick(waypoint);
        }
      }
    });

    return markerDiv;
  };

  const addRouteVisualization = () => {
    if (!map.current) return;

    // Remove existing route layers
    ['route', 'route-locked', 'route-unlocked', 'route-transition'].forEach(layerId => {
      if (map.current!.getLayer(layerId)) {
        map.current!.removeLayer(layerId);
      }
    });
    
    ['route', 'route-locked', 'route-unlocked', 'route-transition'].forEach(sourceId => {
      if (map.current!.getSource(sourceId)) {
        map.current!.removeSource(sourceId);
      }
    });

    // Create different route segments based on waypoint lock status
    const segments = {
      locked: [] as number[][],
      unlocked: [] as number[][],
      transition: [] as number[][]
    };

    for (let i = 0; i < waypoints.length - 1; i++) {
      const current = waypoints[i];
      const next = waypoints[i + 1];
      
      const segment = [
        [current.lon, current.lat],
        [next.lon, next.lat]
      ];

      if (current.isLocked && next.isLocked) {
        segments.locked.push(...segment);
      } else if (!current.isLocked && !next.isLocked) {
        segments.unlocked.push(...segment);
      } else {
        segments.transition.push(...segment);
      }
    }

    // Add locked route segments (solid red)
    if (segments.locked.length > 0) {
      map.current.addSource('route-locked', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: segments.locked
          }
        }
      });

      map.current.addLayer({
        id: 'route-locked',
        type: 'line',
        source: 'route-locked',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#dc2626',
          'line-width': 3,
          'line-opacity': 0.8
        }
      });
    }

    // Add unlocked route segments (solid blue)
    if (segments.unlocked.length > 0) {
      map.current.addSource('route-unlocked', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: segments.unlocked
          }
        }
      });

      map.current.addLayer({
        id: 'route-unlocked',
        type: 'line',
        source: 'route-unlocked',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#2563eb',
          'line-width': 3,
          'line-opacity': 0.8
        }
      });
    }

    // Add transition route segments (dashed yellow)
    if (segments.transition.length > 0) {
      map.current.addSource('route-transition', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: segments.transition
          }
        }
      });

      map.current.addLayer({
        id: 'route-transition',
        type: 'line',
        source: 'route-transition',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#eab308',
          'line-width': 3,
          'line-opacity': 0.8,
          'line-dasharray': [2, 2]
        }
      });
    }
  };

  const handleToggleLock = (waypointId: string) => {
    const updatedWaypoints = waypoints.map(wp => 
      wp.id === waypointId 
        ? { ...wp, isLocked: !wp.isLocked }
        : wp
    );
    
    onWaypointUpdate(updatedWaypoints);
    
    const waypoint = waypoints.find(wp => wp.id === waypointId);
    if (waypoint) {
      toast.success(`Waypoint ${waypoint.waypointNumber} ${waypoint.isLocked ? 'unlocked' : 'locked'}`);
    }
  };

  const handleDeleteWaypoint = (waypointId: string) => {
    const waypoint = waypoints.find(wp => wp.id === waypointId);
    if (!waypoint) return;

    const updatedWaypoints = waypoints
      .filter(wp => wp.id !== waypointId)
      .map((wp, index) => ({ ...wp, waypointNumber: index + 1 }));
    
    onWaypointUpdate(updatedWaypoints);
    toast.success(`Waypoint ${waypoint.waypointNumber} deleted`);
  };

  // Effect to handle zoom to waypoint
  useEffect(() => {
    if (!map.current || !zoomToWaypoint) return;

    map.current.flyTo({
      center: [zoomToWaypoint.lon, zoomToWaypoint.lat],
      zoom: 14,
      duration: 1000
    });
  }, [zoomToWaypoint]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0 rounded-lg" />
      
      {waypoints.length === 0 && (
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 max-w-xs">
          <div className="text-center">
            <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm font-medium text-muted-foreground">No waypoints uploaded</p>
            <p className="text-xs text-muted-foreground mt-1">
              Upload MIR data to visualize waypoints
            </p>
          </div>
        </div>
      )}

      {waypoints.length > 0 && (
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 max-w-xs">
          <div className="text-sm font-medium mb-2">Waypoint Legend</div>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              <span>Locked waypoints</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              <span>Unlocked waypoints</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-1 bg-yellow-500 border-t-2 border-dashed border-yellow-500"></div>
              <span>Transition segments</span>
            </div>
            <div className="text-muted-foreground mt-2">
              Click waypoint markers to lock/unlock or delete
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractiveWaypointMap;