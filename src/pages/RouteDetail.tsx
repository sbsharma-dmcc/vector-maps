import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Map, Navigation, ChevronRight, Layers, Search, Plus, Bell } from 'lucide-react';
import MapboxMap from '../components/MapboxMap';
import { Button } from '@/components/ui/button';
import { generateMockRoutes, generateMockVessels, Route } from '@/lib/vessel-data';
import { useToast } from '@/hooks/use-toast';

const RouteDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [route, setRoute] = useState<Route | null>(null);
  const [activeTab, setActiveTab] = useState<'base' | 'weather'>('base');
  const [vesselPosition, setVesselPosition] = useState<[number, number] | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<number | null>(null);
  const { toast } = useToast();
  
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

  // Initialize vessel position at the start of the route
  useEffect(() => {
    if (!vesselPosition && activeTab === 'base' && baseRouteCoordinates.length > 0) {
      setVesselPosition(baseRouteCoordinates[0]);
    } else if (!vesselPosition && activeTab === 'weather' && weatherRouteCoordinates.length > 0) {
      setVesselPosition(weatherRouteCoordinates[0]);
    }
  }, [activeTab, vesselPosition, baseRouteCoordinates, weatherRouteCoordinates]);

  // Set the active route coordinates based on the active tab
  const activeRouteCoordinates = activeTab === 'base' ? baseRouteCoordinates : weatherRouteCoordinates;
  
  // Cancel any ongoing animation when the component unmounts
  useEffect(() => {
    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Function to animate the vessel along the route
  const animateVessel = (dayIndex: number) => {
    // Stop any previous animation
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
    }

    // Ensure we have a route to animate along
    if (activeRouteCoordinates.length === 0) return;

    setIsAnimating(true);
    
    // Calculate the segment of the route to animate based on the day clicked
    const totalDays = 5; // Number of days in the timeline
    const segmentSize = activeRouteCoordinates.length - 1;
    
    // For day 0, we animate from point 0 to 1/5 of the way
    // For day 1, we animate from 1/5 to 2/5 of the way, etc.
    const startIdx = Math.floor((dayIndex / totalDays) * segmentSize);
    const endIdx = Math.min(Math.floor(((dayIndex + 1) / totalDays) * segmentSize), segmentSize);
    
    // Get the points for this segment
    const segmentPoints = activeRouteCoordinates.slice(startIdx, endIdx + 1);
    
    // If there's only one point in the segment, add the next point
    if (segmentPoints.length === 1 && endIdx < activeRouteCoordinates.length - 1) {
      segmentPoints.push(activeRouteCoordinates[endIdx + 1]);
    }
    
    // Start vessel at the first point of this segment
    setVesselPosition(segmentPoints[0]);
    
    let step = 0;
    const totalSteps = 100; // Number of animation frames
    
    // Animation function
    const animate = () => {
      if (step >= totalSteps) {
        setIsAnimating(false);
        return;
      }
      
      // Calculate position along the segment using linear interpolation
      if (segmentPoints.length >= 2) {
        const progress = step / totalSteps;
        let currentSegmentIndex = Math.min(
          Math.floor(progress * (segmentPoints.length - 1)),
          segmentPoints.length - 2
        );
        
        const segmentProgress = (progress * (segmentPoints.length - 1)) % 1;
        
        const p1 = segmentPoints[currentSegmentIndex];
        const p2 = segmentPoints[currentSegmentIndex + 1];
        
        const newLng = p1[0] + (p2[0] - p1[0]) * segmentProgress;
        const newLat = p1[1] + (p2[1] - p1[1]) * segmentProgress;
        
        setVesselPosition([newLng, newLat]);
      }
      
      step++;
      animationRef.current = requestAnimationFrame(animate);
    };
    
    // Start the animation
    animationRef.current = requestAnimationFrame(animate);
    
    toast({
      title: `Day ${dayIndex === 0 ? "Today" : dayIndex + 1}`,
      description: "Animating vessel journey for this day"
    });
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

  if (!route) {
    return (
      <div className="p-8 flex justify-center items-center h-full">
        <p>Loading route details...</p>
      </div>
    );
  }

  const routeVessel = {
    id: route.vesselId,
    name: route.name,
    type: 'green' as const,
    position: vesselPosition || activeRouteCoordinates[0]
  };

  return (
    <div className="absolute inset-0 flex">
      {/* Left sidebar with header and details */}
      <div className="w-96 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-[#0c1c3d] text-white p-4">
          <div className="flex items-center justify-between mb-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white" 
              onClick={() => navigate('/routes')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" className="text-white">
                <Search className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-white">
                <Bell className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          <div>
            <h1 className="text-xl font-semibold flex items-center">
              {route?.name}
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
        
        {/* Sidebar content */}
        <div className="flex-1 bg-gray-100 overflow-y-auto">
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
      </div>
      
      {/* Map Container - covers the entire right side */}
      <div className="flex-1 relative">
        {/* Top right buttons */}
        <div className="absolute right-4 top-4 z-10 flex space-x-2">
          <Button variant="secondary" className="bg-white shadow-md">
            <Layers className="h-5 w-5 mr-2" />
            Map Layers
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700" size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
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
                } hover:bg-gray-700 transition-colors`}
                onClick={() => animateVessel(index)}
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
  );
};

export default RouteDetail;
