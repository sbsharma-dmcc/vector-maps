/**
 * ROUTE STATS COMPONENT
 * 
 * This component displays route statistics and comparison data including:
 * - Date/time information for departure and arrival
 * - Comparison table between base route and weather-optimized route
 * - Cost analysis (fuel, hire, total estimated costs)
 * - Link to more detailed information
 * 
 * The stats show both the original planned values and optimized values
 * with color coding to indicate improvements (green) or increases (red).
 */

import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';

const RouteStats: React.FC = () => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Mock route data for the dialog
  const mockRoute = {
    id: 'RT-005',
    name: 'Route to Hamburg'
  };

  // Mock waypoints data
  const mockWaypoints = [
    {
      name: 'Start Port',
      coordinates: [-74.006, 40.7128],
      isLocked: false,
      weatherWarning: null,
      eta: '2025-07-23T11:50:00Z'
    },
    {
      name: 'Waypoint 1',
      coordinates: [-70.2568, 43.6532],
      isLocked: true,
      weatherWarning: 'High winds expected',
      eta: '2025-07-24T08:30:00Z'
    },
    {
      name: 'Hamburg Port',
      coordinates: [9.9937, 53.5511],
      isLocked: false,
      weatherWarning: null,
      eta: '2025-07-25T08:49:00Z'
    }
  ];

  const handleDownloadRTZ = () => {
    console.log('Downloading RTZ file...');
  };

  return (
    <div className="p-4">
      {/* DATE/TIME CARDS - Departure and arrival information */}
      <div className="grid grid-cols-2 gap-4">
        {/* Departure card */}
        <div className="bg-white p-4 rounded">
          <div className="flex flex-col items-center">
            <p className="text-sm text-gray-500">21st May 25</p>      {/* Departure date */}
            <p className="font-medium">11:50 UTC</p>                  {/* Departure time */}
          </div>
        </div>
        
        {/* Arrival card - Green color indicates this is the optimized/improved time */}
        <div className="bg-white p-4 rounded">
          <div className="flex flex-col items-center">
            <p className="text-sm text-green-500">21st May 25</p>     {/* Arrival date */}
            <p className="font-medium text-green-500">08:49 UTC</p>   {/* Arrival time */}
          </div>
        </div>
      </div>
      
      {/* COMPARISON TABLE - Base route vs Weather-optimized route */}
      <div className="mt-4">
        <div className="bg-white rounded">
          {/* Total Distance Row - Red indicates increase in distance */}
          <div className="grid grid-cols-2 border-b">
            <div className="p-4 border-r">
              <p className="text-sm text-gray-500">Total Distance</p>
              <p className="font-medium">1,342 nm</p>              {/* Base route distance */}
            </div>
            <div className="p-4 flex">
              <p className="font-medium text-red-500">1,351 nm</p> {/* Weather route (longer) */}
            </div>
          </div>
          
          {/* Fuel Consumption Row - Green indicates fuel savings */}
          <div className="grid grid-cols-2 border-b">
            <div className="p-4 border-r">
              <p className="text-sm text-gray-500">Total Consumption</p>
              <p className="font-medium">154 mt</p>               {/* Base consumption */}
            </div>
            <div className="p-4">
              <p className="font-medium text-green-500">151 mt</p> {/* Weather route (less fuel) */}
            </div>
          </div>
          
          {/* Fuel Cost Row - Currently showing $0 (placeholder) */}
          <div className="grid grid-cols-2 border-b">
            <div className="p-4 border-r">
              <p className="text-sm text-gray-500">Fuel Cost</p>
              <p className="font-medium">$0</p>                   {/* Base fuel cost */}
            </div>
            <div className="p-4">
              <p className="font-medium">$0</p>                   {/* Weather route fuel cost */}
            </div>
          </div>
          
          {/* Hire Cost Row - Vessel hire/charter costs */}
          <div className="grid grid-cols-2 border-b">
            <div className="p-4 border-r">
              <p className="text-sm text-gray-500">Hire Cost</p>
              <p className="font-medium">$0</p>                   {/* Base hire cost */}
            </div>
            <div className="p-4">
              <p className="font-medium">$0</p>                   {/* Weather route hire cost */}
            </div>
          </div>
          
          {/* Total Estimated Cost Row - Sum of all costs */}
          <div className="grid grid-cols-2">
            <div className="p-4 border-r">
              <p className="text-sm text-gray-500">Total Est. Cost</p>
              <p className="font-medium">$0</p>                   {/* Base total cost */}
            </div>
            <div className="p-4">
              <p className="font-medium">$0</p>                   {/* Weather route total cost */}
            </div>
          </div>
        </div>
      </div>
      
      {/* MORE DETAILS BUTTON - Links to detailed route information */}
      <div className="mt-4">
        <Button 
          variant="ghost" 
          className="w-full justify-between bg-white hover:bg-gray-50 py-6"
          onClick={() => setIsDetailsOpen(true)}
        >
          <div className="flex items-center">
            <div className="font-medium">More Details</div>
            <div className="text-sm text-gray-500 ml-2">Route ID, Weather, Waypoints etc...</div>
          </div>
          <ChevronRight className="h-5 w-5" />    {/* Right arrow indicator */}
        </Button>
      </div>

      {/* Route Details Sheet */}
      <Sheet open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <SheetContent side="right" className="w-96 overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center justify-between">
              <span className="text-xl font-bold">Route#{mockRoute.id.split('-')[1]}</span>
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-6 mt-6">
            {/* Status and Cost Header */}
            <div className="flex items-center justify-between">
              <Badge className="bg-orange-500 text-white px-3 py-1">
                Pending
              </Badge>
              <div className="text-right">
                <div className="text-2xl font-bold">$0</div>
                <div className="text-sm text-gray-500">Total Est. Cost</div>
              </div>
            </div>

            {/* Separator */}
            <div className="border-t border-dashed border-gray-300"></div>

            {/* Destination */}
            <div className="text-left">
              <div className="text-gray-500 text-sm mb-1">
                51° 56' 14" N, 4° 11' 14" E →
              </div>
              <div className="text-xl font-semibold text-gray-700">Ventspils</div>
            </div>

            {/* Mail Button */}
            <Button className="w-full bg-blue-100 text-blue-600 hover:bg-blue-200 border border-blue-200">
              Mail me
            </Button>

            {/* Route Information */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Optimised for</span>
                <span className="font-semibold">Weather Routing</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Current Position</span>
                <span className="font-semibold">26°8'32" N 15°22'17" W</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Remaining Time to go</span>
                <span className="font-semibold">4d 2hr 17min</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Avg. Speed Over Ground</span>
                <span className="font-semibold">9.8 Kt</span>
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total ECA Fuel Cost</span>
                <span className="font-semibold">$0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Non ECA Fuel Cost</span>
                <span className="font-semibold">$0</span>
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
                    <div className="absolute left-2 top-2 text-xs text-gray-600">20</div>
                    <div className="absolute left-2 top-8 text-xs text-gray-600">15</div>
                    <div className="absolute left-2 top-16 text-xs text-gray-600">10</div>
                    <div className="absolute left-2 top-24 text-xs text-gray-600">5</div>
                    <div className="absolute left-2 bottom-2 text-xs text-gray-600">0</div>
                    
                    {/* Chart line */}
                    <svg className="absolute inset-0 w-full h-full">
                      <polyline
                        fill="none"
                        stroke="#2563eb"
                        strokeWidth="2"
                        points="40,20 60,15 80,25 100,20 120,10 140,15 160,8 180,12 200,18 220,15 240,10 260,12"
                      />
                    </svg>
                    
                    {/* X-axis labels */}
                    <div className="absolute bottom-1 left-8 text-xs text-gray-600">Jul 16</div>
                    <div className="absolute bottom-1 center text-xs text-gray-600">Jul 17</div>
                    <div className="absolute bottom-1 right-8 text-xs text-gray-600">Jul 19</div>
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
                    {mockWaypoints.map((waypoint, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-3 font-medium">{index + 1}</td>
                        <td className="py-3 text-sm text-gray-600">{waypoint.eta}</td>
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
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default RouteStats;