import { Vessel } from '@/utils/vesselMarkers';
import * as turf from '@turf/turf'; // Import turf.js

export type { Vessel } from '@/utils/vesselMarkers';
export type VesselType = 'green' | 'orange' | 'circle';

export interface VesselEvent {
  id: string;
  vesselId: string;
  timestamp: string;
  eventType: 'departure' | 'arrival' | 'position' | 'status' | 'alert';
  location: string;
  description: string;
}

export interface Route {
  id: string;
  name: string;
  vesselId: string;
  startPort: string;
  endPort: string;
  departureDate: string;
  arrivalDate: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  distance: number;
  estimatedTime: string;
  coordinates: [number, number][];
  vessels: string[];
}

export const vessels: Vessel[] = [
  // Green vessels – updated to be in open oceans
  {
    id: 'vessel-1',
    name: 'Green Cargo Ship Alpha',
    type: 'green',
    position: [-73.0, 39.5] // North Atlantic (off US East Coast)
  },
  {
    id: 'vessel-2',
    name: 'Green Cargo Ship Beta',
    type: 'green',
    position: [-157.5, 21.0] // North Pacific (south of Hawaii)
  },
  {
    id: 'vessel-3',
    name: 'Green Cargo Ship Gamma',
    type: 'green',
    position: [0.0, 47.0] // North Atlantic (mid-ocean west of France)
  },
  {
    id: 'vessel-4',
    name: 'Green Cargo Ship Delta',
    type: 'green',
    position: [104.5, 0.5] // South China Sea
  },
  {
    id: 'vessel-5',
    name: 'Green Cargo Ship Epsilon',
    type: 'green',
    position: [-122.5, 33.5] // Pacific Ocean (west of California)
  }
];

// Hardcoded land polygons for testing purposes
const hardcodedLandPolygons = turf.multiPolygon([
  // North America (simplified rectangle)
  [[[-130, 25], [-60, 25], [-60, 50], [-130, 50], [-130, 25]]],
  // Europe/Asia (simplified rectangle)
  [[[0, 30], [180, 30], [180, 70], [0, 70], [0, 30]]]
]);

// Enhanced function to generate more realistic ocean positions
export const generateMockVessels = (count: number = 5): Vessel[] => {
  const oceanRegions = [
    // North Atlantic
    { minLng: -80, maxLng: 20, minLat: 30, maxLat: 70 },
    // South Atlantic  
    { minLng: -60, maxLng: 20, minLat: -60, maxLat: 30 },
    // North Pacific (note: this region spans the antimeridian, handled below)
    { minLng: 120, maxLng: -120, minLat: 20, maxLat: 60 },
    // South Pacific (note: this region spans the antimeridian, handled below)
    { minLng: 120, maxLng: -70, minLat: -60, maxLat: 20 },
    // Indian Ocean
    { minLng: 20, maxLng: 120, minLat: -60, maxLat: 30 },
    // Arctic Ocean (more constrained latitudes to stay watery)
    { minLng: -180, maxLng: 180, minLat: 70, maxLat: 85 },
    // Southern Ocean (more constrained latitudes to stay watery)
    { minLng: -180, maxLng: 180, minLat: -80, maxLat: -55 }
  ];

  const vesselTypes: VesselType[] = ['green', 'orange', 'circle'];
  const vesselNames = {
    green: ['Cargo Master', 'Ocean Freight', 'Sea Carrier', 'Marine Express', 'Blue Wave'],
    orange: ['Trade Wind', 'Pacific Star', 'Atlantic Pioneer', 'Global Trader', 'Ocean Explorer'],
    circle: ['Navigation Beacon', 'Weather Buoy', 'Safety Marker', 'Ocean Monitor', 'Sea Guard']
  };

  const generatedVessels: Vessel[] = [];
  let attempts = 0;
  const maxAttemptsPerVessel = 100; // Prevent infinite loops

  for (let i = 0; i < count; i++) {
    let position: [number, number] | null = null;
    let isValidPosition = false;
    attempts = 0;

    while (!isValidPosition && attempts < maxAttemptsPerVessel) {
      const region = oceanRegions[Math.floor(Math.random() * oceanRegions.length)];
      
      let longitude = Math.random() * (region.maxLng - region.minLng) + region.minLng;
      
      // Handle Pacific Ocean longitude wrap-around for random generation
      if (region.minLng > region.maxLng) { // e.g., 120 to -120 implies spanning the 180/-180 meridian
        const range1 = 180 - region.minLng; // Distance from minLng to 180
        const range2 = region.maxLng - (-180); // Distance from -180 to maxLng
        const totalRange = range1 + range2;
        const randomPointInTotalRange = Math.random() * totalRange;

        if (randomPointInTotalRange < range1) {
          longitude = region.minLng + randomPointInTotalRange;
        } else {
          longitude = -180 + (randomPointInTotalRange - range1);
        }
      }
      
      const latitude = Math.random() * (region.maxLat - region.minLat) + region.minLat;
      position = [longitude, latitude];

      // --- Point-in-Polygon Check ---
      const point = turf.point(position);
      // If the point is NOT in any land polygon, it's in the ocean.
      // `booleanPointInPolygon` returns true if inside. We want it to be false.
      isValidPosition = !turf.booleanPointInPolygon(point, hardcodedLandPolygons);

      attempts++;
    }

    if (isValidPosition && position) {
      const type = vesselTypes[Math.floor(Math.random() * vesselTypes.length)];
      const nameOptions = vesselNames[type];
      
      generatedVessels.push({
        id: `generated-vessel-${i + 1}`,
        name: `${nameOptions[Math.floor(Math.random() * nameOptions.length)]} ${i + 1}`,
        type,
        position: position
      });
    } else {
      console.warn(`Could not find an ocean position for vessel ${i + 1} after ${maxAttemptsPerVessel} attempts.`);
    }
  }

  return generatedVessels;
};

export const getVesselStats = () => {
  const totalVessels = vessels.length;
  const greenVessels = vessels.filter(v => v.type === 'green').length;
  const orangeVessels = vessels.filter(v => v.type === 'orange').length;
  const circleVessels = vessels.filter(v => v.type === 'circle').length;
  
  return {
    total: totalVessels,
    green: greenVessels,
    orange: orangeVessels,
    circle: circleVessels,
    active: Math.floor(totalVessels * 0.8),
    inactive: Math.floor(totalVessels * 0.2)
  };
};

export const generateMockHistory = (vessels: Vessel[], count: number = 10): VesselEvent[] => {
  const events: VesselEvent[] = [];
  const eventTypes: VesselEvent['eventType'][] = ['departure', 'arrival', 'position', 'status', 'alert'];
  const locations = ['Tokyo Bay', 'Yokohama Port', 'Osaka Bay', 'Kobe Port', 'Nagoya Port', 'Chiba Port', 'Kawasaki Port'];
  
  for (let i = 0; i < count; i++) {
    const vessel = vessels[Math.floor(Math.random() * vessels.length)];
    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    const location = locations[Math.floor(Math.random() * locations.length)];
    
    events.push({
      id: `event-${i + 1}`,
      vesselId: vessel.id,
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      eventType,
      location,
      description: `${vessel.name} ${eventType} at ${location}`
    });
  }
  
  return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const generateMockRoutes = (vessels: Vessel[]): Route[] => {
  const statuses: Route['status'][] = ['scheduled', 'in-progress', 'completed', 'cancelled'];
  const ports = ['Tokyo Bay', 'Yokohama Port', 'Osaka Bay', 'Kobe Port', 'Nagoya Port', 'Chiba Port'];
  
  return vessels.slice(0, 10).map((vessel, index) => {
    const startPort = ports[Math.floor(Math.random() * ports.length)];
    let endPort = ports[Math.floor(Math.random() * ports.length)];
    while (endPort === startPort) {
      endPort = ports[Math.floor(Math.random() * ports.length)];
    }
    
    const departureDate = new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000);
    const arrivalDate = new Date(departureDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000);
    
    return {
      id: `RT-${String(index + 1).padStart(3, '0')}`,
      name: `Route ${vessel.name}`,
      vesselId: vessel.id,
      startPort,
      endPort,
      departureDate: departureDate.toISOString(),
      arrivalDate: arrivalDate.toISOString(),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      distance: Math.floor(Math.random() * 1000) + 100,
      estimatedTime: `${Math.floor(Math.random() * 72) + 12} hours`,
      coordinates: [vessel.position, [vessel.position[0] + Math.random() * 2 - 1, vessel.position[1] + Math.random() * 2 - 1]],
      vessels: [vessel.id]
    };
  });
};