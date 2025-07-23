import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import VoyageConfigPanel from '@/components/VoyageCreation/VoyageConfigPanel';
import VoyageMapInterface from '@/components/VoyageCreation/VoyageMapInterface';
import WaypointsBottomPanel from '@/components/VoyageCreation/WaypointsBottomPanel';
import { WaypointData } from '@/types/voyage';

const ModifyVoyage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [waypoints, setWaypoints] = useState<WaypointData[]>([]);
  const [mapboxToken] = useState('pk.eyJ1IjoiZ2Vvc2VydmUiLCJhIjoiY201Z2J3dXBpMDU2NjJpczRhbmJubWtxMCJ9.6Kw-zTqoQcNdDokBgbI5_Q');
  const [voyageName, setVoyageName] = useState('');
  const [vesselName, setVesselName] = useState('');
  const [mirEnabled, setMirEnabled] = useState(true);
  
  const [selectedWaypoint, setSelectedWaypoint] = useState<WaypointData | null>(null);
  const [isPanelMinimized, setIsPanelMinimized] = useState(false);

  // Initialize with mock voyage data - prefilled for modify
  useEffect(() => {
    const mockWaypoints: WaypointData[] = [
      {
        id: '1',
        lat: 29.52432,
        lon: 121.08295,
        waypointNumber: 1,
        isLocked: false,
        isPassed: true,
        createdFrom: 'manual',
        timestamp: new Date().toISOString(),
        name: 'Start Port',
        eta: '2025-07-23T06:30:00Z'
      },
      {
        id: '2',
        lat: 32.52432,
        lon: 124.08295,
        waypointNumber: 2,
        isLocked: false,
        isPassed: true,
        createdFrom: 'manual',
        timestamp: new Date().toISOString(),
        name: 'Waypoint 1',
        eta: '2025-07-23T12:30:00Z'
      },
      {
        id: '3',
        lat: 35.52432,
        lon: 127.08295,
        waypointNumber: 3,
        isLocked: true,
        isPassed: false,
        createdFrom: 'manual',
        timestamp: new Date().toISOString(),
        name: 'Waypoint 2',
        eta: '2025-07-24T06:30:00Z'
      },
      {
        id: '4',
        lat: 38.52432,
        lon: 130.08295,
        waypointNumber: 4,
        isLocked: false,
        isPassed: false,
        createdFrom: 'manual',
        timestamp: new Date().toISOString(),
        name: 'Waypoint 3',
        eta: '2025-07-24T18:30:00Z'
      },
      {
        id: '5',
        lat: 45.52432,
        lon: 135.08295,
        waypointNumber: 5,
        isLocked: false,
        isPassed: false,
        createdFrom: 'manual',
        timestamp: new Date().toISOString(),
        name: 'Destination Port',
        eta: '2025-07-25T12:30:00Z'
      }
    ];
    setWaypoints(mockWaypoints);
    
    // Pre-fill with existing voyage data
    setVoyageName(`Route ${id?.split('-')[1]} - Modified`);
    setVesselName('MV Atlantic Express');
  }, [id]);

  const handleWaypointsChange = (newWaypoints: WaypointData[]) => {
    setWaypoints(newWaypoints);
  };

  const handleWaypointClick = (waypoint: WaypointData) => {
    setSelectedWaypoint(waypoint);
    setIsPanelMinimized(false); // Open the panel when waypoint is clicked
  };

  const handleUpdateWaypoint = (waypointId: string, updates: Partial<WaypointData>) => {
    const updatedWaypoints = waypoints.map(wp => 
      wp.id === waypointId ? { ...wp, ...updates } : wp
    );
    setWaypoints(updatedWaypoints);
    toast.success('Waypoint updated');
  };

  const handleToggleLock = (waypointId: string) => {
    const updatedWaypoints = waypoints.map(wp => 
      wp.id === waypointId 
        ? { ...wp, isLocked: !wp.isLocked }
        : wp
    );
    setWaypoints(updatedWaypoints);
    
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
      .map((wp, index) => ({ ...wp, waypointNumber: index + 1 })); // Renumber waypoints
    
    setWaypoints(updatedWaypoints);
    toast.success(`Waypoint ${waypoint.waypointNumber} deleted`);
  };

  const handleSaveVoyage = () => {
    if (!voyageName.trim()) {
      toast.error('Please enter a voyage name');
      return;
    }
    
    if (!vesselName.trim()) {
      toast.error('Please enter a vessel name');
      return;
    }

    console.log('Saving modified voyage with waypoints:', waypoints);
    toast.success('Voyage modifications saved successfully!');
    navigate(`/routes/${id}`);
  };

  // Get only passed waypoints for display in config panel
  const passedWaypoints = waypoints.filter(wp => wp.isPassed);

  return (
    <div className="flex h-screen bg-background">
      {/* Left Panel - Configuration with prefilled data and passed waypoints info */}
      <VoyageConfigPanel 
        voyageName={voyageName}
        setVoyageName={setVoyageName}
        vesselName={vesselName}
        setVesselName={setVesselName}
        waypoints={passedWaypoints} // Show only passed waypoints as additional info
        onWaypointsChange={setWaypoints}
        onGenerateVoyage={handleSaveVoyage}
      />
      
      {/* Right Panel - Map Interface */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1">
          <VoyageMapInterface 
            mapboxToken={mapboxToken}
            waypoints={waypoints}
            onWaypointsChange={handleWaypointsChange}
            onWaypointClick={handleWaypointClick}
            zoomToWaypoint={selectedWaypoint}
          />
        </div>
        
        {/* Bottom Waypoints Panel */}
        <WaypointsBottomPanel
          waypoints={waypoints}
          onWaypointClick={handleWaypointClick}
          onToggleLock={handleToggleLock}
          onDeleteWaypoint={handleDeleteWaypoint}
          onUpdateWaypoint={handleUpdateWaypoint}
          selectedWaypointId={selectedWaypoint?.id}
          isMinimized={isPanelMinimized}
          onToggleMinimized={() => setIsPanelMinimized(!isPanelMinimized)}
        />
      </div>
    </div>
  );
};

export default ModifyVoyage;