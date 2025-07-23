import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Lock, CheckCircle, Save, Download } from 'lucide-react';
import VoyageMapInterface from '@/components/VoyageCreation/VoyageMapInterface';
import { WaypointData } from '@/types/voyage';

const ModifyVoyage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [waypoints, setWaypoints] = useState<WaypointData[]>([]);
  const [selectedWaypoint, setSelectedWaypoint] = useState<WaypointData | null>(null);

  // Mock mapbox token - in real app, this should come from environment
  const mapboxToken = 'your-mapbox-token';

  // Initialize with mock voyage data
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
  }, [id]);

  const handleWaypointsChange = (newWaypoints: WaypointData[]) => {
    setWaypoints(newWaypoints);
  };

  const handleWaypointClick = (waypoint: WaypointData) => {
    setSelectedWaypoint(waypoint);
  };

  const handleSaveVoyage = () => {
    // Implement save logic
    console.log('Saving voyage with waypoints:', waypoints);
    navigate(`/routes/${id}`);
  };

  const handleDownloadRTZ = () => {
    // Implement RTZ download logic
    console.log('Downloading RTZ file');
  };

  const getWaypointStatusColor = (waypoint: WaypointData) => {
    if (waypoint.isPassed) return 'bg-green-500';
    if (waypoint.isLocked) return 'bg-orange-500';
    return 'bg-blue-500';
  };

  const getWaypointStatusText = (waypoint: WaypointData) => {
    if (waypoint.isPassed) return 'Passed';
    if (waypoint.isLocked) return 'Locked';
    return 'Unlocked';
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="bg-background border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/routes/${id}`)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Route
            </Button>
            <div>
              <h1 className="text-xl font-semibold">Modify Voyage - Route #{id?.split('-')[1]}</h1>
              <p className="text-sm text-muted-foreground">Edit waypoints and route configuration</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleDownloadRTZ}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download RTZ
            </Button>
            <Button
              onClick={handleSaveVoyage}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Left Panel - Waypoints List */}
        <div className="w-80 bg-background border-r border-border p-4 overflow-y-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <span>Waypoints</span>
                <span className="text-sm font-normal text-muted-foreground">
                  {waypoints.length} points
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {waypoints.map((waypoint) => (
                  <div
                    key={waypoint.id}
                    className={`
                      p-3 border rounded-lg cursor-pointer transition-colors
                      ${selectedWaypoint?.id === waypoint.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-border hover:bg-muted/50'
                      }
                    `}
                    onClick={() => handleWaypointClick(waypoint)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full ${getWaypointStatusColor(waypoint)}`}
                        />
                        <span className="font-medium text-sm">
                          {waypoint.name || `WP${waypoint.waypointNumber}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {waypoint.isPassed && <CheckCircle className="w-4 h-4 text-green-500" />}
                        {waypoint.isLocked && <Lock className="w-4 h-4 text-orange-500" />}
                      </div>
                    </div>
                    
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div>{waypoint.lat.toFixed(6)}, {waypoint.lon.toFixed(6)}</div>
                      {waypoint.eta && (
                        <div>ETA: {new Date(waypoint.eta).toLocaleString()}</div>
                      )}
                    </div>
                    
                    <Badge
                      variant={waypoint.isPassed ? 'default' : waypoint.isLocked ? 'secondary' : 'outline'}
                      className="mt-2 text-xs"
                    >
                      {getWaypointStatusText(waypoint)}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Map */}
        <div className="flex-1 relative">
          <VoyageMapInterface
            mapboxToken={mapboxToken}
            waypoints={waypoints}
            onWaypointsChange={handleWaypointsChange}
            onWaypointClick={handleWaypointClick}
            zoomToWaypoint={selectedWaypoint}
          />
          
          {/* Current vessel position indicator */}
          <div className="absolute top-4 left-4 bg-background/95 backdrop-blur-sm rounded-lg shadow-lg p-3 z-10">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <span className="font-medium">Current Position</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {waypoints.find(wp => wp.isPassed)?.lat.toFixed(6)}, {waypoints.find(wp => wp.isPassed)?.lon.toFixed(6)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModifyVoyage;