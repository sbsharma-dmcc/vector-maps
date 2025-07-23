import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import VoyageConfigPanel from '@/components/VoyageCreation/VoyageConfigPanel';
import VoyageMapInterface from '@/components/VoyageCreation/VoyageMapInterface';
import WaypointsBottomPanel from '@/components/VoyageCreation/WaypointsBottomPanel';
import { WaypointData } from '@/types/voyage';
import { sampleVoyageJSON } from '@/components/VoyageCreation/VoyageJSON';

const CreateVoyage = () => {
  const navigate = useNavigate();
  const [waypoints, setWaypoints] = useState<WaypointData[]>([]);
  const [mapboxToken] = useState('pk.eyJ1IjoiZ2Vvc2VydmUiLCJhIjoiY201Z2J3dXBpMDU2NjJpczRhbmJubWtxMCJ9.6Kw-zTqoQcNdDokBgbI5_Q');
  const [voyageName, setVoyageName] = useState('');
  const [vesselName, setVesselName] = useState('');
  const [mirEnabled, setMirEnabled] = useState(true);
  
  const [selectedWaypoint, setSelectedWaypoint] = useState<WaypointData | null>(null);

  const handleWaypointsChange = (newWaypoints: WaypointData[]) => {
    setWaypoints(newWaypoints);
  };

  const handleMIRToggle = (enabled: boolean) => {
    setMirEnabled(enabled);
    if (!enabled) {
      setWaypoints([]);
    }
  };

  const handleCreateVoyage = () => {
    if (!voyageName.trim()) {
      toast.error('Please enter a voyage name');
      return;
    }
    
    if (!vesselName.trim()) {
      toast.error('Please enter a vessel name');
      return;
    }

    // Generate voyage configuration
    const voyageConfig = {
      ...sampleVoyageJSON,
      voyageName,
      vessel: {
        ...sampleVoyageJSON.vessel,
        name: vesselName
      },
      masterIntendedRoute: {
        enabled: mirEnabled,
        waypoints: waypoints,
        uploadedFile: waypoints.length > 0 ? {
          name: `${voyageName.replace(/\s+/g, '_')}_waypoints.json`,
          type: 'json' as const,
          uploadedAt: new Date().toISOString()
        } : undefined
      }
    };

    console.log('Generated Voyage Configuration:', JSON.stringify(voyageConfig, null, 2));
    toast.success('Voyage created successfully!');
    navigate('/routes');
  };

  const downloadSampleJSON = () => {
    const blob = new Blob([JSON.stringify(sampleVoyageJSON, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_voyage_configuration.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Sample JSON downloaded');
  };

  const handleWaypointClick = (waypoint: WaypointData) => {
    setSelectedWaypoint(waypoint);
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


  return (
    <div className="flex h-screen bg-background">
      {/* Left Panel - Configuration */}
      <VoyageConfigPanel 
        voyageName={voyageName}
        setVoyageName={setVoyageName}
        vesselName={vesselName}
        setVesselName={setVesselName}
        waypoints={waypoints}
        onWaypointsChange={setWaypoints}
        onGenerateVoyage={handleCreateVoyage}
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
        />
      </div>
    </div>
  );
};

export default CreateVoyage;