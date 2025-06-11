
import { Vessel } from '@/utils/vesselMarkers';

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
