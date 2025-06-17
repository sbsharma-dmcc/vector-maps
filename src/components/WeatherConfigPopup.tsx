
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Save, X } from 'lucide-react';

interface WeatherConfigPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyConfig: (layerType: string, config: any) => void;
}

const WeatherConfigPopup: React.FC<WeatherConfigPopupProps> = ({
  isOpen,
  onClose,
  onApplyConfig
}) => {
  const [selectedWeatherType, setSelectedWeatherType] = useState('pressure');
  const [config, setConfig] = useState({
    fillOpacity: 0.8,
    heatmapIntensity: 2.5,
    heatmapRadius: 25
  });

  if (!isOpen) return null;

  const updateConfigValue = (property: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [property]: value
    }));
  };

  const handleApply = () => {
    onApplyConfig(selectedWeatherType, config);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg p-6 min-w-[400px] max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Weather Layer Configuration</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="block text-sm font-medium mb-1">Weather Type</Label>
            <Select value={selectedWeatherType} onValueChange={setSelectedWeatherType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pressure">Pressure</SelectItem>
                <SelectItem value="pressure-lines">Pressure Lines</SelectItem>
                <SelectItem value="wind">Wind</SelectItem>
                <SelectItem value="swell">Swell</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedWeatherType.includes('pressure') && (
            <>
              <div>
                <Label className="text-sm font-medium">Fill Opacity</Label>
                <div className="flex items-center gap-2">
                  <Slider
                    value={[config.fillOpacity]}
                    onValueChange={([value]) => updateConfigValue('fillOpacity', value)}
                    min={0}
                    max={1}
                    step={0.1}
                    className="flex-1"
                  />
                  <span className="text-sm w-12">{config.fillOpacity}</span>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Heatmap Intensity</Label>
                <div className="flex items-center gap-2">
                  <Slider
                    value={[config.heatmapIntensity]}
                    onValueChange={([value]) => updateConfigValue('heatmapIntensity', value)}
                    min={0.5}
                    max={5}
                    step={0.1}
                    className="flex-1"
                  />
                  <span className="text-sm w-12">{config.heatmapIntensity}</span>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Heatmap Radius</Label>
                <div className="flex items-center gap-2">
                  <Slider
                    value={[config.heatmapRadius]}
                    onValueChange={([value]) => updateConfigValue('heatmapRadius', value)}
                    min={10}
                    max={100}
                    step={5}
                    className="flex-1"
                  />
                  <span className="text-sm w-12">{config.heatmapRadius}</span>
                </div>
              </div>
            </>
          )}

          <div className="flex gap-2 pt-4">
            <Button onClick={handleApply} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              Apply Configuration
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherConfigPopup;
