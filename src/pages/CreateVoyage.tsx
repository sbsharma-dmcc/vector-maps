import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import VoyageConfigPanel from '@/components/VoyageCreation/VoyageConfigPanel';
import VoyageMapInterface from '@/components/VoyageCreation/VoyageMapInterface';
import { WaypointData } from '@/types/voyage';
import { sampleVoyageJSON } from '@/components/VoyageCreation/VoyageJSON';

const CreateVoyage = () => {
  const navigate = useNavigate();
  const [waypoints, setWaypoints] = useState<WaypointData[]>([]);
  const [mapboxToken] = useState('pk.eyJ1IjoiZ2Vvc2VydmUiLCJhIjoiY201Z2J3dXBpMDU2NjJpczRhbmJubWtxMCJ9.6Kw-zTqoQcNdDokBgbI5_Q');
  const [voyageName, setVoyageName] = useState('');
  const [vesselName, setVesselName] = useState('');
  const [mirEnabled, setMirEnabled] = useState(true);

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
      <VoyageMapInterface 
        mapboxToken={mapboxToken}
        waypoints={waypoints}
        onWaypointsChange={handleWaypointsChange}
      />

    </div>
  );
};

export default CreateVoyage;