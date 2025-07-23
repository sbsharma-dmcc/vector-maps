import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileText, AlertTriangle, CheckCircle, Download, Edit3 } from 'lucide-react';
import { toast } from 'sonner';
import { FileProcessorFactory } from '@/utils/fileProcessors';
import { WaypointData, ValidationError, MIRUploadState } from '@/types/voyage';
import EditableWaypointTable from './EditableWaypointTable';

interface MIRUploadModuleProps {
  onWaypointsChange: (waypoints: WaypointData[]) => void;
  waypoints: WaypointData[];
}

const MIRUploadModule = ({ onWaypointsChange, waypoints }: MIRUploadModuleProps) => {
  const [mirEnabled, setMirEnabled] = useState(true);
  const [uploadState, setUploadState] = useState<MIRUploadState>({
    isUploaded: false,
    waypoints: [],
    validationErrors: [],
    isEditing: false
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [showTable, setShowTable] = useState(false);

  const handleMIRToggle = useCallback((enabled: boolean) => {
    setMirEnabled(enabled);
    if (!enabled) {
      setUploadState({
        isUploaded: false,
        waypoints: [],
        validationErrors: [],
        isEditing: false
      });
      onWaypointsChange([]);
      setShowTable(false);
    }
  }, [onWaypointsChange]);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    
    try {
      const result = await FileProcessorFactory.processFile(file);
      
      setUploadState({
        isUploaded: true,
        fileName: result.fileName,
        waypoints: result.waypoints,
        validationErrors: [...result.validationResult.errors, ...result.validationResult.warnings],
        isEditing: false
      });

      if (result.validationResult.isValid) {
        onWaypointsChange(result.waypoints);
        toast.success(`Successfully uploaded ${result.waypoints.length} waypoints`);
        setShowTable(true);
      } else {
        toast.error(`Validation failed: ${result.validationResult.errors.length} errors found`);
        setShowTable(true);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Upload failed');
      setUploadState(prev => ({
        ...prev,
        isUploaded: false
      }));
    } finally {
      setIsProcessing(false);
      // Reset file input
      event.target.value = '';
    }
  }, [onWaypointsChange]);

  const handleWaypointUpdate = useCallback((updatedWaypoints: WaypointData[], errors: ValidationError[]) => {
    setUploadState(prev => ({
      ...prev,
      waypoints: updatedWaypoints,
      validationErrors: errors
    }));
    
    if (errors.filter(e => e.severity === 'error').length === 0) {
      onWaypointsChange(updatedWaypoints);
    }
  }, [onWaypointsChange]);

  const downloadSampleCSV = useCallback(() => {
    const sampleData = [
      'Waypoint,Latitude,Longitude,Name,ETA',
      '1,22.3511,70.0364,Mumbai Port,2025-01-10T08:00:00Z',
      '2,19.0760,72.8777,Waypoint 2,2025-01-10T14:00:00Z',
      '3,8.4875,76.9525,Kochi Port,2025-01-11T06:00:00Z'
    ].join('\n');
    
    const blob = new Blob([sampleData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_mir_waypoints.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Sample CSV downloaded');
  }, []);

  const downloadCurrentAsCSV = useCallback(() => {
    if (uploadState.waypoints.length === 0) return;
    
    const csvData = [
      'Waypoint,Latitude,Longitude,Name,ETA',
      ...uploadState.waypoints.map(wp => 
        `${wp.waypointNumber},${wp.lat},${wp.lon},${wp.name || `WP${wp.waypointNumber}`},${wp.eta || ''}`
      )
    ].join('\n');
    
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${uploadState.fileName?.replace(/\.[^/.]+$/, '') || 'waypoints'}_modified.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Modified waypoints downloaded');
  }, [uploadState.waypoints, uploadState.fileName]);

  if (!mirEnabled) {
    return (
      <Card className="m-4 border-none shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Master Intended Route (MIR)
            </span>
            <Switch checked={mirEnabled} onCheckedChange={handleMIRToggle} />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            MIR upload is disabled. Enable to upload route waypoints.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="m-4 border-none shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Master Intended Route (MIR)
            </span>
            <Switch checked={mirEnabled} onCheckedChange={handleMIRToggle} />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!uploadState.isUploaded ? (
            <>
              <div>
                <Label className="text-sm font-medium">Upload Route File</Label>
                <div className="mt-2">
                  <Input
                    type="file"
                    accept=".csv,.rtz,.xml"
                    onChange={handleFileUpload}
                    disabled={isProcessing}
                    className="cursor-pointer"
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    📌 Uploaded waypoints will be locked by default.
                  </div>
                </div>
              </div>
              
              <div className="text-xs text-muted-foreground">
                Supported formats: .RTZ, .CSV
                <br />
                CSV format: Waypoint, Latitude, Longitude, Name, ETA
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={downloadSampleCSV}
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Sample CSV
              </Button>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm font-medium">{uploadState.fileName}</span>
                  {uploadState.validationErrors.filter(e => e.severity === 'error').length === 0 ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  )}
                </div>
                <Badge variant="secondary" className="text-xs">
                  {uploadState.waypoints.length} waypoints
                </Badge>
              </div>

              {uploadState.validationErrors.length > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    {uploadState.validationErrors.filter(e => e.severity === 'error').length} errors, {' '}
                    {uploadState.validationErrors.filter(e => e.severity === 'warning').length} warnings found.
                    {uploadState.validationErrors.filter(e => e.severity === 'error').length > 0 && 
                      ' Fix errors before proceeding.'}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowTable(!showTable)}
                  className="flex-1"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  {showTable ? 'Hide' : 'Edit'} Data
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={downloadCurrentAsCSV}
                  disabled={uploadState.waypoints.length === 0}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setUploadState({
                    isUploaded: false,
                    waypoints: [],
                    validationErrors: [],
                    isEditing: false
                  });
                  onWaypointsChange([]);
                  setShowTable(false);
                }}
                className="w-full"
              >
                Upload Different File
              </Button>
            </>
          )}
          
          {isProcessing && (
            <div className="text-sm text-muted-foreground text-center">
              Processing file...
            </div>
          )}
        </CardContent>
      </Card>

      {showTable && uploadState.isUploaded && (
        <Card className="m-4 border-none shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Waypoint Data</CardTitle>
          </CardHeader>
          <CardContent>
            <EditableWaypointTable
              waypoints={uploadState.waypoints}
              validationErrors={uploadState.validationErrors}
              onUpdate={handleWaypointUpdate}
            />
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default MIRUploadModule;