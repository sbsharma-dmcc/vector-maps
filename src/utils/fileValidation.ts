import { WaypointData, ValidationError, ValidationResult } from '@/types/voyage';

export class ValidationRule {
  constructor(
    public name: string,
    public field: string,
    private validator: (waypoint: WaypointData) => string | null
  ) {}

  validate(waypoint: WaypointData): ValidationError | null {
    const error = this.validator(waypoint);
    if (error) {
      return {
        id: `${waypoint.id}-${this.field}`,
        waypointId: waypoint.id,
        field: this.field,
        message: error,
        severity: 'error'
      };
    }
    return null;
  }
}

// Validation rules
export const latLonFormatRule = new ValidationRule(
  'LatLon Format',
  'coordinates',
  (waypoint) => {
    const isValidLat = waypoint.lat >= -90 && waypoint.lat <= 90;
    const isValidLon = waypoint.lon >= -180 && waypoint.lon <= 180;
    
    if (!isValidLat || !isValidLon) {
      return `Invalid coordinates: lat(${waypoint.lat}), lon(${waypoint.lon}). Latitude must be -90 to 90, longitude -180 to 180`;
    }
    
    // Check DD format (decimal degrees)
    const latDecimals = waypoint.lat.toString().split('.')[1]?.length || 0;
    const lonDecimals = waypoint.lon.toString().split('.')[1]?.length || 0;
    
    if (latDecimals > 6 || lonDecimals > 6) {
      return 'Coordinates should be in DD format with max 6 decimal places';
    }
    
    return null;
  }
);

export const waypointNumberRule = new ValidationRule(
  'Waypoint Number',
  'waypointNumber',
  (waypoint) => {
    if (!Number.isInteger(waypoint.waypointNumber) || waypoint.waypointNumber <= 0) {
      return 'Waypoint number must be a positive integer';
    }
    return null;
  }
);

export const duplicateCheckRule = new ValidationRule(
  'Duplicate Check',
  'coordinates',
  (waypoint) => {
    // This will be enhanced to check against other waypoints in the validation engine
    return null;
  }
);

export const validationRules = [
  latLonFormatRule,
  waypointNumberRule,
  duplicateCheckRule
];

export class ValidationEngine {
  static validate(waypoints: WaypointData[]): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    
    // Check for duplicates
    const coordinateMap = new Map<string, WaypointData>();
    const waypointNumbers = new Set<number>();
    
    waypoints.forEach(waypoint => {
      // Individual waypoint validation
      validationRules.forEach(rule => {
        const error = rule.validate(waypoint);
        if (error) {
          errors.push(error);
        }
      });
      
      // Duplicate coordinate check
      const coordKey = `${waypoint.lat.toFixed(6)},${waypoint.lon.toFixed(6)}`;
      if (coordinateMap.has(coordKey)) {
        errors.push({
          id: `${waypoint.id}-duplicate-coord`,
          waypointId: waypoint.id,
          field: 'coordinates',
          message: `Duplicate coordinates found with waypoint ${coordinateMap.get(coordKey)?.waypointNumber}`,
          severity: 'error'
        });
      }
      coordinateMap.set(coordKey, waypoint);
      
      // Duplicate waypoint number check
      if (waypointNumbers.has(waypoint.waypointNumber)) {
        errors.push({
          id: `${waypoint.id}-duplicate-number`,
          waypointId: waypoint.id,
          field: 'waypointNumber',
          message: `Duplicate waypoint number: ${waypoint.waypointNumber}`,
          severity: 'error'
        });
      }
      waypointNumbers.add(waypoint.waypointNumber);
    });
    
    // Sequence validation
    const sortedByNumber = [...waypoints].sort((a, b) => a.waypointNumber - b.waypointNumber);
    for (let i = 0; i < sortedByNumber.length - 1; i++) {
      const current = sortedByNumber[i];
      const next = sortedByNumber[i + 1];
      
      if (next.waypointNumber - current.waypointNumber > 1) {
        warnings.push({
          id: `${current.id}-sequence-gap`,
          waypointId: current.id,
          field: 'waypointNumber',
          message: `Gap in sequence: waypoint ${current.waypointNumber} followed by ${next.waypointNumber}`,
          severity: 'warning'
        });
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}