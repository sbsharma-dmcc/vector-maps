import React from 'react';
import { WaypointData } from '@/types/voyage';
import InteractiveWaypointMap from './InteractiveWaypointMap';

interface VoyageMapInterfaceProps {
  mapboxToken: string;
  waypoints: WaypointData[];
  onWaypointsChange: (waypoints: WaypointData[]) => void;
  onWaypointClick?: (waypoint: WaypointData) => void;
  zoomToWaypoint?: WaypointData | null;
}

const VoyageMapInterface = ({ mapboxToken, waypoints, onWaypointsChange, onWaypointClick, zoomToWaypoint }: VoyageMapInterfaceProps) => {
  return (
    <div className="w-full h-full min-h-[400px]">
      <InteractiveWaypointMap
        mapboxToken={mapboxToken}
        waypoints={waypoints}
        onWaypointUpdate={onWaypointsChange}
        onWaypointClick={onWaypointClick}
        zoomToWaypoint={zoomToWaypoint}
      />
    </div>
  );
};

export default VoyageMapInterface;