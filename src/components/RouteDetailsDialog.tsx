import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Route, Calendar, MapPin, Lock, AlertTriangle } from 'lucide-react';
import WarningsPanel from './WarningsPanel';

interface RouteDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  route: any;
  activeTab: 'base' | 'weather';
  waypoints: any[];
  onDownloadRTZ: () => void;
}

const RouteDetailsDialog = ({ isOpen, onClose, route, activeTab, waypoints, onDownloadRTZ }: RouteDetailsDialogProps) => {
  if (!route) return null;

  const formatPosition = (coordinates: [number, number]) => {
    const [lng, lat] = coordinates;
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  };

  // Generate warnings from waypoints
  const warnings = waypoints
    .filter(wp => wp.weatherWarning)
    .map((wp, index) => ({
      id: `warning-${index}`,
      waypointName: wp.name || `Waypoint ${index + 1}`,
      message: wp.weatherWarning,
      severity: 'medium' as const,
      type: 'weather' as const
    }));

  const routeStats = {
    base: {
      eta: '9th Aug 25 09:09 UTC',
      speed: '9.3 kt',
      distance: '5,774 nm',
      consumption: '641 mt',
      cost: '$0'
    },
    weather: {
      eta: '8th Aug 25 05:21 UTC',
      speed: '9.9 kt',
      distance: '5,928 nm',
      consumption: '612 mt',
      cost: '$0'
    }
  };

  const currentStats = routeStats[activeTab];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Route className="w-5 h-5" />
              <span>Route #{route.id.split('-')[1]} - {route.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-orange-100 text-orange-700">
                Pending
              </Badge>
              <span className="text-lg font-bold">$0</span>
              <span className="text-sm text-muted-foreground">Total Est. Cost</span>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Route Information */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Route Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Current Position</span>
                  <span>{formatPosition([waypoints[0]?.coordinates[0] || 0, waypoints[0]?.coordinates[1] || 0])}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Optimised for</span>
                  <span>{activeTab === 'weather' ? 'Weather Routing' : 'Base Route'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Remaining Time</span>
                  <span>24d 20hr 20min</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Avg. Speed Over Ground</span>
                  <span>{currentStats.speed}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Distance</span>
                  <span>{currentStats.distance}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Fuel Consumption</span>
                  <span>{currentStats.consumption}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Route Comparison */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Route Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="base">Base Route</TabsTrigger>
                  <TabsTrigger value="weather">Weather Routing</TabsTrigger>
                </TabsList>
                
                <div className="mt-4 grid grid-cols-5 gap-4">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-1">ETA</div>
                    <div className="font-semibold">{currentStats.eta}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-1">Avg. SOG</div>
                    <div className="font-semibold">{currentStats.speed}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-1">Total Distance</div>
                    <div className="font-semibold">{currentStats.distance}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-1">Total Consumption</div>
                    <div className="font-semibold">{currentStats.consumption}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-1">Fuel Cost</div>
                    <div className="font-semibold">{currentStats.cost}</div>
                  </div>
                </div>
              </Tabs>
            </CardContent>
          </Card>

          {/* Waypoints */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <span>Waypoints</span>
                <span className="text-sm font-normal text-muted-foreground">
                  Showing {waypoints.length} Waypoints
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {waypoints.map((waypoint, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span className="font-medium">{waypoint.name}</span>
                      </div>
                      {waypoint.isLocked && (
                        <Lock className="w-4 h-4 text-orange-500" />
                      )}
                      {waypoint.weatherWarning && (
                        <div className="flex items-center gap-1">
                          <AlertTriangle className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm text-yellow-600">{waypoint.weatherWarning}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatPosition(waypoint.coordinates)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Route Warnings */}
          {warnings.length > 0 && (
            <WarningsPanel 
              warnings={warnings} 
              position="sidebar"
              className="bg-orange-50 border-orange-200"
            />
          )}

          {/* Weather Chart Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Weather</CardTitle>
              <p className="text-sm text-muted-foreground">For next nine days</p>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="flex gap-4 text-center text-sm border-b">
                  <div className="px-4 py-2 bg-blue-100 text-blue-800 font-medium rounded-t">Wind</div>
                  <div className="px-4 py-2 text-gray-600">Wave</div>
                  <div className="px-4 py-2 text-gray-600">Swell</div>
                  <div className="px-4 py-2 text-gray-600">Current</div>
                </div>
                
                {/* Wind Chart */}
                <div className="p-4 bg-blue-50">
                  <div className="h-32 bg-gradient-to-r from-blue-200 to-blue-300 rounded relative">
                    <div className="absolute bottom-0 left-0 w-full h-20 bg-blue-400 rounded-b"></div>
                    <div className="absolute top-4 left-4 text-xs text-blue-800">16</div>
                    <div className="absolute top-8 left-4 text-xs text-blue-800">12</div>
                    <div className="absolute top-12 left-4 text-xs text-blue-800">8</div>
                    <div className="absolute top-16 left-4 text-xs text-blue-800">4</div>
                    <div className="absolute bottom-0 left-4 text-xs text-blue-800">0</div>
                    <div className="absolute bottom-2 left-8 text-xs text-blue-800">Jul 23</div>
                    <div className="absolute bottom-2 right-8 text-xs text-blue-800">Jul 24</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Waypoints Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <span>Waypoints</span>
                <span className="text-sm font-normal text-muted-foreground">
                  Showing Only 10 Waypoints <button className="text-blue-600 hover:underline ml-2">See all</button>
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left text-sm text-gray-600">
                      <th className="pb-2">Waypoints</th>
                      <th className="pb-2">ETA (UTC)</th>
                      <th className="pb-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {waypoints.slice(0, 10).map((waypoint, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-3 flex items-center gap-2">
                          <span className="font-medium">{index + 1}</span>
                          {waypoint.isLocked && (
                            <Lock className="w-4 h-4 text-orange-500" />
                          )}
                        </td>
                        <td className="py-3 text-sm text-gray-600">
                          {waypoint.eta || '2025-07-23T06:30:00Z'}
                        </td>
                        <td className="py-3">
                          <button className="text-gray-400 hover:text-gray-600">
                            <span className="text-lg">⋮</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3">
            <Button 
              onClick={onDownloadRTZ}
              className="flex items-center gap-2"
              variant="default"
            >
              <Download className="w-4 h-4" />
              Download RTZ File
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RouteDetailsDialog;