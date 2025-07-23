import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Plus } from 'lucide-react';

interface MapClickContextMenuProps {
  position: { x: number; y: number };
  coordinates: [number, number];
  onAddWaypoint: () => void;
  onClose: () => void;
  isVisible: boolean;
}

const MapClickContextMenu: React.FC<MapClickContextMenuProps> = ({
  position,
  coordinates,
  onAddWaypoint,
  onClose,
  isVisible
}) => {
  if (!isVisible) return null;

  const formatCoordinates = (coords: [number, number]) => {
    const [lng, lat] = coords;
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  };

  return (
    <>
      {/* Backdrop to close menu */}
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose}
      />
      
      {/* Context menu */}
      <Card 
        className="absolute z-50 shadow-lg border border-border bg-background min-w-[200px]"
        style={{
          left: position.x,
          top: position.y,
          transform: 'translate(-50%, -100%)',
        }}
      >
        <CardContent className="p-3">
          <div className="space-y-3">
            <div className="text-xs text-muted-foreground">
              <MapPin className="w-3 h-3 inline mr-1" />
              {formatCoordinates(coordinates)}
            </div>
            
            <Button
              onClick={onAddWaypoint}
              className="w-full flex items-center gap-2 text-sm"
              size="sm"
            >
              <Plus className="w-4 h-4" />
              Add this as waypoint
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default MapClickContextMenu;