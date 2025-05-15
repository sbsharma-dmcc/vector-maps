
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Map, Navigation, ChevronRight } from 'lucide-react';
import MapboxMap from '../components/MapboxMap';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { generateMockRoutes, generateMockVessels, Route } from '@/lib/vessel-data';

const RouteDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [route, setRoute] = useState<Route | null>(null);
  const [activeTab, setActiveTab] = useState<'base' | 'weather'>('base');
  
  useEffect(() => {
    // In a real app, we would fetch the specific route
    // For now, we'll generate mock data and find the route by ID
    const mockVessels = generateMockVessels(15);
    const mockRoutes = generateMockRoutes(mockVessels);
    const foundRoute = mockRoutes.find(route => route.id === id);
    
    if (foundRoute) {
      setRoute(foundRoute);
    }
  }, [id]);

  if (!route) {
    return (
      <div className="p-8 flex justify-center items-center h-full">
        <p>Loading route details...</p>
      </div>
    );
  }

  // Create mock route coordinates
  // In a real app, these would come from the backend
  const baseRouteCoordinates: [number, number][] = [
    [121.08295, 29.52432], // Start point (from the example image)
    [124.08295, 32.52432], 
    [127.08295, 35.52432],
    [130.08295, 38.52432],
    [133.08295, 42.52432],
    [135.08295, 45.52432], // End point
  ];

  const weatherRouteCoordinates: [number, number][] = [
    [121.08295, 29.52432], // Same start point
    [125.08295, 33.52432], 
    [128.08295, 37.52432],
    [131.08295, 40.52432],
    [133.08295, 43.52432],
    [135.08295, 45.52432], // Same end point
  ];

  const routeVessel = {
    id: route.vesselId,
    name: route.name,
    type: 'green' as const,
    position: [baseRouteCoordinates[0][0], baseRouteCoordinates[0][1]] as [number, number]
  };

  // For the timeline dates
  const today = new Date();
  const days = Array.from({ length: 5 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    return {
      day: i === 0 ? 'Today' : new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date),
      date: date.getDate(),
      active: i === 0
    };
  });

  return (
    <div className="absolute inset-0 flex flex-col">
      {/* Header */}
      <div className="bg-[#0c1c3d] text-white p-4">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white mr-2" 
            onClick={() => navigate('/routes')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <div>
            <h1 className="text-xl font-semibold flex items-center">
              {route.name}
              <span className="bg-green-500 text-xs font-medium ml-2 px-2 py-0.5 rounded">
                Loaded
              </span>
            </h1>
            <div className="flex text-sm text-gray-300">
              <span>29° 52' 43.2" N</span>
              <span className="mx-2">•</span>
              <span>Chiba</span>
            </div>
            <div className="text-sm text-gray-300">
              <span>121° 08' 29.5" E</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 mt-4">
          <div className="border-r border-gray-700 pr-4">
            <p className="text-xs text-gray-400">Voyage ID</p>
            <p className="font-bold">#{id}</p>
          </div>
          <div className="border-r border-gray-700 pr-4">
            <p className="text-xs text-gray-400">Start Date</p>
            <p className="font-bold">15th May 25</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Time</p>
            <p className="font-bold">07:40 UTC</p>
          </div>

          <div className="border-r border-gray-700 pr-4">
            <p className="text-xs text-gray-400">Hire Rate</p>
            <p className="font-bold">$0</p>
          </div>
          <div className="border-r border-gray-700 pr-4">
            <p className="text-xs text-gray-400">Fuel Price</p>
            <p className="font-bold">$0</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Planned Speed</p>
            <p className="font-bold">10kt - 12kt</p>
          </div>
        </div>
      </div>

      {/* Sidebar and Map */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-96 bg-gray-100 overflow-y-auto">
          <div className="bg-white">
            <div className="flex">
              <Button 
                variant="ghost" 
                className={`flex-1 rounded-none py-6 ${activeTab === 'base' ? 'bg-gray-100' : ''}`}
                onClick={() => setActiveTab('base')}
              >
                <span>Base Route</span>
              </Button>
              <Button 
                variant="ghost" 
                className={`flex-1 rounded-none py-6 ${activeTab === 'weather' ? 'bg-gray-100' : ''}`}
                onClick={() => setActiveTab('weather')}
              >
                <span>Weather Routing</span>
              </Button>
            </div>
          </div>
          
          <div className="p-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded">
                <div className="flex flex-col items-center">
                  <p className="text-sm text-gray-500">21st May 25</p>
                  <p className="font-medium">11:50 UTC</p>
                </div>
              </div>
              <div className="bg-white p-4 rounded">
                <div className="flex flex-col items-center">
                  <p className="text-sm text-green-500">21st May 25</p>
                  <p className="font-medium text-green-500">08:49 UTC</p>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <div className="bg-white rounded">
                <div className="grid grid-cols-2 border-b">
                  <div className="p-4 border-r">
                    <p className="text-sm text-gray-500">Total Distance</p>
                    <p className="font-medium">1,342 nm</p>
                  </div>
                  <div className="p-4 flex">
                    <p className="font-medium text-red-500">1,351 nm</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 border-b">
                  <div className="p-4 border-r">
                    <p className="text-sm text-gray-500">Total Consumption</p>
                    <p className="font-medium">154 mt</p>
                  </div>
                  <div className="p-4">
                    <p className="font-medium text-green-500">151 mt</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 border-b">
                  <div className="p-4 border-r">
                    <p className="text-sm text-gray-500">Fuel Cost</p>
                    <p className="font-medium">$0</p>
                  </div>
                  <div className="p-4">
                    <p className="font-medium">$0</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 border-b">
                  <div className="p-4 border-r">
                    <p className="text-sm text-gray-500">Hire Cost</p>
                    <p className="font-medium">$0</p>
                  </div>
                  <div className="p-4">
                    <p className="font-medium">$0</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2">
                  <div className="p-4 border-r">
                    <p className="text-sm text-gray-500">Total Est. Cost</p>
                    <p className="font-medium">$0</p>
                  </div>
                  <div className="p-4">
                    <p className="font-medium">$0</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <Button 
                variant="ghost" 
                className="w-full justify-between bg-white hover:bg-gray-50 py-6"
              >
                <div className="flex items-center">
                  <div className="font-medium">More Details</div>
                  <div className="text-sm text-gray-500 ml-2">Route ID, Weather, Waypoints etc...</div>
                </div>
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Map Container */}
        <div className="flex-1 relative">
          {/* Customize MapboxMap to handle routes */}
          <MapboxMap 
            vessels={[routeVessel]} 
            showRoutes={true}
            baseRoute={baseRouteCoordinates}
            weatherRoute={weatherRouteCoordinates}
            activeRouteType={activeTab}
          />
          
          {/* Timeline Navigation */}
          <div className="absolute bottom-0 left-0 right-0 bg-gray-800 bg-opacity-80 text-white">
            <div className="flex overflow-x-auto">
              {days.map((day, index) => (
                <div 
                  key={index} 
                  className={`flex-1 p-4 text-center cursor-pointer border-t-2 ${
                    day.active ? 'bg-gray-900 border-blue-500' : 'border-transparent'
                  }`}
                >
                  <div className="text-sm">{day.date} {day.day}</div>
                </div>
              ))}
              <div className="p-4 flex items-center justify-center cursor-pointer">
                <ChevronRight className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteDetail;
