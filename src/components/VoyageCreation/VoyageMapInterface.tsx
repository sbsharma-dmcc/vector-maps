import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Ship, Info, X } from 'lucide-react';

interface VoyageMapInterfaceProps {
  mapboxToken?: string;
  waypoints?: any[];
}

const VoyageMapInterface = ({ mapboxToken, waypoints = [] }: VoyageMapInterfaceProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [selectedVessel, setSelectedVessel] = useState<any>(null);
  const [showVesselPopup, setShowVesselPopup] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    // Initialize map with ocean-focused style
    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-v9',
      center: [70, 10], // Indian Ocean
      zoom: 4,
      pitch: 0,
      bearing: 0
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add vessel marker
    const vesselMarker = new mapboxgl.Marker({
      element: createVesselMarkerElement(),
      anchor: 'center'
    })
      .setLngLat([73.5, 15.5])
      .addTo(map.current);

    // Add route line if waypoints exist
    if (waypoints.length > 0) {
      map.current.on('load', () => {
        const coordinates = waypoints.map(wp => [wp.longitude, wp.latitude]);
        
        map.current?.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: coordinates
            }
          }
        });

        map.current?.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#3b82f6',
            'line-width': 3
          }
        });
      });
    }

    // Cleanup
    return () => {
      map.current?.remove();
    };
  }, [mapboxToken, waypoints]);

  const createVesselMarkerElement = () => {
    const el = document.createElement('div');
    el.className = 'vessel-marker';
    el.style.backgroundImage = 'url(/lovable-uploads/container.svg)';
    el.style.width = '32px';
    el.style.height = '32px';
    el.style.backgroundSize = 'contain';
    el.style.backgroundRepeat = 'no-repeat';
    el.style.cursor = 'pointer';
    el.style.filter = 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))';
    
    el.addEventListener('click', () => {
      setSelectedVessel({
        name: 'Ocean Sovereign',
        type: 'Cargo Container',
        status: 'Active'
      });
      setShowVesselPopup(true);
    });
    
    return el;
  };

  if (!mapboxToken) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/30">
        <Card className="p-6 text-center">
          <div className="text-lg font-medium mb-2">Loading interactive map...</div>
          <div className="text-sm text-muted-foreground">
            Enter your Mapbox token to view the map visualization
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 relative">
      <div ref={mapContainer} className="absolute inset-0" />
      
      {/* Timeline at bottom */}
      <div className="absolute bottom-0 left-0 right-0 bg-background/90 backdrop-blur-sm border-t border-border">
        <div className="flex items-center justify-between p-2">
          <Button variant="ghost" size="sm">◀</Button>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-xs">11 Tue</Badge>
            <Badge variant="outline" className="text-xs">12 Wed</Badge>
            <Badge variant="default" className="text-xs">Today</Badge>
            <Badge variant="outline" className="text-xs">14 Fri</Badge>
            <Badge variant="outline" className="text-xs">15 Sat</Badge>
          </div>
          <Button variant="ghost" size="sm">▶</Button>
        </div>
      </div>

      {/* Vessel popup */}
      {showVesselPopup && selectedVessel && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
          <Card className="p-4 min-w-[200px] shadow-lg">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center">
                  <Ship className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="font-medium text-sm">{selectedVessel.name}</div>
                  <div className="text-xs text-muted-foreground">{selectedVessel.type}</div>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowVesselPopup(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="text-xs">
                View Vessel Info
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Map controls overlay */}
      <div className="absolute top-4 right-4 space-y-2">
        <Button variant="outline" size="sm" className="bg-background/90 backdrop-blur-sm">
          <Info className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default VoyageMapInterface;