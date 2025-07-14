import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Layers } from 'lucide-react';
import MapboxMap from '../components/MapboxMap';
import MapLayersPanel from '../components/MapLayersPanel';
import RT001MapInterface from '../components/RT001MapInterface';
import CompleteVoyageDialog from '../components/CompleteVoyageDialog';
import VoyageCompletedDialog from '../components/VoyageCompletedDialog';
import RouteHeader from '../components/RouteHeader';
import RouteTabs from '../components/RouteTabs';
import RouteStats from '../components/RouteStats';
import RouteTimeline from '../components/RouteTimeline';
import { Button } from '@/components/ui/button';
import { generateMockRoutes, generateMockVessels, Route } from '@/lib/vessel-data';
import { useToast } from '@/hooks/use-toast';

const RouteDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [route, setRoute] = useState<Route | null>(null);
  const [activeTab, setActiveTab] = useState<'base' | 'weather'>('base');
  const [vesselPosition, setVesselPosition] = useState<[number, number] | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [layersPanelOpen, setLayersPanelOpen] = useState(false);
  const [activeBaseLayer, setActiveBaseLayer] = useState('default');
  const [activeLayers, setActiveLayers] = useState<Record<string, boolean>>({
    pressure: false,
    storm: false,
    current: false,
    wind: false
  });
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);
  const [isCompletedConfirmationOpen, setIsCompletedConfirmationOpen] = useState(false);
  const [voyageStatus, setVoyageStatus] = useState<'active' | 'completed'>('active');
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

  // Route coordinates for visualization
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

  const handleCompleteVoyage = () => {
    setIsCompleteDialogOpen(true);
  };

  const handleModifyVoyage = () => {
    toast({
      title: "Modify Voyage",
      description: "Voyage modification feature will be available soon."
    });
  };

  const handleVoyageCompletion = (comments: string) => {
    console.log('Voyage completed with comments:', comments);
    setVoyageStatus('completed');
    
    // In a real app, you would send this data to your backend
    // Example: completeVoyage({ routeId: id, comments, completedAt: new Date() });
    
    toast({
      title: "Voyage Completed Successfully",
      description: "The voyage has been marked as completed and all data has been saved."
    });

    // Show the confirmation popup
    setIsCompletedConfirmationOpen(true);
  };

  const handleLayerToggle = (layerType: string, enabled: boolean) => {
    console.log(`Layer ${layerType} ${enabled ? 'enabled' : 'disabled'}`);
    
    setActiveLayers(prev => ({
      ...prev,
      [layerType]: enabled
    }));
    
    toast({
      title: `${layerType.charAt(0).toUpperCase() + layerType.slice(1)} Layer`,
      description: `${enabled ? 'Enabled' : 'Disabled'} ${layerType} overlay`
    });
  };

  const handleBaseLayerChange = (layer: string) => {
    setActiveBaseLayer(layer);
    console.log(`Base layer changed to: ${layer}`);
    
    toast({
      title: "Base Layer Changed",
      description: `Switched to ${layer} base layer`
    });
  };

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
    position: vesselPosition || baseRouteCoordinates[0]
  };

  // Check if this is the RT-001 route to show the custom map interface
  const isRT001 = id === 'RT-001';

  return (
    <div className="absolute inset-0 flex">
      {/* Left sidebar with header and details */}
      <div className="w-96 flex flex-col overflow-hidden">
        <RouteHeader 
          route={route}
          routeId={id!}
          voyageStatus={voyageStatus}
          onModifyVoyage={handleModifyVoyage}
          onCompleteVoyage={handleCompleteVoyage}
        />
        
        {/* Sidebar content */}
        <div className="flex-1 bg-gray-100 overflow-y-auto">
          <RouteTabs 
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
          
          <RouteStats />
        </div>
      </div>
      
      {/* Map Container - covers the entire right side */}
      <div className="flex-1 relative">
        {/* Map Layers Panel */}
        <MapLayersPanel
          isOpen={layersPanelOpen}
          onClose={() => setLayersPanelOpen(false)}
          onLayerToggle={handleLayerToggle}
          activeLayer={activeBaseLayer}
          onBaseLayerChange={handleBaseLayerChange}
        />
        
        {/* Conditional rendering based on route ID */}
        {isRT001 ? (
          <RT001MapInterface
            activeTab={activeTab}
            onDayClick={animateVessel}
            onLayersToggle={() => setLayersPanelOpen(!layersPanelOpen)}
            activeLayers={activeLayers}
          />
        ) : (
          <>
            {/* Layers toggle button - positioned in bottom-left corner */}
            <div className="absolute bottom-20 left-4 z-10">
              <Button 
                onClick={() => setLayersPanelOpen(!layersPanelOpen)}
                className="bg-white hover:bg-gray-50 text-gray-800 shadow-lg border border-gray-200 w-12 h-12 p-0"
                size="icon"
              >
                <Layers className="h-5 w-5" />
              </Button>
            </div>
            
            {/* Customize MapboxMap to handle routes and layers */}
            <MapboxMap 
              vessels={[routeVessel]} 
              showRoutes={true}
              baseRoute={baseRouteCoordinates}
              weatherRoute={weatherRouteCoordinates}
              activeRouteType={activeTab}
              activeLayers={activeLayers}
              activeBaseLayer={activeBaseLayer}
            />
            
            <RouteTimeline 
              onDayClick={animateVessel}
              isAnimating={isAnimating}
            />
          </>
        )}
      </div>

      {/* Complete Voyage Dialog */}
      <CompleteVoyageDialog
        isOpen={isCompleteDialogOpen}
        onClose={() => setIsCompleteDialogOpen(false)}
        onComplete={handleVoyageCompletion}
        routeName={route?.name || ''}
      />

      {/* Voyage Completed Confirmation Dialog */}
      <VoyageCompletedDialog
        isOpen={isCompletedConfirmationOpen}
        onClose={() => setIsCompletedConfirmationOpen(false)}
        routeName={route?.name || ''}
      />
    </div>
  );
};

export default RouteDetail;
