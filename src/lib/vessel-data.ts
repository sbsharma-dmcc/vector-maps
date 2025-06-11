
import { Vessel } from '@/utils/vesselMarkers';

export type { Vessel } from '@/utils/vesselMarkers';

export type VesselType = 'green' | 'orange' | 'circle';

export interface VesselEvent {
  id: string;
  vesselId: string;
  timestamp: string;  // Changed from Date to string to match usage
  eventType: 'departure' | 'arrival' | 'position' | 'status' | 'alert';  // Changed from 'type' to 'eventType' and added missing types
  location: string;
  description: string;
}

export interface Route {
  id: string;
  name: string;
  vesselId: string;  // Added vesselId property
  startPort: string;
  endPort: string;
  departureDate: string;  // Added departureDate property
  arrivalDate: string;    // Added arrivalDate property
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';  // Added status property
  distance: number;
  estimatedTime: string;
  coordinates: [number, number][];
  vessels: string[];
}

export const vessels: Vessel[] = [
  // Green vessels (ships) - spread across ocean bed
  {
    id: 'vessel-1',
    name: 'Green Cargo Ship Alpha',
    type: 'green',
    position: [139.7514, 35.6851] // Near Tokyo Bay
  },
  {
    id: 'vessel-2',
    name: 'Green Cargo Ship Beta',
    type: 'green',
    position: [140.1234, 35.4567] // East of Tokyo
  },
  {
    id: 'vessel-3',
    name: 'Green Cargo Ship Gamma',
    type: 'green',
    position: [139.2345, 35.8901] // West of Tokyo
  },
  {
    id: 'vessel-4',
    name: 'Green Cargo Ship Delta',
    type: 'green',
    position: [138.5432, 34.9876] // Southwest waters
  },
  {
    id: 'vessel-5',
    name: 'Green Cargo Ship Epsilon',
    type: 'green',
    position: [141.2345, 36.1234] // Northeast waters
  },
  
  // Orange vessels (ships) - spread across ocean bed
  {
    id: 'vessel-6',
    name: 'Orange Freight Alpha',
    type: 'orange',
    position: [139.9876, 35.2345] // South of Tokyo
  },
  {
    id: 'vessel-7',
    name: 'Orange Freight Beta',
    type: 'orange',
    position: [140.5432, 35.7890] // Northeast of Tokyo
  },
  {
    id: 'vessel-8',
    name: 'Orange Freight Gamma',
    type: 'orange',
    position: [138.8765, 35.5432] // Southwest of Tokyo
  },
  {
    id: 'vessel-9',
    name: 'Orange Freight Delta',
    type: 'orange',
    position: [140.8765, 34.7654] // Southeast waters
  },
  {
    id: 'vessel-10',
    name: 'Orange Freight Epsilon',
    type: 'orange',
    position: [138.1234, 36.3456] // Northwest waters
  },
  
  // Circle vessels (floating objects/buoys) - well distributed across ocean bed
  {
    id: 'circle-1',
    name: 'Navigation Buoy Alpha',
    type: 'circle',
    position: [139.6123, 35.7234] // Tokyo Bay entrance
  },
  {
    id: 'circle-2',
    name: 'Navigation Buoy Beta',
    type: 'circle',
    position: [139.8456, 35.5678] // Central Tokyo Bay
  },
  {
    id: 'circle-3',
    name: 'Navigation Buoy Gamma',
    type: 'circle',
    position: [140.2789, 35.8123] // Eastern waters
  },
  {
    id: 'circle-4',
    name: 'Navigation Buoy Delta',
    type: 'circle',
    position: [139.3456, 35.4567] // Western waters
  },
  {
    id: 'circle-5',
    name: 'Navigation Buoy Epsilon',
    type: 'circle',
    position: [140.6789, 35.3456] // Far eastern waters
  },
  {
    id: 'circle-6',
    name: 'Navigation Buoy Zeta',
    type: 'circle',
    position: [138.9876, 35.9123] // Northwestern waters
  },
  {
    id: 'circle-7',
    name: 'Navigation Buoy Eta',
    type: 'circle',
    position: [140.1234, 35.1234] // Southern waters
  },
  {
    id: 'circle-8',
    name: 'Navigation Buoy Theta',
    type: 'circle',
    position: [139.7890, 35.9876] // Northern waters
  },
  {
    id: 'circle-9',
    name: 'Navigation Buoy Iota',
    type: 'circle',
    position: [141.0123, 35.6789] // Far eastern waters
  },
  {
    id: 'circle-10',
    name: 'Navigation Buoy Kappa',
    type: 'circle',
    position: [138.4567, 35.2345] // Far western waters
  },
  {
    id: 'circle-11',
    name: 'Navigation Buoy Lambda',
    type: 'circle',
    position: [140.3456, 36.0123] // Northern eastern waters
  },
  {
    id: 'circle-12',
    name: 'Navigation Buoy Mu',
    type: 'circle',
    position: [139.1234, 34.8765] // Southern western waters
  }
];

export const generateMockVessels = (count: number = 20): Vessel[] => {
  return vessels.slice(0, count);
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

export const generateMockHistory = (vessels: Vessel[], count: number = 50): VesselEvent[] => {
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
