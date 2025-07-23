import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import VoyageConfigPanel from '@/components/VoyageCreation/VoyageConfigPanel';
import VoyageMapInterface from '@/components/VoyageCreation/VoyageMapInterface';
import { WaypointData } from '@/components/VoyageCreation/VoyageDataTable';
import { sampleVoyageJSON } from '@/components/VoyageCreation/VoyageJSON';

const CreateVoyage = () => {
  const navigate = useNavigate();
  const [waypoints, setWaypoints] = useState<WaypointData[]>([]);
  const [mapboxToken, setMapboxToken] = useState('');
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
      />
      
      {/* Right Panel - Map Interface */}
      <VoyageMapInterface 
        mapboxToken={mapboxToken}
        waypoints={waypoints}
      />

      {/* Mapbox Token Input Dialog (if no token) */}
      {!mapboxToken && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-background border border-border rounded-lg p-4 shadow-lg max-w-md">
            <Label htmlFor="mapbox-token" className="text-sm font-medium">
              Mapbox Token Required
            </Label>
            <Input
              id="mapbox-token"
              type="password"
              placeholder="Enter your Mapbox public token"
              value={mapboxToken}
              onChange={(e) => setMapboxToken(e.target.value)}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Get your token from <a href="https://mapbox.com/" target="_blank" rel="noopener noreferrer" className="text-primary underline">mapbox.com</a>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateVoyage;