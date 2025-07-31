import { OceanPolygonManager } from './oceanPolygons';

// ECA (Emission Control Area) zone definitions
export const ECA_ZONES = {
  // North American ECA
  northAmerican: {
    id: 'north-american-eca',
    name: 'North American ECA',
    coordinates: [
      [-165.0, 65.0],  // Alaska
      [-130.0, 50.0],  // Western Canada
      [-125.0, 32.5],  // California
      [-117.0, 32.5],  // San Diego
      [-81.0, 24.5],   // Florida Keys
      [-75.0, 35.0],   // Cape Hatteras
      [-67.0, 44.0],   // Bay of Fundy
      [-60.0, 46.0],   // Nova Scotia
      [-50.0, 50.0],   // Newfoundland
      [-165.0, 65.0]   // Back to Alaska
    ] as [number, number][],
    properties: {
      fillColor: '#ff6b6b',
      fillOpacity: 0.2,
      strokeColor: '#e74c3c',
      strokeWidth: 2,
      strokeOpacity: 0.8,
      zone: 'North American ECA',
      regulations: 'SOx: 0.1%, NOx: Tier III for new engines'
    }
  },

  // US Caribbean ECA
  caribbeanECA: {
    id: 'us-caribbean-eca',
    name: 'US Caribbean ECA',
    coordinates: [
      [-68.0, 18.5],   // Puerto Rico North
      [-65.0, 18.0],   // Puerto Rico East
      [-65.0, 17.0],   // Virgin Islands
      [-68.5, 17.0],   // Puerto Rico South
      [-68.5, 18.5],   // Puerto Rico West
      [-68.0, 18.5]    // Close polygon
    ] as [number, number][],
    properties: {
      fillColor: '#ff6b6b',
      fillOpacity: 0.2,
      strokeColor: '#e74c3c',
      strokeWidth: 2,
      strokeOpacity: 0.8,
      zone: 'US Caribbean ECA',
      regulations: 'SOx: 0.1%, NOx: Tier III for new engines'
    }
  },

  // Baltic Sea SECA
  balticSECA: {
    id: 'baltic-seca',
    name: 'Baltic Sea SECA',
    coordinates: [
      [10.0, 57.0],    // Skagerrak
      [15.0, 55.0],    // Southern Baltic
      [30.0, 60.0],    // Gulf of Finland
      [24.0, 66.0],    // Bothnian Bay
      [18.0, 63.0],    // Swedish coast
      [12.0, 58.0],    // Norwegian coast
      [10.0, 57.0]     // Back to start
    ] as [number, number][],
    properties: {
      fillColor: '#3498db',
      fillOpacity: 0.2,
      strokeColor: '#2980b9',
      strokeWidth: 2,
      strokeOpacity: 0.8,
      zone: 'Baltic Sea SECA',
      regulations: 'SOx: 0.1% (SECA)'
    }
  },

  // North Sea SECA
  northSeaSECA: {
    id: 'north-sea-seca',
    name: 'North Sea SECA',
    coordinates: [
      [-4.0, 60.5],    // Shetland Islands
      [8.0, 58.0],     // Norwegian coast
      [8.0, 53.5],     // German Bight
      [2.0, 51.0],     // English Channel entrance
      [-6.0, 50.0],    // Southwest approaches
      [-8.0, 55.0],    // Irish Sea
      [-4.0, 60.5]     // Back to Shetland
    ] as [number, number][],
    properties: {
      fillColor: '#3498db',
      fillOpacity: 0.2,
      strokeColor: '#2980b9',
      strokeWidth: 2,
      strokeOpacity: 0.8,
      zone: 'North Sea SECA',
      regulations: 'SOx: 0.1% (SECA)'
    }
  },

  // English Channel SECA
  englishChannelSECA: {
    id: 'english-channel-seca',
    name: 'English Channel SECA',
    coordinates: [
      [2.0, 51.0],     // Dover Strait
      [-5.0, 50.0],    // Western entrance
      [-5.0, 49.0],    // Brittany coast
      [2.0, 49.0],     // French coast
      [2.0, 51.0]      // Back to Dover
    ] as [number, number][],
    properties: {
      fillColor: '#3498db',
      fillOpacity: 0.2,
      strokeColor: '#2980b9',
      strokeWidth: 2,
      strokeOpacity: 0.8,
      zone: 'English Channel SECA',
      regulations: 'SOx: 0.1% (SECA)'
    }
  }
};

/**
 * Adds all ECA zones to the map using the OceanPolygonManager
 */
export async function addECAZones(oceanPolygonManager: OceanPolygonManager): Promise<void> {
  try {
    console.log('Adding ECA zones to map...');
    
    for (const [key, zone] of Object.entries(ECA_ZONES)) {
      await oceanPolygonManager.addPolygon(
        zone.id,
        zone.coordinates,
        zone.properties,
        {
          name: zone.name,
          type: 'ECA',
          ...zone.properties
        }
      );
      console.log(`Added ECA zone: ${zone.name}`);
    }
    
    console.log('All ECA zones added successfully');
  } catch (error) {
    console.error('Error adding ECA zones:', error);
  }
}

/**
 * Removes all ECA zones from the map
 */
export function removeECAZones(oceanPolygonManager: OceanPolygonManager): void {
  try {
    Object.values(ECA_ZONES).forEach(zone => {
      oceanPolygonManager.removePolygon(zone.id);
    });
    console.log('All ECA zones removed');
  } catch (error) {
    console.error('Error removing ECA zones:', error);
  }
}

/**
 * Gets information about a specific ECA zone
 */
export function getECAZoneInfo(zoneId: string): any {
  const zone = Object.values(ECA_ZONES).find(z => z.id === zoneId);
  return zone ? {
    name: zone.name,
    regulations: zone.properties.regulations,
    type: 'Emission Control Area'
  } : null;
}