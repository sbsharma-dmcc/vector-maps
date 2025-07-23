import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const CreateVoyage = () => {
  const navigate = useNavigate();
  const [uploadMIR, setUploadMIR] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');
  const [jsonData, setJsonData] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  const handleFiles = (files: File[]) => {
    const validFiles = files.filter(file => 
      file.name.endsWith('.rtz') || file.name.endsWith('.csv')
    );

    if (validFiles.length === 0) {
      toast.error('Please upload .rtz or .csv files only');
      return;
    }

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        console.log(`File ${file.name} loaded:`, e.target?.result);
        toast.success(`${file.name} uploaded successfully`);
      };
      reader.readAsText(file);
    });
  };

  const handleJsonSubmit = () => {
    if (!jsonData.trim()) {
      toast.error('Please enter JSON data');
      return;
    }

    try {
      JSON.parse(jsonData);
      toast.success('JSON data processed successfully');
      console.log('JSON Data:', jsonData);
    } catch (error) {
      toast.error('Invalid JSON format');
    }
  };

  const handleCreateVoyage = () => {
    toast.success('Voyage created successfully!');
    navigate('/routes');
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Create New Voyage</h1>
        <p className="text-muted-foreground">
          Set up your voyage route and configuration
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="w-8 h-8 bg-foreground text-background rounded-full flex items-center justify-center text-sm font-bold">
              3
            </div>
            Master Intended Route
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <label className="text-base font-medium">
              Upload Master Intended Route (MIR)?
            </label>
            <Switch
              checked={uploadMIR}
              onCheckedChange={setUploadMIR}
            />
          </div>

          {uploadMIR && (
            <div className="space-y-4">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="upload">Upload File</TabsTrigger>
                  <TabsTrigger value="json">Paste JSON</TabsTrigger>
                </TabsList>
                
                <TabsContent value="upload" className="space-y-4">
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      dragOver 
                        ? 'border-primary bg-primary/5' 
                        : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <div className="space-y-2">
                      <p className="text-lg text-muted-foreground">
                        Drag and drop your RTZ or CSV file here, or
                      </p>
                      <Button variant="outline" onClick={() => document.getElementById('file-upload')?.click()}>
                        Browse Files
                      </Button>
                      <input
                        id="file-upload"
                        type="file"
                        multiple
                        accept=".rtz,.csv"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mt-4">
                      Supports .rtz and .csv formats
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="json" className="space-y-4">
                  <Textarea
                    placeholder="Paste your JSON route data here..."
                    value={jsonData}
                    onChange={(e) => setJsonData(e.target.value)}
                    className="min-h-32"
                  />
                  <Button onClick={handleJsonSubmit} className="w-full">
                    Process JSON
                  </Button>
                </TabsContent>
              </Tabs>
            </div>
          )}

          <div className="bg-muted/50 rounded-lg p-4 flex items-start gap-3">
            <Info className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <p className="text-sm text-muted-foreground">
              Uploaded waypoints will be locked by default.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3 justify-end">
        <Button variant="outline" onClick={() => navigate('/routes')}>
          Cancel
        </Button>
        <Button onClick={handleCreateVoyage}>
          Create Voyage
        </Button>
      </div>
    </div>
  );
};

export default CreateVoyage;