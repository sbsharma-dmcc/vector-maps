
import { Vessel } from '@/utils/vesselMarkers';

export { Vessel } from '@/utils/vesselMarkers';

export type VesselType = 'green' | 'orange' | 'circle';

export interface VesselEvent {
  id: string;
  vesselId: string;
  timestamp: Date;
  type: 'departure' | 'arrival' | 'maintenance' | 'alert';
  location: string;
  description: string;
}

export interface Route {
  id: string;
  name: string;
  startPort: string;
  endPort: string;
  distance: number;
  estimatedTime: string;
  coordinates: [number, number][];
  vessels: string[];
}

export const vessels: Vessel[] = [
  // Green vessels (ships)
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
  
  // Orange vessels (ships)
  {
    id: 'vessel-4',
    name: 'Orange Freight Delta',
    type: 'orange',
    position: [139.9876, 35.2345] // South of Tokyo
  },
  {
    id: 'vessel-5',
    name: 'Orange Freight Epsilon',
    type: 'orange',
    position: [140.5432, 35.7890] // Northeast of Tokyo
  },
  {
    id: 'vessel-6',
    name: 'Orange Freight Zeta',
    type: 'orange',
    position: [138.8765, 35.5432] // Southwest of Tokyo
  },
  
  // Circle vessels (floating objects/buoys)
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

export const generateMockHistory = (): VesselEvent[] => {
  const events: VesselEvent[] = [];
  const eventTypes: VesselEvent['type'][] = ['departure', 'arrival', 'maintenance', 'alert'];
  const locations = ['Tokyo Bay', 'Yokohama Port', 'Osaka Bay', 'Kobe Port', 'Nagoya Port'];
  
  vessels.forEach((vessel, index) => {
    for (let i = 0; i < 3; i++) {
      events.push({
        id: `event-${vessel.id}-${i}`,
        vesselId: vessel.id,
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
        location: locations[Math.floor(Math.random() * locations.length)],
        description: `${vessel.name} ${eventTypes[Math.floor(Math.random() * eventTypes.length)]} event`
      });
    }
  });
  
  return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

export const generateMockRoutes = (): Route[] => {
  return [
    {
      id: 'route-1',
      name: 'Tokyo - Osaka Express',
      startPort: 'Tokyo Bay',
      endPort: 'Osaka Bay',
      distance: 500,
      estimatedTime: '24 hours',
      coordinates: [[139.7514, 35.6851], [135.5023, 34.6937]],
      vessels: ['vessel-1', 'vessel-4']
    },
    {
      id: 'route-2',
      name: 'Coastal Navigation Route',
      startPort: 'Yokohama Port',
      endPort: 'Kobe Port',
      distance: 450,
      estimatedTime: '20 hours',
      coordinates: [[139.6380, 35.4437], [135.1955, 34.6901]],
      vessels: ['vessel-2', 'vessel-5']
    }
  ];
};
