import React from 'react';
import { WaypointData } from '@/types/voyage';
import InteractiveWaypointMap from './InteractiveWaypointMap';

interface VoyageMapInterfaceProps {
  mapboxToken: string;
  waypoints: WaypointData[];
  onWaypointsChange: (waypoints: WaypointData[]) => void;
}

const VoyageMapInterface = ({ mapboxToken, waypoints, onWaypointsChange }: VoyageMapInterfaceProps) => {
  return (
    <div className="flex-1 relative">
      <InteractiveWaypointMap 
        mapboxToken={mapboxToken}
        waypoints={waypoints}
        onWaypointUpdate={onWaypointsChange}
      />
    </div>
  );
};

export default VoyageMapInterface;