import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
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
  const [jsonText, setJsonText] = useState('');
  const [textData, setTextData] = useState('');

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

  const handleTextUpload = useCallback(async () => {
    if (!textData.trim()) {
      toast.error('Please enter waypoint data');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Parse flexible text format - extract coordinates and names
      const lines = textData.split('\n').filter(line => line.trim());
      const waypoints: WaypointData[] = [];
      
      lines.forEach((line, index) => {
        const coordMatch = line.match(/(-?\d+\.?\d*)[,\s]+(-?\d+\.?\d*)/);
        if (coordMatch) {
          const lat = parseFloat(coordMatch[1]);
          const lon = parseFloat(coordMatch[2]);
          
          if (lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
            // Extract name (everything before coordinates or after)
            const name = line.replace(coordMatch[0], '').replace(/[,\s]+/g, ' ').trim() || `Waypoint ${index + 1}`;
            
            waypoints.push({
              id: `wp-${Date.now()}-${index}`,
              lat,
              lon,
              waypointNumber: index + 1,
              isLocked: true,
              isPassed: false,
              createdFrom: 'upload',
              timestamp: new Date().toISOString(),
              name: name
            });
          }
        }
      });

      if (waypoints.length === 0) {
        throw new Error('No valid coordinates found in the text');
      }

      setUploadState({
        isUploaded: true,
        fileName: 'Pasted Text Data',
        waypoints,
        validationErrors: [],
        isEditing: false
      });

      onWaypointsChange(waypoints);
      toast.success(`Successfully processed ${waypoints.length} waypoints from text`);
      setShowTable(true);
      setTextData('');
    } catch (error) {
      console.error('Text processing error:', error);
      toast.error(error instanceof Error ? error.message : 'Text processing failed');
    } finally {
      setIsProcessing(false);
    }
  }, [textData, onWaypointsChange]);

  const handleJsonUpload = useCallback(async () => {
    if (!jsonText.trim()) {
      toast.error('Please enter JSON data');
      return;
    }

    setIsProcessing(true);
    
    try {
      console.log('Processing JSON:', jsonText);
      const result = await FileProcessorFactory.processJSONString(jsonText);
      console.log('Processing result:', result);
      
      setUploadState({
        isUploaded: true,
        fileName: 'Pasted JSON Data',
        waypoints: result.waypoints,
        validationErrors: [...result.validationResult.errors, ...result.validationResult.warnings],
        isEditing: false
      });

      if (result.validationResult.isValid) {
        onWaypointsChange(result.waypoints);
        toast.success(`Successfully processed ${result.waypoints.length} waypoints from JSON`);
        setShowTable(true);
        setJsonText('');
      } else {
        toast.error(`Validation failed: ${result.validationResult.errors.length} errors found`);
        setShowTable(true);
      }
    } catch (error) {
      console.error('JSON processing error:', error);
      toast.error(error instanceof Error ? error.message : 'JSON processing failed');
    } finally {
      setIsProcessing(false);
    }
  }, [jsonText, onWaypointsChange]);

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
            <Tabs defaultValue="upload" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="upload">Upload File</TabsTrigger>
                <TabsTrigger value="text">Paste Text</TabsTrigger>
                <TabsTrigger value="json">Paste JSON</TabsTrigger>
              </TabsList>
              
              <TabsContent value="upload" className="space-y-4">
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center space-y-4">
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto" />
                  <div className="space-y-2">
                    <p className="text-muted-foreground">
                      Drag and drop your RTZ or CSV file here, or
                    </p>
                    <Input
                      type="file"
                      accept=".csv,.rtz,.xml"
                      onChange={handleFileUpload}
                      disabled={isProcessing}
                      className="hidden"
                      id="file-upload"
                    />
                    <Button 
                      variant="outline" 
                      asChild
                      disabled={isProcessing}
                    >
                      <label htmlFor="file-upload" className="cursor-pointer">
                        Browse Files
                      </label>
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Supports .rtz and .csv formats
                  </div>
                </div>
                
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    Uploaded waypoints will be locked by default.
                  </AlertDescription>
                </Alert>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={downloadSampleCSV}
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Sample CSV
                </Button>
              </TabsContent>
              
              <TabsContent value="text" className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Paste Waypoint Text</Label>
                  <Textarea
                    placeholder="Paste waypoint data from chat or email here...
Example:
Mumbai Port 22.3511, 70.0364
Waypoint 2 19.0760, 72.8777
Kochi Port 8.4875 76.9525"
                    value={textData}
                    onChange={(e) => setTextData(e.target.value)}
                    className="min-h-[200px] text-sm"
                    disabled={isProcessing}
                  />
                </div>
                
                <Button 
                  onClick={handleTextUpload}
                  disabled={isProcessing || !textData.trim()}
                  className="w-full"
                >
                  Process Text Data
                </Button>
                
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    Text waypoints will be locked by default. Supports coordinates in any format.
                  </AlertDescription>
                </Alert>
              </TabsContent>
              
              <TabsContent value="json" className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Paste JSON Data</Label>
                  <Textarea
                    placeholder="Paste your waypoint JSON data here..."
                    value={jsonText}
                    onChange={(e) => setJsonText(e.target.value)}
                    className="min-h-[200px] font-mono text-sm"
                    disabled={isProcessing}
                  />
                </div>
                
                <Button 
                  onClick={handleJsonUpload}
                  disabled={isProcessing || !jsonText.trim()}
                  className="w-full"
                >
                  Process JSON Data
                </Button>
                
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    JSON waypoints will be locked by default.
                  </AlertDescription>
                </Alert>
              </TabsContent>
            </Tabs>
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