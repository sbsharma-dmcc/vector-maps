import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import VoyageMapInterface from '@/components/VoyageCreation/VoyageMapInterface';
import WaypointsBottomPanel from '@/components/VoyageCreation/WaypointsBottomPanel';
import { WaypointData } from '@/types/voyage';
import { sampleVoyageJSON } from '@/components/VoyageCreation/VoyageJSON';
import { ArrowLeft, Ship, Calendar, MapPin } from 'lucide-react';

const CreateVoyageAlt = () => {
  const navigate = useNavigate();
  const [waypoints, setWaypoints] = useState<WaypointData[]>([]);
  const [mapboxToken] = useState('pk.eyJ1IjoiZ2Vvc2VydmUiLCJhIjoiY201Z2J3dXBpMDU2NjJpczRhbmJubWtxMCJ9.6Kw-zTqoQcNdDokBgbI5_Q');
  const [voyageName, setVoyageName] = useState('');
  const [vesselName, setVesselName] = useState('');
  const [departurePort, setDeparturePort] = useState('');
  const [arrivalPort, setArrivalPort] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [mirEnabled, setMirEnabled] = useState(true);
  
  const [selectedWaypoint, setSelectedWaypoint] = useState<WaypointData | null>(null);
  const [isPanelMinimized, setIsPanelMinimized] = useState(false);

  const handleWaypointsChange = (newWaypoints: WaypointData[]) => {
    setWaypoints(newWaypoints);
  };

  const handleWaypointClick = (waypoint: WaypointData) => {
    setSelectedWaypoint(waypoint);
    setIsPanelMinimized(false);
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
      .map((wp, index) => ({ ...wp, waypointNumber: index + 1 }));
    
    setWaypoints(updatedWaypoints);
    toast.success(`Waypoint ${waypoint.waypointNumber} deleted`);
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

    if (waypoints.length === 0) {
      toast.error('Please add waypoints before creating voyage');
      return;
    }

    try {
      const voyageConfig = {
        ...sampleVoyageJSON,
        id: `voyage_${Date.now()}`,
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
        },
        ports: {
          departure: departurePort,
          arrival: arrivalPort
        },
        schedule: {
          departureDate: departureDate
        },
        createdAt: new Date().toISOString(),
        status: 'active',
        progress: {
          currentWaypoint: 0,
          totalWaypoints: waypoints.length,
          estimatedArrival: waypoints[waypoints.length - 1]?.eta || null
        }
      };

      const existingVoyages = JSON.parse(localStorage.getItem('voyages') || '[]');
      existingVoyages.push(voyageConfig);
      localStorage.setItem('voyages', JSON.stringify(existingVoyages));

      console.log('Generated Voyage Configuration:', JSON.stringify(voyageConfig, null, 2));
      toast.success(`Voyage "${voyageName}" created successfully with ${waypoints.length} waypoints!`);
      
      setTimeout(() => {
        navigate('/routes');
      }, 1500);
    } catch (error) {
      console.error('Error creating voyage:', error);
      toast.error('Failed to create voyage. Please try again.');
    }
  };

  return (
    <div className="h-screen flex bg-background">
      {/* Left Panel - Alternative UI Layout */}
      <div className="w-96 bg-background border-r border-border flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border bg-card">
          <div className="flex items-center gap-3 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/routes')}
              className="p-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2">
              <Ship className="w-5 h-5 text-primary" />
              <h1 className="text-lg font-semibold">Create New Voyage</h1>
            </div>
          </div>
        </div>

        {/* Voyage Configuration Form */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Ship className="w-4 h-4" />
                Voyage Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="voyage-name" className="text-xs font-medium">Voyage Name</Label>
                <Input
                  id="voyage-name"
                  value={voyageName}
                  onChange={(e) => setVoyageName(e.target.value)}
                  placeholder="Enter voyage name"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="vessel-name" className="text-xs font-medium">Vessel Name</Label>
                <Input
                  id="vessel-name"
                  value={vesselName}
                  onChange={(e) => setVesselName(e.target.value)}
                  placeholder="Enter vessel name"
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Route Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="departure-port" className="text-xs font-medium">Departure Port</Label>
                <Input
                  id="departure-port"
                  value={departurePort}
                  onChange={(e) => setDeparturePort(e.target.value)}
                  placeholder="Enter departure port"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="arrival-port" className="text-xs font-medium">Arrival Port</Label>
                <Input
                  id="arrival-port"
                  value={arrivalPort}
                  onChange={(e) => setArrivalPort(e.target.value)}
                  placeholder="Enter arrival port"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="departure-date" className="text-xs font-medium">Departure Date</Label>
                <Input
                  id="departure-date"
                  type="datetime-local"
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Waypoints Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                {waypoints.length === 0 ? (
                  "No waypoints added yet. Click on the map to add waypoints."
                ) : (
                  `${waypoints.length} waypoint${waypoints.length !== 1 ? 's' : ''} configured`
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Create Button */}
        <div className="p-4 border-t border-border">
          <Button
            onClick={handleCreateVoyage}
            className="w-full"
            disabled={!voyageName.trim() || !vesselName.trim() || waypoints.length === 0}
          >
            Create Voyage
          </Button>
        </div>
      </div>
      
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

export default CreateVoyageAlt;