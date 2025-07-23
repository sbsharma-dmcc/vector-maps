import React from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Lock, Unlock, Trash2, Navigation } from 'lucide-react';
import { WaypointData } from '@/types/voyage';

interface WaypointsDrawerProps {
  waypoints: WaypointData[];
  onWaypointClick: (waypoint: WaypointData) => void;
  onToggleLock: (waypointId: string) => void;
  onDeleteWaypoint: (waypointId: string) => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

const WaypointsDrawer = ({
  waypoints,
  onWaypointClick,
  onToggleLock,
  onDeleteWaypoint,
  isOpen,
  onOpenChange,
  children
}: WaypointsDrawerProps) => {
  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      {children && (
        <DrawerTrigger asChild>
          {children}
        </DrawerTrigger>
      )}
      
      <DrawerContent className="max-h-[60vh]">
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5" />
            Uploaded Waypoints ({waypoints.length})
          </DrawerTitle>
        </DrawerHeader>
        
        <div className="px-4 pb-4 overflow-y-auto">
          {waypoints.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No waypoints uploaded yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {waypoints.map((waypoint) => (
                <div
                  key={waypoint.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => onWaypointClick(waypoint)}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`w-8 h-8 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-xs font-bold text-white ${
                      waypoint.isLocked ? 'bg-red-500' : 'bg-blue-500'
                    }`}>
                      {waypoint.waypointNumber}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">
                          {waypoint.name || `Waypoint ${waypoint.waypointNumber}`}
                        </span>
                        <Badge variant={waypoint.isLocked ? "destructive" : "secondary"} className="text-xs">
                          {waypoint.isLocked ? 'Locked' : 'Unlocked'}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {waypoint.lat.toFixed(6)}, {waypoint.lon.toFixed(6)}
                      </div>
                      {waypoint.eta && (
                        <div className="text-xs text-muted-foreground">
                          ETA: {waypoint.eta}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleLock(waypoint.id);
                      }}
                      className="h-8 w-8 p-0"
                    >
                      {waypoint.isLocked ? (
                        <Lock className="h-4 w-4 text-orange-500" />
                      ) : (
                        <Unlock className="h-4 w-4 text-blue-500" />
                      )}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteWaypoint(waypoint.id);
                      }}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default WaypointsDrawer;