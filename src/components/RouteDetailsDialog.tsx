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
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold">Route#{route.id.split('-')[1]}</span>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              ✕
            </button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Cost Header */}
          <div className="flex items-center justify-between">
            <Badge className="bg-blue-500 text-white px-3 py-1">
              Approved
            </Badge>
            <div className="text-right">
              <div className="text-2xl font-bold">$0</div>
              <div className="text-sm text-gray-500">Total Est. Cost</div>
            </div>
          </div>

          {/* Separator */}
          <div className="border-t border-dashed border-gray-300"></div>

          {/* Destination */}
          <div className="text-center">
            <div className="text-gray-500 text-sm mb-1">
              25° 41' 27.0" N, 53° 27' 14.0" W →
            </div>
            <div className="text-xl font-semibold text-gray-700">Abidjan</div>
          </div>

          {/* Mail Button */}
          <Button className="w-full bg-blue-100 text-blue-600 hover:bg-blue-200 border border-blue-200">
            Mail me
          </Button>

          {/* Cost Breakdown */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">ECA Fuel Cost to go</span>
              <span className="font-semibold">$ 0.00</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Non ECA Fuel Cost to go</span>
              <span className="font-semibold">$ 0.00</span>
            </div>
          </div>

          {/* Separator */}
          <div className="border-t border-dashed border-gray-300"></div>

          {/* Weather Section */}
          <div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Weather</h3>
              <p className="text-sm text-gray-500">For next nine days</p>
            </div>
            
            {/* Weather Tabs */}
            <div className="mb-4">
              <div className="flex gap-1 text-center text-sm border-b border-gray-200">
                <div className="px-4 py-2 bg-blue-100 text-blue-600 font-medium rounded-t border-b-2 border-blue-500">Wind</div>
                <div className="px-4 py-2 text-gray-500 hover:text-gray-700 cursor-pointer">Wave</div>
                <div className="px-4 py-2 text-gray-500 hover:text-gray-700 cursor-pointer">Swell</div>
                <div className="px-4 py-2 text-gray-500 hover:text-gray-700 cursor-pointer">Current</div>
              </div>
              
              {/* Wind Chart */}
              <div className="bg-blue-50 p-4 rounded-b">
                <div className="h-32 relative bg-gradient-to-t from-blue-200 to-blue-100 rounded">
                  {/* Y-axis labels */}
                  <div className="absolute left-2 top-2 text-xs text-gray-600">16</div>
                  <div className="absolute left-2 top-8 text-xs text-gray-600">12</div>
                  <div className="absolute left-2 top-16 text-xs text-gray-600">8</div>
                  <div className="absolute left-2 top-24 text-xs text-gray-600">4</div>
                  <div className="absolute left-2 bottom-2 text-xs text-gray-600">0</div>
                  
                  {/* Chart line */}
                  <svg className="absolute inset-0 w-full h-full">
                    <polyline
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="2"
                      points="40,20 80,25 120,30 160,40 200,35 240,45 280,40"
                    />
                  </svg>
                  
                  {/* X-axis labels */}
                  <div className="absolute bottom-1 left-12 text-xs text-gray-600">Jul 23</div>
                  <div className="absolute bottom-1 right-12 text-xs text-gray-600">Jul 24</div>
                </div>
                <div className="mt-2 text-xs text-gray-600">
                  <span className="mr-4">Wind Speed (Knots)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Separator */}
          <div className="border-t border-dashed border-gray-300"></div>

          {/* Waypoints Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Waypoints</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Showing Only 10 Waypoints</span>
                <button className="text-blue-600 hover:underline text-sm font-medium">
                  See all
                </button>
              </div>
            </div>
            
            {/* Waypoints Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-gray-600">
                    <th className="pb-2 font-medium">Waypoints ⟷</th>
                    <th className="pb-2 font-medium">ETA (UTC) ⟷</th>
                    <th className="pb-2 w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 font-medium">1</td>
                    <td className="py-3 text-sm text-gray-600">2025-07-23T06:30:00Z</td>
                    <td className="py-3">
                      <button className="text-gray-400 hover:text-gray-600">
                        <span className="text-lg">⋮</span>
                      </button>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 font-medium">X</td>
                    <td className="py-3 text-sm text-gray-600">2025-07-23T12:30:00Z</td>
                    <td className="py-3">
                      <button className="text-gray-400 hover:text-gray-600">
                        <span className="text-lg">⋮</span>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RouteDetailsDialog;