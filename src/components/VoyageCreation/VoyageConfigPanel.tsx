import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Ship, Settings, Clock } from 'lucide-react';

interface VoyageConfigPanelProps {
  voyageName: string;
  setVoyageName: (name: string) => void;
  vesselName: string;
  setVesselName: (name: string) => void;
}

const VoyageConfigPanel = ({ voyageName, setVoyageName, vesselName, setVesselName }: VoyageConfigPanelProps) => {
  const [optimizationType, setOptimizationType] = useState('fixed-arrival');
  const [departureDate, setDepartureDate] = useState('2025-01-05 16:21 UTC');
  const [fromPort, setFromPort] = useState('Colombo Port');
  const [toPort, setToPort] = useState('');
  const [ecaFuel, setEcaFuel] = useState('3000');
  const [nonEcaFuel, setNonEcaFuel] = useState('2000');
  const [hireRate, setHireRate] = useState('1000');
  const [otherCost, setOtherCost] = useState('2200');
  const [draftFore, setDraftFore] = useState('13.5');
  const [draftAft, setDraftAft] = useState('13.5');
  const [showWeatherConstraints, setShowWeatherConstraints] = useState(false);
  const [showVesselInfo, setShowVesselInfo] = useState(false);

  return (
    <div className="w-80 bg-background border-r border-border h-full overflow-y-auto">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4">
        <div className="flex items-center gap-2 mb-2">
          <Ship className="h-5 w-5" />
          <span className="font-medium">Ocean Sovereign</span>
          <Badge variant="secondary" className="text-xs">VOYAGE</Badge>
        </div>
        <div className="text-sm opacity-90">Somalia ► Mumbai</div>
      </div>

      {/* Voyage Details Card */}
      <Card className="m-4 border-none shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Voyage Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm">From *</Label>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-4 h-4 bg-orange-500 rounded-sm"></div>
              <Input 
                value={fromPort}
                onChange={(e) => setFromPort(e.target.value)}
                className="text-sm"
              />
            </div>
          </div>
          
          <div>
            <Label className="text-sm">Start *</Label>
            <Input 
              value={departureDate}
              onChange={(e) => setDepartureDate(e.target.value)}
              className="text-sm"
            />
            <Button variant="link" className="text-xs text-primary p-0 h-auto">
              Add Waypoint
            </Button>
          </div>
          
          <div>
            <Label className="text-sm">To *</Label>
            <Input 
              value={toPort}
              onChange={(e) => setToPort(e.target.value)}
              placeholder="Search for a port..."
              className="text-sm"
            />
            <div className="text-xs text-red-500">Incorrect Port Name</div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-sm">Draft Fore *</Label>
              <Input 
                value={draftFore}
                onChange={(e) => setDraftFore(e.target.value)}
                className="text-sm"
              />
            </div>
            <div>
              <Label className="text-sm">Draft Aft *</Label>
              <Input 
                value={draftAft}
                onChange={(e) => setDraftAft(e.target.value)}
                className="text-sm"
              />
            </div>
          </div>
          
          <div>
            <Label className="text-sm">Contacts</Label>
            <div className="flex gap-1 mt-1">
              <Badge variant="secondary" className="text-xs">Dinesh@gmail.com</Badge>
              <Badge variant="secondary" className="text-xs">Ravi@gmail.com</Badge>
            </div>
          </div>
          
          <div>
            <Label className="text-sm">Update Interval</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input value="—" className="text-sm" />
              <span className="text-xs text-muted-foreground">12 Hrs</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Card */}
      <Card className="m-4 border-none shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configurations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Optimization Type */}
          <div>
            <Label className="text-sm font-medium">Optimisation Type</Label>
            <RadioGroup value={optimizationType} onValueChange={setOptimizationType} className="mt-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fixed-arrival" id="fixed-arrival" />
                <Label htmlFor="fixed-arrival" className="text-sm">Fixed Arrival</Label>
              </div>
              <div className="text-xs text-muted-foreground ml-6">Select to optimise based on Arrival</div>
              
              <Input 
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                className="text-sm"
              />
              
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="smart-optimization" id="smart-optimization" />
                <Label htmlFor="smart-optimization" className="text-sm">Smart Optimisation</Label>
              </div>
              <div className="text-xs text-muted-foreground ml-6">Select to optimise based on lowest overall</div>
              
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="weather-routing" id="weather-routing" />
                <Label htmlFor="weather-routing" className="text-sm">Weather Routing</Label>
              </div>
              <div className="text-xs text-muted-foreground ml-6">Select to optimise based on weather</div>
            </RadioGroup>
          </div>

          {/* Cost Section */}
          <div>
            <Label className="text-sm font-medium">Cost</Label>
            <div className="space-y-3 mt-2">
              <div>
                <Label className="text-xs text-muted-foreground">ECA Fuel ($/Metric Tonne)</Label>
                <Input 
                  value={ecaFuel}
                  onChange={(e) => setEcaFuel(e.target.value)}
                  className="text-sm"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Non ECA Fuel ($/Metric Tonne)</Label>
                <Input 
                  value={nonEcaFuel}
                  onChange={(e) => setNonEcaFuel(e.target.value)}
                  className="text-sm"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Hire Rate ($/Day)</Label>
                <Input 
                  value={hireRate}
                  onChange={(e) => setHireRate(e.target.value)}
                  className="text-sm"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Other Fixed Cost per Voyage</Label>
                <Input 
                  value={otherCost}
                  onChange={(e) => setOtherCost(e.target.value)}
                  className="text-sm"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weather Constraints Dialog */}
      <Dialog open={showWeatherConstraints} onOpenChange={setShowWeatherConstraints}>
        <DialogTrigger asChild>
          <Button variant="outline" className="mx-4 mb-2 w-[calc(100%-2rem)]">
            Weather Constraints
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Weather Constraints</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm">Terms Title Max</Label>
                <Input placeholder="22" className="text-sm" />
              </div>
              <div>
                <Label className="text-sm">Trop Dep</Label>
                <Input placeholder="220" className="text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm">Max Wind (10m)</Label>
                <Input placeholder="220" className="text-sm" />
              </div>
              <div>
                <Label className="text-sm">Max Wind (10m)</Label>
                <Input placeholder="220" className="text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm">Period</Label>
                <Input placeholder="220" className="text-sm" />
              </div>
              <div>
                <Label className="text-sm">Head Waves</Label>
                <Input placeholder="220" className="text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm">Trop Dep</Label>
                <Input placeholder="220" className="text-sm" />
              </div>
              <div>
                <Label className="text-sm">Head Waves</Label>
                <Input placeholder="220" className="text-sm" />
              </div>
            </div>
            <div>
              <Label className="text-sm">Following Waves</Label>
              <Input className="text-sm" />
            </div>
            <div>
              <Label className="text-sm">HETR</Label>
              <Input className="text-sm" />
            </div>
            <Button className="w-full">Save</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Vessel Information Dialog */}
      <Dialog open={showVesselInfo} onOpenChange={setShowVesselInfo}>
        <DialogTrigger asChild>
          <Button variant="outline" className="mx-4 mb-4 w-[calc(100%-2rem)]">
            View Vessel Info
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Vessel Information</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm">Name</Label>
                <div className="text-sm">Ocean Sovereign</div>
              </div>
              <div>
                <Label className="text-sm">IMO</Label>
                <div className="text-sm">9750211</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm">Type</Label>
                <div className="text-sm">Cargo</div>
              </div>
              <div>
                <Label className="text-sm">LOA BEAM (Draft)</Label>
                <div className="text-sm">Sol 25m</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm">Built</Label>
                <div className="text-sm">2011</div>
              </div>
              <div>
                <Label className="text-sm">Capacity</Label>
                <div className="text-sm">101</div>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Contact Information</Label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm">Principal</Label>
                <div className="text-sm">Scorpio</div>
              </div>
              <div>
                <Label className="text-sm">Vessel Email ID</Label>
                <div className="text-sm">VShree@oceaninfo.com</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm">Contact Email</Label>
                <div className="text-sm">Dinesh@gmail.com</div>
              </div>
              <div>
                <Label className="text-sm">Technical Manager</Label>
                <div className="text-sm">Jagadeesh</div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VoyageConfigPanel;