import { WaypointData, FileUploadResult } from '@/types/voyage';
import { ValidationEngine } from './fileValidation';

// Utility to convert DMS to decimal degrees
const dmsToDecimal = (dmsString: string): number => {
  console.log('Converting DMS string:', dmsString);
  
  // Handle formats like "22° 37′ 31″ N" or "69° 6′ 13″ E"
  try {
    const cleanDms = dmsString.replace(/[°′″]/g, ' ').trim();
    const parts = cleanDms.split(/\s+/).filter(p => p);
    
    console.log('DMS parts:', parts);
    
    if (parts.length < 4) {
      throw new Error(`Invalid DMS format: ${dmsString} - Expected format: "22° 37′ 31″ N"`);
    }
    
    const degrees = parseInt(parts[0]);
    const minutes = parseInt(parts[1]);
    const seconds = parseInt(parts[2]);
    const direction = parts[3].toUpperCase();
    
    console.log(`Parsed: ${degrees}° ${minutes}′ ${seconds}″ ${direction}`);
    
    if (isNaN(degrees) || isNaN(minutes) || isNaN(seconds)) {
      throw new Error(`Invalid numeric values in DMS: ${dmsString}`);
    }
    
    let decimal = degrees + minutes / 60 + seconds / 3600;
    
    if (direction === 'S' || direction === 'W') {
      decimal = -decimal;
    }
    
    console.log(`Converted to decimal: ${decimal}`);
    
    return decimal;
  } catch (error) {
    console.error('DMS conversion error:', error);
    throw new Error(`DMS conversion failed for "${dmsString}": ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// JSON processor for direct JSON input
export class JSONProcessor implements FileProcessor {
  async validate(file: File): Promise<boolean> {
    return file.type === 'application/json' || file.name.toLowerCase().endsWith('.json');
  }
  
  async parse(file: File): Promise<WaypointData[]> {
    const content = await file.text();
    let jsonData;
    
    try {
      jsonData = JSON.parse(content);
    } catch (error) {
      throw new Error('Invalid JSON format');
    }
    
    if (!Array.isArray(jsonData)) {
      throw new Error('JSON must contain an array of waypoints');
    }
    
    const waypoints: WaypointData[] = [];
    
    jsonData.forEach((item, index) => {
      let lat: number, lon: number;
      
      // Handle different coordinate formats
      if (typeof item.latitude === 'string' && typeof item.longitude === 'string') {
        // DMS format
        try {
          lat = dmsToDecimal(item.latitude);
          lon = dmsToDecimal(item.longitude);
        } catch (error) {
          throw new Error(`Item ${index + 1}: Invalid DMS coordinates - ${error}`);
        }
      } else if (typeof item.lat === 'number' && typeof item.lon === 'number') {
        // Decimal degrees
        lat = item.lat;
        lon = item.lon;
      } else if (typeof item.latitude === 'number' && typeof item.longitude === 'number') {
        // Alternative decimal format
        lat = item.latitude;
        lon = item.longitude;
      } else {
        throw new Error(`Item ${index + 1}: Missing or invalid coordinate format`);
      }
      
      waypoints.push({
        id: `wp-${Date.now()}-${index}`,
        waypointNumber: item.waypointNumber || index + 1,
        lat,
        lon,
        name: item.name || `WP${index + 1}`,
        eta: item.eta || '',
        isLocked: true, // Default locked as per requirements
        isPassed: false,
        createdFrom: 'upload',
        timestamp: new Date().toISOString()
      });
    });
    
    return waypoints;
  }
  
  detectCorruption(content: string): string[] {
    const issues: string[] = [];
    
    try {
      JSON.parse(content);
    } catch (error) {
      issues.push('Invalid JSON syntax');
    }
    
    if (content.includes('\0')) {
      issues.push('File contains null bytes');
    }
    
    return issues;
  }
}

export interface FileProcessor {
  validate(file: File): Promise<boolean>;
  parse(file: File): Promise<WaypointData[]>;
  detectCorruption(content: string): string[];
}

export class CSVProcessor implements FileProcessor {
  async validate(file: File): Promise<boolean> {
    return file.type === 'text/csv' || file.name.toLowerCase().endsWith('.csv');
  }
  
  async parse(file: File): Promise<WaypointData[]> {
    const content = await file.text();
    const lines = content.split('\n').filter(line => line.trim());
    
    if (lines.length === 0) {
      throw new Error('File is empty');
    }
    
    // Check for header
    const firstLine = lines[0].toLowerCase();
    const hasHeader = firstLine.includes('lat') || firstLine.includes('lon') || firstLine.includes('waypoint');
    const dataLines = hasHeader ? lines.slice(1) : lines;
    
    const waypoints: WaypointData[] = [];
    
    dataLines.forEach((line, index) => {
      const columns = line.split(',').map(col => col.trim());
      
      if (columns.length < 3) {
        throw new Error(`Line ${index + (hasHeader ? 2 : 1)}: Insufficient columns (expected at least 3: waypoint, lat, lon)`);
      }
      
      const waypointNumber = parseInt(columns[0]);
      const lat = parseFloat(columns[1]);
      const lon = parseFloat(columns[2]);
      const name = columns[3] || `WP${waypointNumber}`;
      const eta = columns[4] || '';
      
      if (isNaN(waypointNumber) || isNaN(lat) || isNaN(lon)) {
        throw new Error(`Line ${index + (hasHeader ? 2 : 1)}: Invalid numeric values`);
      }
      
      waypoints.push({
        id: `wp-${Date.now()}-${index}`,
        waypointNumber,
        lat,
        lon,
        name,
        eta,
        isLocked: true, // Default locked as per requirements
        isPassed: false,
        createdFrom: 'upload',
        timestamp: new Date().toISOString()
      });
    });
    
    return waypoints;
  }
  
  detectCorruption(content: string): string[] {
    const issues: string[] = [];
    
    // Check for common corruption patterns
    if (content.includes('\0')) {
      issues.push('File contains null bytes - possible binary corruption');
    }
    
    if (content.length < 10) {
      issues.push('File appears to be too short');
    }
    
    // Check for encoding issues
    if (/[^\x00-\x7F]/.test(content) && !/[àáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿ]/.test(content)) {
      issues.push('Possible encoding issues detected');
    }
    
    return issues;
  }
}

export class RTZProcessor implements FileProcessor {
  async validate(file: File): Promise<boolean> {
    return file.type === 'application/xml' || 
           file.name.toLowerCase().endsWith('.rtz') ||
           file.name.toLowerCase().endsWith('.xml');
  }
  
  async parse(file: File): Promise<WaypointData[]> {
    const content = await file.text();
    
    // Basic XML validation
    if (!content.includes('<') || !content.includes('>')) {
      throw new Error('Invalid XML format');
    }
    
    // Parse RTZ XML - simplified implementation
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(content, 'text/xml');
    
    // Check for parsing errors
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
      throw new Error('XML parsing error: ' + parserError.textContent);
    }
    
    // Extract waypoints from RTZ format
    const waypoints: WaypointData[] = [];
    const waypointElements = xmlDoc.querySelectorAll('waypoint, rtept');
    
    waypointElements.forEach((element, index) => {
      const lat = parseFloat(element.getAttribute('lat') || '0');
      const lon = parseFloat(element.getAttribute('lon') || '0');
      const name = element.getAttribute('name') || `WP${index + 1}`;
      
      if (isNaN(lat) || isNaN(lon)) {
        throw new Error(`Waypoint ${index + 1}: Invalid coordinates`);
      }
      
      waypoints.push({
        id: `wp-${Date.now()}-${index}`,
        waypointNumber: index + 1,
        lat,
        lon,
        name,
        isLocked: true,
        isPassed: false,
        createdFrom: 'upload',
        timestamp: new Date().toISOString()
      });
    });
    
    if (waypoints.length === 0) {
      throw new Error('No valid waypoints found in RTZ file');
    }
    
    return waypoints;
  }
  
  detectCorruption(content: string): string[] {
    const issues: string[] = [];
    
    if (!content.includes('<?xml')) {
      issues.push('Missing XML declaration');
    }
    
    if (content.includes('\0')) {
      issues.push('File contains null bytes');
    }
    
    // Check for balanced tags
    const openTags = (content.match(/</g) || []).length;
    const closeTags = (content.match(/>/g) || []).length;
    
    if (Math.abs(openTags - closeTags) > 2) {
      issues.push('Unbalanced XML tags detected');
    }
    
    return issues;
  }
}

export class FileProcessorFactory {
  static async createProcessor(file: File): Promise<FileProcessor> {
    const csvProcessor = new CSVProcessor();
    const rtzProcessor = new RTZProcessor();
    const jsonProcessor = new JSONProcessor();
    
    if (await jsonProcessor.validate(file)) {
      return jsonProcessor;
    }
    
    if (await csvProcessor.validate(file)) {
      return csvProcessor;
    }
    
    if (await rtzProcessor.validate(file)) {
      return rtzProcessor;
    }
    
    throw new Error('Unsupported file format. Please upload .csv, .rtz, or .json files only.');
  }
  
  // Direct JSON processing method
  static async processJSONString(jsonString: string): Promise<FileUploadResult> {
    try {
      console.log('Processing JSON string:', jsonString);
      
      const data = JSON.parse(jsonString);
      console.log('Parsed JSON data:', data);
      
      if (!Array.isArray(data)) {
        throw new Error('JSON must be an array of waypoint objects');
      }

      const waypoints: WaypointData[] = data.map((item: any, index: number) => {
        console.log(`Processing waypoint ${index + 1}:`, item);
        
        if (!item.latitude || !item.longitude) {
          throw new Error(`Missing latitude or longitude in waypoint ${index + 1}`);
        }

        let lat: number;
        let lon: number;

        try {
          // Check if already decimal
          if (typeof item.latitude === 'number' && typeof item.longitude === 'number') {
            lat = item.latitude;
            lon = item.longitude;
          } else {
            // Convert DMS to decimal degrees
            lat = dmsToDecimal(item.latitude.toString());
            lon = dmsToDecimal(item.longitude.toString());
          }
          
          console.log(`Converted coordinates for WP${index + 1}: lat=${lat}, lon=${lon}`);
        } catch (conversionError) {
          console.error(`Error converting coordinates for waypoint ${index + 1}:`, conversionError);
          throw new Error(`Invalid coordinate format in waypoint ${index + 1}: ${conversionError instanceof Error ? conversionError.message : 'Unknown error'}`);
        }

        return {
          id: `wp-${Date.now()}-${index}`,
          lat,
          lon,
          waypointNumber: index + 1,
          isLocked: true,
          isPassed: false,
          createdFrom: 'upload' as const,
          timestamp: new Date().toISOString(),
          name: item.name || `WP${index + 1}`,
          eta: item.eta || ''
        };
      });

      console.log('Generated waypoints:', waypoints);

      // Validate waypoints
      const validationResult = ValidationEngine.validate(waypoints);

      return {
        waypoints,
        validationResult,
        fileName: 'waypoints.json',
        fileType: 'csv'
      };
    } catch (error) {
      console.error('JSON processing error:', error);
      throw new Error(`Invalid JSON format or processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  static async processFile(file: File): Promise<FileUploadResult> {
    try {
      const processor = await this.createProcessor(file);
      const content = await file.text();
      
      // Check for corruption
      const corruptionIssues = processor.detectCorruption(content);
      if (corruptionIssues.length > 0) {
        throw new Error('File corruption detected: ' + corruptionIssues.join(', '));
      }
      
      // Parse waypoints
      const waypoints = await processor.parse(file);
      
      // Validate waypoints
      const validationResult = ValidationEngine.validate(waypoints);
      
      return {
        waypoints,
        validationResult,
        fileName: file.name,
        fileType: file.name.toLowerCase().endsWith('.csv') ? 'csv' : 'rtiz'
      };
    } catch (error) {
      throw new Error(`File processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}