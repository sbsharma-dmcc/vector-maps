import { OceanPolygonManager } from './oceanPolygons';

// ECA (Emission Control Area) zone definitions
export const ECA_ZONES = {
  // North American ECA - Adjusted to stay in ocean waters
  northAmerican: {
    id: 'north-american-eca',
    name: 'North American ECA',
    coordinates: [
      [-160.0, 60.0],  // Alaska waters
      [-140.0, 50.0],  // North Pacific
      [-130.0, 40.0],  // California waters
      [-120.0, 32.0],  // Southern California
      [-90.0, 25.0],   // Gulf of Mexico
      [-80.0, 26.0],   // Florida waters
      [-75.0, 35.0],   // Atlantic waters
      [-65.0, 42.0],   // Canadian Atlantic
      [-55.0, 48.0],   // Newfoundland waters
      [-160.0, 60.0]   // Back to Alaska
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

  // US Caribbean ECA - Ocean waters only
  caribbeanECA: {
    id: 'us-caribbean-eca',
    name: 'US Caribbean ECA',
    coordinates: [
      [-67.5, 18.8],   // North of Puerto Rico (ocean)
      [-64.5, 18.5],   // East of Puerto Rico (ocean)
      [-64.5, 17.2],   // Virgin Islands waters
      [-68.0, 17.2],   // South of Puerto Rico (ocean)
      [-68.0, 18.8],   // West waters
      [-67.5, 18.8]    // Close polygon
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

  // Baltic Sea SECA - Ocean waters only
  balticSECA: {
    id: 'baltic-seca',
    name: 'Baltic Sea SECA',
    coordinates: [
      [11.0, 57.5],    // Skagerrak waters
      [16.0, 55.5],    // Southern Baltic waters
      [28.0, 59.5],    // Gulf of Finland waters
      [23.0, 65.5],    // Bothnian Bay waters
      [17.0, 62.5],    // Swedish waters
      [11.5, 58.5],    // Norwegian waters
      [11.0, 57.5]     // Back to start
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