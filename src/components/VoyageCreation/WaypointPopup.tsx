import React from 'react';
import { WaypointData } from '@/types/voyage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, LockOpen, Trash2, X } from 'lucide-react';

interface WaypointPopupProps {
  waypoint: WaypointData;
  onToggleLock: (waypointId: string) => void;
  onDelete: (waypointId: string) => void;
  onClose: () => void;
  position: { x: number; y: number };
}

const WaypointPopup = ({ 
  waypoint, 
  onToggleLock, 
  onDelete, 
  onClose, 
  position 
}: WaypointPopupProps) => {
  return (
    <div
      className="absolute z-50 pointer-events-auto"
      style={{
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -100%)',
      }}
    >
      <Card className="w-64 shadow-lg border border-border bg-background">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">
              {waypoint.name || `WP${waypoint.waypointNumber}`}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          <div className="text-xs text-muted-foreground">
            {waypoint.lat.toFixed(6)}, {waypoint.lon.toFixed(6)}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex gap-2">
            <Button
              variant={waypoint.isLocked ? "default" : "outline"}
              size="sm"
              onClick={() => onToggleLock(waypoint.id)}
              className="flex-1 text-xs"
            >
              {waypoint.isLocked ? (
                <>
                  <LockOpen className="h-3 w-3 mr-1" />
                  Unlock
                </>
              ) : (
                <>
                  <Lock className="h-3 w-3 mr-1" />
                  Lock
                </>
              )}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                onDelete(waypoint.id);
                onClose();
              }}
              className="flex-1 text-xs"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WaypointPopup;