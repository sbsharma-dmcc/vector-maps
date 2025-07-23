export interface WaypointData {
  id: string;
  lat: number;
  lon: number;
  waypointNumber: number;
  isLocked: boolean;
  isPassed: boolean;
  createdFrom: 'upload' | 'manual';
  timestamp: string;
  name?: string;
  eta?: string;
}

export interface ValidationError {
  id: string;
  waypointId: string;
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

export interface FileUploadResult {
  waypoints: WaypointData[];
  validationResult: ValidationResult;
  fileName: string;
  fileType: 'rtiz' | 'csv';
}

export interface MIRUploadState {
  isUploaded: boolean;
  fileName?: string;
  waypoints: WaypointData[];
  validationErrors: ValidationError[];
  isEditing: boolean;
}