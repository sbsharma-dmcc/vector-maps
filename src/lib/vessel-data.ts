
// Mock vessel data for the prototype

export type VesselType = 'green' | 'orange';

export interface Vessel {
  id: string;
  name: string;
  type: VesselType;
  position: [number, number]; // [longitude, latitude]
  speed: number; // in knots
  heading: number; // in degrees
  status: 'active' | 'docked' | 'maintenance';
  lastUpdated: string; // ISO date string
}

// Generate random position near the given coordinates
const randomPosition = (baseLng: number, baseLat: number, spread = 5): [number, number] => {
  return [
    baseLng + (Math.random() * spread * 2 - spread),
    baseLat + (Math.random() * spread * 2 - spread)
  ];
};

// Generate mock vessel data
export const generateMockVessels = (count = 20): Vessel[] => {
  const vesselTypes: VesselType[] = ['green', 'orange'];
  const vesselStatuses: Vessel['status'][] = ['active', 'docked', 'maintenance'];
  const vessels: Vessel[] = [];

  // Different areas to place vessels
  const areas = [
    { name: 'North Atlantic', lng: -35, lat: 40 },
    { name: 'Mediterranean', lng: 15, lat: 35 },
    { name: 'South Pacific', lng: 175, lat: -20 },
    { name: 'Indian Ocean', lng: 75, lat: -10 }
  ];

  for (let i = 0; i < count; i++) {
    const area = areas[Math.floor(Math.random() * areas.length)];
    const type = vesselTypes[Math.floor(Math.random() * vesselTypes.length)];
    
    vessels.push({
      id: `VSL-${String(i + 1).padStart(3, '0')}`,
      name: `Vessel ${i + 1}`,
      type,
      position: randomPosition(area.lng, area.lat, 10),
      speed: Math.floor(Math.random() * 25),
      heading: Math.floor(Math.random() * 360),
      status: vesselStatuses[Math.floor(Math.random() * vesselStatuses.length)],
      lastUpdated: new Date(Date.now() - Math.floor(Math.random() * 24 * 60 * 60 * 1000)).toISOString()
    });
  }

  return vessels;
};

// Vessel statistics
export const getVesselStats = (vessels: Vessel[]) => {
  return {
    total: vessels.length,
    active: vessels.filter(v => v.status === 'active').length,
    docked: vessels.filter(v => v.status === 'docked').length,
    maintenance: vessels.filter(v => v.status === 'maintenance').length,
    byType: {
      green: vessels.filter(v => v.type === 'green').length,
      orange: vessels.filter(v => v.type === 'orange').length
    }
  };
};

// Mock vessel routes
export interface Route {
  id: string;
  name: string;
  vesselId: string;
  startPort: string;
  endPort: string;
  waypoints: [number, number][];
  departureDate: string;
  arrivalDate: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'diverted';
}

// Generate mock routes for vessels
export const generateMockRoutes = (vessels: Vessel[]): Route[] => {
  const routes: Route[] = [];
  const ports = [
    { name: 'New York', position: [-74.0060, 40.7128] },
    { name: 'Rotterdam', position: [4.4777, 51.9225] },
    { name: 'Singapore', position: [103.8198, 1.3521] },
    { name: 'Shanghai', position: [121.4737, 31.2304] },
    { name: 'Sydney', position: [151.2093, -33.8688] },
    { name: 'Cape Town', position: [18.4241, -33.9249] }
  ];
  
  const routeStatuses: Route['status'][] = ['scheduled', 'in-progress', 'completed', 'diverted'];
  
  vessels.forEach((vessel, index) => {
    // Each vessel gets 1-3 routes
    const numRoutes = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < numRoutes; i++) {
      const startPortIndex = Math.floor(Math.random() * ports.length);
      let endPortIndex = Math.floor(Math.random() * ports.length);
      
      // Ensure start and end ports are different
      while (endPortIndex === startPortIndex) {
        endPortIndex = Math.floor(Math.random() * ports.length);
      }
      
      const startPort = ports[startPortIndex];
      const endPort = ports[endPortIndex];
      
      // Generate 1-3 waypoints between start and end
      const numWaypoints = Math.floor(Math.random() * 3) + 1;
      const waypoints: [number, number][] = [startPort.position];
      
      for (let j = 0; j < numWaypoints; j++) {
        // Interpolate waypoint between start and end
        const fraction = (j + 1) / (numWaypoints + 1);
        const lng = startPort.position[0] + (endPort.position[0] - startPort.position[0]) * fraction;
        const lat = startPort.position[1] + (endPort.position[1] - startPort.position[1]) * fraction;
        
        // Add some randomness to waypoint
        waypoints.push([
          lng + (Math.random() * 10 - 5),
          lat + (Math.random() * 10 - 5)
        ]);
      }
      
      waypoints.push(endPort.position);
      
      // Generate dates
      const now = new Date();
      const depOffset = Math.floor(Math.random() * 30) - 15; // -15 to 15 days from now
      const tripDuration = Math.floor(Math.random() * 21) + 7; // 7-28 days
      
      const departureDate = new Date(now);
      departureDate.setDate(departureDate.getDate() + depOffset);
      
      const arrivalDate = new Date(departureDate);
      arrivalDate.setDate(arrivalDate.getDate() + tripDuration);
      
      routes.push({
        id: `RT-${String(routes.length + 1).padStart(3, '0')}`,
        name: `${startPort.name} to ${endPort.name}`,
        vesselId: vessel.id,
        startPort: startPort.name,
        endPort: endPort.name,
        waypoints,
        departureDate: departureDate.toISOString(),
        arrivalDate: arrivalDate.toISOString(),
        status: routeStatuses[Math.floor(Math.random() * routeStatuses.length)]
      });
    }
  });
  
  return routes;
};

// Mock vessel history events
export interface VesselEvent {
  id: string;
  vesselId: string;
  eventType: 'departure' | 'arrival' | 'position' | 'status' | 'alert';
  timestamp: string;
  location: string;
  coordinates: [number, number];
  description: string;
}

// Generate mock history events for vessels
export const generateMockHistory = (vessels: Vessel[], count = 100): VesselEvent[] => {
  const events: VesselEvent[] = [];
  const eventTypes: VesselEvent['eventType'][] = ['departure', 'arrival', 'position', 'status', 'alert'];
  const ports = [
    { name: 'New York', position: [-74.0060, 40.7128] },
    { name: 'Rotterdam', position: [4.4777, 51.9225] },
    { name: 'Singapore', position: [103.8198, 1.3521] },
    { name: 'Shanghai', position: [121.4737, 31.2304] },
    { name: 'Sydney', position: [151.2093, -33.8688] },
    { name: 'Cape Town', position: [18.4241, -33.9249] }
  ];
  
  for (let i = 0; i < count; i++) {
    const vessel = vessels[Math.floor(Math.random() * vessels.length)];
    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    const daysAgo = Math.floor(Math.random() * 30);
    const timestamp = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    
    let location = '';
    let coordinates: [number, number] = [0, 0];
    let description = '';
    
    switch (eventType) {
      case 'departure':
        const departPort = ports[Math.floor(Math.random() * ports.length)];
        location = departPort.name;
        coordinates = departPort.position;
        description = `Departed from ${location} port`;
        break;
      
      case 'arrival':
        const arrivalPort = ports[Math.floor(Math.random() * ports.length)];
        location = arrivalPort.name;
        coordinates = arrivalPort.position;
        description = `Arrived at ${location} port`;
        break;
      
      case 'position':
        // Random position in the ocean
        coordinates = [Math.random() * 360 - 180, Math.random() * 160 - 80];
        location = 'Open Waters';
        description = `Routine position update at ${coordinates[0].toFixed(2)}, ${coordinates[1].toFixed(2)}`;
        break;
      
      case 'status':
        const statuses = ['Started maintenance', 'Finished maintenance', 'Changed course', 'Speed adjustment', 'Fuel replenishment'];
        description = statuses[Math.floor(Math.random() * statuses.length)];
        coordinates = vessel.position;
        location = 'Current Position';
        break;
      
      case 'alert':
        const alerts = ['Weather warning', 'Technical issue', 'Security alert', 'Navigation hazard', 'Emergency response'];
        description = `ALERT: ${alerts[Math.floor(Math.random() * alerts.length)]}`;
        coordinates = vessel.position;
        location = 'Current Position';
        break;
    }
    
    events.push({
      id: `EVT-${String(i + 1).padStart(3, '0')}`,
      vesselId: vessel.id,
      eventType,
      timestamp: timestamp.toISOString(),
      location,
      coordinates,
      description
    });
  }
  
  // Sort events by timestamp (newest first)
  return events.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
};
