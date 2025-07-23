import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Ship, Navigation, Clock, MapPin, AlertTriangle } from 'lucide-react';
import WarningsPanel from './WarningsPanel';

interface VesselInfoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  vessel: any;
  onMoreDetails: () => void;
  warnings?: Array<{
    id: string;
    waypointName: string;
    message: string;
    severity: 'high' | 'medium' | 'low';
    type: 'weather' | 'route' | 'safety';
  }>;
}

const VesselInfoDialog = ({ isOpen, onClose, vessel, onMoreDetails, warnings = [] }: VesselInfoDialogProps) => {
  if (!vessel) return null;

  const formatPosition = (position: [number, number]) => {
    const [lng, lat] = position;
    const latDir = lat >= 0 ? 'N' : 'S';
    const lngDir = lng >= 0 ? 'E' : 'W';
    
    const formatCoord = (coord: number) => {
      const degrees = Math.floor(Math.abs(coord));
      const minutes = ((Math.abs(coord) - degrees) * 60).toFixed(2);
      return `${degrees}°${minutes}'`;
    };
    
    return `${formatCoord(lat)} ${latDir} ${formatCoord(lng)} ${lngDir}`;
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return `${Math.floor(diffMinutes / 1440)}d ago`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <Ship className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-lg font-semibold">{vessel.name}</div>
              <div className="text-sm text-muted-foreground">{vessel.id}</div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Status</span>
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              Active
            </Badge>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 mt-1 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">Current Position</div>
                <div className="text-sm text-muted-foreground">
                  {formatPosition(vessel.position)}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Navigation className="w-4 h-4 mt-1 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">Course & Speed</div>
                <div className="text-sm text-muted-foreground">
                  {vessel.course} • {vessel.speed}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-4 h-4 mt-1 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">Last Update</div>
                <div className="text-sm text-muted-foreground">
                  {getTimeAgo(vessel.lastUpdate)}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Route Warnings */}
          {warnings.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                Route Warnings
              </div>
              <div className="space-y-2">
                {warnings.slice(0, 2).map((warning) => (
                  <div key={warning.id} className="p-2 bg-orange-50 rounded border border-orange-200">
                    <div className="text-xs font-medium text-orange-800">{warning.waypointName}</div>
                    <div className="text-xs text-orange-600">{warning.message}</div>
                  </div>
                ))}
                {warnings.length > 2 && (
                  <div className="text-xs text-muted-foreground">
                    +{warnings.length - 2} more warnings
                  </div>
                )}
              </div>
              <Separator />
            </div>
          )}

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => {
                onClose();
                onMoreDetails();
              }}
            >
              More Details
            </Button>
            <Button 
              variant="default" 
              className="flex-1"
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VesselInfoDialog;