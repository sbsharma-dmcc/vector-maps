
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Save, X, Palette } from 'lucide-react';

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
  const [selectedWeatherType, setSelectedWeatherType] = useState('pressure-gradient');
  const [config, setConfig] = useState({
    // Gradient/Heatmap settings
    fillOpacity: 0.8,
    heatmapIntensity: 2.5,
    heatmapRadius: 25,
    heatmapWeight: 1,
    
    // Line settings
    lineOpacity: 0.8,
    lineWidth: 2,
    
    // Color scheme
    colorScheme: 'default',
    customColors: {
      lowPressure: '#0066cc',
      mediumPressure: '#ffff00',
      highPressure: '#ff3300'
    },
    
    // Animation
    enableAnimation: false,
    animationSpeed: 1,
    
    // Advanced settings
    blendMode: 'normal',
    smoothing: true,
    contourInterval: 4
  });

  const colorSchemes = {
    default: 'Default Blue-Red',
    rainbow: 'Rainbow Spectrum',
    ocean: 'Ocean Blue',
    thermal: 'Thermal',
    viridis: 'Viridis',
    custom: 'Custom Colors'
  };

  const blendModes = {
    normal: 'Normal',
    multiply: 'Multiply',
    screen: 'Screen',
    overlay: 'Overlay',
    'color-dodge': 'Color Dodge'
  };

  if (!isOpen) return null;

  const updateConfigValue = (property: string, value: any) => {
    if (property.includes('.')) {
      const [parent, child] = property.split('.');
      setConfig(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setConfig(prev => ({
        ...prev,
        [property]: value
      }));
    }
  };

  const handleApply = () => {
    onApplyConfig(selectedWeatherType, config);
    onClose();
  };

  const resetToDefaults = () => {
    setConfig({
      fillOpacity: 0.8,
      heatmapIntensity: 2.5,
      heatmapRadius: 25,
      heatmapWeight: 1,
      lineOpacity: 0.8,
      lineWidth: 2,
      colorScheme: 'default',
      customColors: {
        lowPressure: '#0066cc',
        mediumPressure: '#ffff00',
        highPressure: '#ff3300'
      },
      enableAnimation: false,
      animationSpeed: 1,
      blendMode: 'normal',
      smoothing: true,
      contourInterval: 4
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg p-6 min-w-[500px] max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Weather Layer Configuration</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-6">
          {/* Layer Type Selection */}
          <div>
            <Label className="block text-sm font-medium mb-2">Weather Layer Type</Label>
            <Select value={selectedWeatherType} onValueChange={setSelectedWeatherType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pressure-gradient">Pressure Gradient (Heatmap)</SelectItem>
                <SelectItem value="pressure-lines">Pressure Lines (Contours)</SelectItem>
                <SelectItem value="wind">Wind Speed</SelectItem>
                <SelectItem value="swell">Swell Height</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Color Configuration */}
          <div className="border-t pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Palette className="h-4 w-4" />
              <Label className="text-sm font-medium">Color Configuration</Label>
            </div>
            
            <div className="space-y-3">
              <div>
                <Label className="text-sm">Color Scheme</Label>
                <Select value={config.colorScheme} onValueChange={(value) => updateConfigValue('colorScheme', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(colorSchemes).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {config.colorScheme === 'custom' && (
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs">Low Pressure</Label>
                    <Input
                      type="color"
                      value={config.customColors.lowPressure}
                      onChange={(e) => updateConfigValue('customColors.lowPressure', e.target.value)}
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Medium Pressure</Label>
                    <Input
                      type="color"
                      value={config.customColors.mediumPressure}
                      onChange={(e) => updateConfigValue('customColors.mediumPressure', e.target.value)}
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">High Pressure</Label>
                    <Input
                      type="color"
                      value={config.customColors.highPressure}
                      onChange={(e) => updateConfigValue('customColors.highPressure', e.target.value)}
                      className="h-8"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Layer-specific settings */}
          {selectedWeatherType === 'pressure-gradient' && (
            <div className="border-t pt-4">
              <Label className="text-sm font-medium mb-3 block">Heatmap Settings</Label>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-sm">Fill Opacity</Label>
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[config.fillOpacity]}
                      onValueChange={([value]) => updateConfigValue('fillOpacity', value)}
                      min={0}
                      max={1}
                      step={0.1}
                      className="flex-1"
                    />
                    <span className="text-sm w-12">{config.fillOpacity.toFixed(1)}</span>
                  </div>
                </div>

                <div>
                  <Label className="text-sm">Heatmap Intensity</Label>
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[config.heatmapIntensity]}
                      onValueChange={([value]) => updateConfigValue('heatmapIntensity', value)}
                      min={0.5}
                      max={5}
                      step={0.1}
                      className="flex-1"
                    />
                    <span className="text-sm w-12">{config.heatmapIntensity.toFixed(1)}</span>
                  </div>
                </div>

                <div>
                  <Label className="text-sm">Heatmap Radius</Label>
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

                <div>
                  <Label className="text-sm">Weight Factor</Label>
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[config.heatmapWeight]}
                      onValueChange={([value]) => updateConfigValue('heatmapWeight', value)}
                      min={0.1}
                      max={3}
                      step={0.1}
                      className="flex-1"
                    />
                    <span className="text-sm w-12">{config.heatmapWeight.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedWeatherType === 'pressure-lines' && (
            <div className="border-t pt-4">
              <Label className="text-sm font-medium mb-3 block">Line Settings</Label>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-sm">Line Opacity</Label>
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[config.lineOpacity]}
                      onValueChange={([value]) => updateConfigValue('lineOpacity', value)}
                      min={0}
                      max={1}
                      step={0.1}
                      className="flex-1"
                    />
                    <span className="text-sm w-12">{config.lineOpacity.toFixed(1)}</span>
                  </div>
                </div>

                <div>
                  <Label className="text-sm">Line Width</Label>
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[config.lineWidth]}
                      onValueChange={([value]) => updateConfigValue('lineWidth', value)}
                      min={0.5}
                      max={5}
                      step={0.5}
                      className="flex-1"
                    />
                    <span className="text-sm w-12">{config.lineWidth}</span>
                  </div>
                </div>

                <div>
                  <Label className="text-sm">Contour Interval (hPa)</Label>
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[config.contourInterval]}
                      onValueChange={([value]) => updateConfigValue('contourInterval', value)}
                      min={1}
                      max={10}
                      step={1}
                      className="flex-1"
                    />
                    <span className="text-sm w-12">{config.contourInterval}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Advanced Settings */}
          <div className="border-t pt-4">
            <Label className="text-sm font-medium mb-3 block">Advanced Settings</Label>
            
            <div className="space-y-4">
              <div>
                <Label className="text-sm">Blend Mode</Label>
                <Select value={config.blendMode} onValueChange={(value) => updateConfigValue('blendMode', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(blendModes).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-sm">Enable Smoothing</Label>
                <Switch
                  checked={config.smoothing}
                  onCheckedChange={(checked) => updateConfigValue('smoothing', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-sm">Enable Animation</Label>
                <Switch
                  checked={config.enableAnimation}
                  onCheckedChange={(checked) => updateConfigValue('enableAnimation', checked)}
                />
              </div>

              {config.enableAnimation && (
                <div>
                  <Label className="text-sm">Animation Speed</Label>
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[config.animationSpeed]}
                      onValueChange={([value]) => updateConfigValue('animationSpeed', value)}
                      min={0.1}
                      max={3}
                      step={0.1}
                      className="flex-1"
                    />
                    <span className="text-sm w-12">{config.animationSpeed.toFixed(1)}x</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t">
            <Button onClick={handleApply} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              Apply Configuration
            </Button>
            <Button variant="outline" onClick={resetToDefaults}>
              Reset
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherConfigPopup;
