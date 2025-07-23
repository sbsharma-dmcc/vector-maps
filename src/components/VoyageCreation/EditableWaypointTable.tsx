import React, { useState, useCallback, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, Unlock, Trash2, Save, X, AlertTriangle } from 'lucide-react';
import { WaypointData, ValidationError } from '@/types/voyage';
import { ValidationEngine } from '@/utils/fileValidation';

interface EditableWaypointTableProps {
  waypoints: WaypointData[];
  validationErrors: ValidationError[];
  onUpdate: (waypoints: WaypointData[], errors: ValidationError[]) => void;
}

const EditableWaypointTable = ({ waypoints, validationErrors, onUpdate }: EditableWaypointTableProps) => {
  const [editingWaypoints, setEditingWaypoints] = useState<WaypointData[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setEditingWaypoints([...waypoints]);
  }, [waypoints]);

  const getErrorsForWaypoint = useCallback((waypointId: string) => {
    return validationErrors.filter(error => error.waypointId === waypointId);
  }, [validationErrors]);

  const getFieldError = useCallback((waypointId: string, field: string) => {
    return validationErrors.find(error => error.waypointId === waypointId && error.field === field);
  }, [validationErrors]);

  const handleStartEdit = useCallback((waypointId: string) => {
    setEditingId(waypointId);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingWaypoints([...waypoints]);
    setEditingId(null);
    setHasChanges(false);
  }, [waypoints]);

  const handleFieldChange = useCallback((waypointId: string, field: keyof WaypointData, value: any) => {
    setEditingWaypoints(prev => 
      prev.map(wp => 
        wp.id === waypointId 
          ? { ...wp, [field]: value }
          : wp
      )
    );
    setHasChanges(true);
  }, []);

  const handleSaveChanges = useCallback(() => {
    const validationResult = ValidationEngine.validate(editingWaypoints);
    onUpdate(editingWaypoints, [...validationResult.errors, ...validationResult.warnings]);
    setEditingId(null);
    setHasChanges(false);
  }, [editingWaypoints, onUpdate]);

  const handleToggleLock = useCallback((waypointId: string) => {
    const updatedWaypoints = editingWaypoints.map(wp =>
      wp.id === waypointId ? { ...wp, isLocked: !wp.isLocked } : wp
    );
    setEditingWaypoints(updatedWaypoints);
    
    // Auto-save lock state changes
    const validationResult = ValidationEngine.validate(updatedWaypoints);
    onUpdate(updatedWaypoints, [...validationResult.errors, ...validationResult.warnings]);
  }, [editingWaypoints, onUpdate]);

  const handleDeleteWaypoint = useCallback((waypointId: string) => {
    const updatedWaypoints = editingWaypoints.filter(wp => wp.id !== waypointId);
    setEditingWaypoints(updatedWaypoints);
    
    // Auto-save deletion
    const validationResult = ValidationEngine.validate(updatedWaypoints);
    onUpdate(updatedWaypoints, [...validationResult.errors, ...validationResult.warnings]);
  }, [editingWaypoints, onUpdate]);

  const renderEditableCell = useCallback((waypoint: WaypointData, field: keyof WaypointData, type: 'text' | 'number' = 'text') => {
    const isEditing = editingId === waypoint.id;
    const error = getFieldError(waypoint.id, field);
    const value = editingWaypoints.find(wp => wp.id === waypoint.id)?.[field] || '';

    if (!isEditing) {
      return (
        <div className={`${error ? 'text-red-600' : ''}`}>
          {String(value)}
          {error && <AlertTriangle className="h-3 w-3 inline ml-1 text-red-500" />}
        </div>
      );
    }

    return (
      <Input
        type={type}
        value={String(value)}
        onChange={(e) => {
          const newValue = type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
          handleFieldChange(waypoint.id, field, newValue);
        }}
        className={`h-8 ${error ? 'border-red-500' : ''}`}
        step={type === 'number' && (field === 'lat' || field === 'lon') ? '0.000001' : '1'}
      />
    );
  }, [editingId, editingWaypoints, getFieldError, handleFieldChange]);

  if (editingWaypoints.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No waypoints to display
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {validationErrors.filter(e => e.severity === 'error').length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            {validationErrors.filter(e => e.severity === 'error').length} validation errors found. 
            Fix all errors before proceeding with voyage creation.
          </AlertDescription>
        </Alert>
      )}

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">WP#</TableHead>
              <TableHead>Latitude</TableHead>
              <TableHead>Longitude</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>ETA</TableHead>
              <TableHead className="w-16">Lock</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {editingWaypoints.map((waypoint) => {
              const waypointErrors = getErrorsForWaypoint(waypoint.id);
              const hasErrors = waypointErrors.some(e => e.severity === 'error');
              
              return (
                <TableRow key={waypoint.id} className={hasErrors ? 'bg-red-50' : ''}>
                  <TableCell>
                    {renderEditableCell(waypoint, 'waypointNumber', 'number')}
                  </TableCell>
                  <TableCell>
                    {renderEditableCell(waypoint, 'lat', 'number')}
                  </TableCell>
                  <TableCell>
                    {renderEditableCell(waypoint, 'lon', 'number')}
                  </TableCell>
                  <TableCell>
                    {renderEditableCell(waypoint, 'name', 'text')}
                  </TableCell>
                  <TableCell>
                    {renderEditableCell(waypoint, 'eta', 'text')}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleLock(waypoint.id)}
                      className="h-8 w-8 p-0"
                    >
                      {waypoint.isLocked ? (
                        <Lock className="h-4 w-4 text-orange-500" />
                      ) : (
                        <Unlock className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {editingId === waypoint.id ? (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleSaveChanges}
                            className="h-8 w-8 p-0"
                            disabled={!hasChanges}
                          >
                            <Save className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCancelEdit}
                            className="h-8 w-8 p-0"
                          >
                            <X className="h-4 w-4 text-gray-400" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStartEdit(waypoint.id)}
                            className="h-8 w-8 p-0"
                          >
                            📝
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteWaypoint(waypoint.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {validationErrors.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Validation Issues:</h4>
          {validationErrors.map((error) => (
            <Alert key={error.id} variant={error.severity === 'error' ? 'destructive' : 'default'}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                <Badge variant="outline" className="mr-2 text-xs">
                  WP{editingWaypoints.find(wp => wp.id === error.waypointId)?.waypointNumber}
                </Badge>
                {error.message}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      <div className="text-xs text-muted-foreground">
        💡 Click the edit icon (📝) to modify waypoint data. Lock/unlock waypoints to control their usage in route calculations.
      </div>
    </div>
  );
};

export default EditableWaypointTable;