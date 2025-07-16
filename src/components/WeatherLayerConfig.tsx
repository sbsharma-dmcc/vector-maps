
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Save, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LayerConfigs {
  wind: any;
  pressure: {
    contourWidth: number;
    contourOpacity: number;
    highPressureColor: string;
    mediumPressureColor: string;
    lowPressureColor: string;
  };
  swell: any;
  symbol: any;
  tropicalStorms: {
    opacity: number;
    showLabels: boolean;
  };
}

const WeatherLayerConfig: React.FC = () => {
  const [selectedWeatherType, setSelectedWeatherType] = useState('wind');
  const { toast } = useToast();
  
  const [layerConfigs, setLayerConfigs] = useState<LayerConfigs>({
    wind: {
      textColor: '#ffffff',
      textSize: 16,
      textOpacity: 0.9,
      haloColor: '#000000',
      haloWidth: 1,
      symbolSpacing: 80,
      allowOverlap: true,
      barbStyle: 'full',
      speedUnit: 'knots'
    },
    pressure: {
      contourWidth: 1,
      contourOpacity: 0.8,
      highPressureColor: '#ff0000',
      mediumPressureColor: '#80ff80',
      lowPressureColor: '#800080'
    },
    swell: {
      fillOpacity: 0.9,
      fillOutlineColor: 'transparent',
      animationSpeed: 0.0008,
      animationEnabled: true,
      fillAntialias: true,
      smoothing: true,
      blurRadius: 2,
      edgeFeathering: 1.5,
      gradient: [
        { value: '0m', color: 'rgba(30, 50, 80, 0.3)', opacity: 0.3 },
        { value: '0.5m', color: 'rgba(45, 85, 120, 0.4)', opacity: 0.4 },
        { value: '1m', color: 'rgba(60, 120, 160, 0.5)', opacity: 0.5 },
        { value: '1.5m', color: 'rgba(80, 150, 180, 0.55)', opacity: 0.55 },
        { value: '2m', color: 'rgba(100, 180, 200, 0.6)', opacity: 0.6 },
        { value: '2.5m', color: 'rgba(120, 200, 180, 0.65)', opacity: 0.65 },
        { value: '3m', color: 'rgba(140, 210, 160, 0.7)', opacity: 0.7 },
        { value: '3.5m', color: 'rgba(160, 220, 140, 0.75)', opacity: 0.75 },
        { value: '4m', color: 'rgba(180, 230, 120, 0.8)', opacity: 0.8 },
        { value: '4.5m', color: 'rgba(200, 235, 100, 0.82)', opacity: 0.82 },
        { value: '5m', color: 'rgba(220, 220, 80, 0.84)', opacity: 0.84 },
        { value: '5.5m', color: 'rgba(240, 200, 60, 0.86)', opacity: 0.86 },
        { value: '6m', color: 'rgba(250, 180, 50, 0.88)', opacity: 0.88 },
        { value: '6.5m', color: 'rgba(255, 160, 40, 0.9)', opacity: 0.9 },
        { value: '7m', color: 'rgba(255, 140, 35, 0.9)', opacity: 0.9 },
        { value: '7.5m', color: 'rgba(255, 120, 30, 0.9)', opacity: 0.9 },
        { value: '8m', color: 'rgba(255, 100, 25, 0.9)', opacity: 0.9 },
        { value: '8.5m', color: 'rgba(250, 80, 20, 0.9)', opacity: 0.9 },
        { value: '9m', color: 'rgba(240, 60, 15, 0.9)', opacity: 0.9 },
        { value: '9.5m', color: 'rgba(220, 40, 10, 0.9)', opacity: 0.9 },
        { value: '10m+', color: 'rgba(200, 20, 5, 0.9)', opacity: 0.9 }
      ]
    },
    symbol: {
      textColor: '#ff0000',
      textSize: 16,
      textOpacity: 0.8,
      haloColor: '#000000',
      haloWidth: 1,
      symbolSpacing: 100,
      allowOverlap: true,
      rotationAlignment: 'map',
      symbolType: 'arrow',
      customSymbol: '→'
    },
    tropicalStorms: {
      opacity: 0.8,
      showLabels: true
    }
  });

  // Function to get symbol based on type
  const getSymbolByType = (symbolType: string, customSymbol?: string) => {
    switch (symbolType) {
      case 'arrow':
        return '→';
      case 'triangle':
        return '▲';
      case 'circle':
        return '●';
      case 'square':
        return '■';
      case 'custom':
        return customSymbol || '→';
      default:
        return '→';
    }
  };

  // Enhanced configuration update functions
  const updateConfigValue = (layerType: string, property: string, value: any) => {
    setLayerConfigs(prev => ({
      ...prev,
      [layerType]: {
        ...prev[layerType],
        [property]: value
      }
    }));
  };

  const updateSwellGradientItem = (index: number, field: 'value' | 'color', newValue: string) => {
    setLayerConfigs(prev => ({
      ...prev,
      swell: {
        ...prev.swell,
        gradient: prev.swell.gradient.map((item: any, i: number) => 
          i === index ? { ...item, [field]: newValue } : item
        )
      }
    }));
  };

  const addSwellGradientItem = () => {
    const newItem = { value: '0m', color: 'rgba(100, 100, 100, 0.5)', opacity: 0.5 };
    setLayerConfigs(prev => ({
      ...prev,
      swell: {
        ...prev.swell,
        gradient: [...prev.swell.gradient, newItem]
      }
    }));
  };

  const removeSwellGradientItem = (index: number) => {
    setLayerConfigs(prev => ({
      ...prev,
      swell: {
        ...prev.swell,
        gradient: prev.swell.gradient.filter((_: any, i: number) => i !== index)
      }
    }));
  };

  const convertRgbaToHex = (rgba: string) => {
    const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (!match) return '#000000';
    
    const r = parseInt(match[1]);
    const g = parseInt(match[2]);
    const b = parseInt(match[3]);
    
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  };

  const convertHexToRgba = (hex: string, opacity: number = 1) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return 'rgba(0, 0, 0, 1)';
    
    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  const applyLayerConfiguration = () => {
    // Emit custom event with configuration for MapboxMap to listen to
    const configEvent = new CustomEvent('weatherConfigUpdate', {
      detail: {
        layerType: selectedWeatherType,
        config: layerConfigs[selectedWeatherType]
      }
    });
    window.dispatchEvent(configEvent);

    toast({
      title: "Configuration Applied",
      description: `${selectedWeatherType} layer configuration updated`
    });
  };

  const convertRgbToHex = (rgbString: string) => {
    const match = rgbString.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (!match) return rgbString;
    
    const r = parseInt(match[1]);
    const g = parseInt(match[2]);
    const b = parseInt(match[3]);
    
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  };

  const convertHexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return hex;
    
    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    
    return `rgb(${r}, ${g}, ${b})`;
  };

  const renderConfigurationPanel = () => {
    const config = layerConfigs[selectedWeatherType];

    return (
      <div className="space-y-4">
        {selectedWeatherType === 'pressure' && (
          <>
            <div className="flex items-center justify-between mb-4">
              <Label className="text-sm font-medium text-gray-700">Pressure Configuration</Label>
            </div>

            <div>
              <Label className="text-xs font-medium text-gray-700">Contour Width</Label>
              <Slider
                value={[config.contourWidth || 1]}
                onValueChange={([value]) => updateConfigValue('pressure', 'contourWidth', value)}
                min={0.5}
                max={5}
                step={0.1}
                className="flex-1"
              />
            </div>

            <div>
              <Label className="text-xs font-medium text-gray-700">Contour Opacity</Label>
              <Slider
                value={[config.contourOpacity || 0.8]}
                onValueChange={([value]) => updateConfigValue('pressure', 'contourOpacity', value)}
                min={0}
                max={1}
                step={0.05}
                className="flex-1"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-xs font-medium text-gray-700">Pressure Line Colors</Label>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-gray-600 w-20">High (1030mb+)</Label>
                  <Input
                    type="color"
                    value={config.highPressureColor}
                    onChange={(e) => updateConfigValue('pressure', 'highPressureColor', e.target.value)}
                    className="w-16 h-8 p-0 border-2"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-gray-600 w-20">Medium (1000-1030mb)</Label>
                  <Input
                    type="color"
                    value={config.mediumPressureColor}
                    onChange={(e) => updateConfigValue('pressure', 'mediumPressureColor', e.target.value)}
                    className="w-16 h-8 p-0 border-2"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-gray-600 w-20">Low (980-1000mb)</Label>
                  <Input
                    type="color"
                    value={config.lowPressureColor}
                    onChange={(e) => updateConfigValue('pressure', 'lowPressureColor', e.target.value)}
                    className="w-16 h-8 p-0 border-2"
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {selectedWeatherType === 'wind' && (
          <>
            <div>
              <Label className="text-xs font-medium text-gray-700">Wind Barb Color</Label>
              <Input
                type="color"
                value={config.textColor}
                onChange={(e) => updateConfigValue('wind', 'textColor', e.target.value)}
                className="w-full h-8"
              />
            </div>

            <div>
              <Label className="text-xs font-medium text-gray-700">Wind Barb Size</Label>
              <Slider
                value={[config.textSize]}
                onValueChange={([value]) => updateConfigValue('wind', 'textSize', value)}
                min={8}
                max={32}
                step={1}
                className="flex-1"
              />
            </div>

            <div>
              <Label className="text-xs font-medium text-gray-700">Wind Barb Opacity</Label>
              <Slider
                value={[config.textOpacity]}
                onValueChange={([value]) => updateConfigValue('wind', 'textOpacity', value)}
                min={0}
                max={1}
                step={0.1}
                className="flex-1"
              />
            </div>

            <div>
              <Label className="text-xs font-medium text-gray-700">Halo Color</Label>
              <Input
                type="color"
                value={config.haloColor}
                onChange={(e) => updateConfigValue('wind', 'haloColor', e.target.value)}
                className="w-full h-8"
              />
            </div>

            <div>
              <Label className="text-xs font-medium text-gray-700">Halo Width</Label>
              <Slider
                value={[config.haloWidth]}
                onValueChange={([value]) => updateConfigValue('wind', 'haloWidth', value)}
                min={0}
                max={5}
                step={0.5}
                className="flex-1"
              />
            </div>

            <div>
              <Label className="text-xs font-medium text-gray-700">Barb Spacing</Label>
              <Slider
                value={[config.symbolSpacing]}
                onValueChange={([value]) => updateConfigValue('wind', 'symbolSpacing', value)}
                min={20}
                max={200}
                step={10}
                className="flex-1"
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={config.allowOverlap}
                onCheckedChange={(checked) => updateConfigValue('wind', 'allowOverlap', checked)}
              />
              <Label className="text-xs">Allow Overlap</Label>
            </div>

            <div>
              <Label className="text-xs font-medium text-gray-700">Speed Unit</Label>
              <Select 
                value={config.speedUnit} 
                onValueChange={(value) => updateConfigValue('wind', 'speedUnit', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="knots">Knots</SelectItem>
                  <SelectItem value="ms">m/s</SelectItem>
                  <SelectItem value="kmh">km/h</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {selectedWeatherType === 'swell' && (
          <>
            <div className="flex items-center justify-between mb-4">
              <Label className="text-sm font-medium text-gray-700">Swell Configuration</Label>
            </div>

            <div>
              <Label className="text-xs font-medium text-gray-700">Fill Opacity</Label>
              <div className="flex items-center gap-2">
                <Slider
                  value={[config.fillOpacity]}
                  onValueChange={([value]) => updateConfigValue('swell', 'fillOpacity', value)}
                  min={0}
                  max={1}
                  step={0.1}
                  className="flex-1"
                />
                <span className="text-xs w-12">{config.fillOpacity}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={config.animationEnabled}
                onCheckedChange={(checked) => updateConfigValue('swell', 'animationEnabled', checked)}
              />
              <Label className="text-xs">Animation</Label>
            </div>

            {config.animationEnabled && (
              <div>
                <Label className="text-xs font-medium text-gray-700">Animation Speed</Label>
                <Slider
                  value={[config.animationSpeed * 1000]}
                  onValueChange={([value]) => updateConfigValue('swell', 'animationSpeed', value / 1000)}
                  min={0.1}
                  max={5}
                  step={0.1}
                  className="flex-1"
                />
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium text-gray-700">Color Gradient</Label>
                <Button
                  onClick={addSwellGradientItem}
                  size="sm"
                  variant="outline"
                  className="h-6 px-2"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {config.gradient.map((item: any, index: number) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <Input
                      type="text"
                      value={item.value}
                      onChange={(e) => updateSwellGradientItem(index, 'value', e.target.value)}
                      className="w-16 h-6 text-xs"
                      placeholder="0m"
                    />
                    <Input
                      type="color"
                      value={convertRgbaToHex(item.color)}
                      onChange={(e) => {
                        const opacity = parseFloat(item.color.match(/[\d.]+(?=\))/)?.[0] || '1');
                        const newColor = convertHexToRgba(e.target.value, opacity);
                        updateSwellGradientItem(index, 'color', newColor);
                      }}
                      className="w-8 h-6 p-0 border-2"
                    />
                    <Button
                      onClick={() => removeSwellGradientItem(index)}
                      size="sm"
                      variant="outline"
                      className="h-6 w-6 p-0"
                      disabled={config.gradient.length <= 2}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {selectedWeatherType === 'symbol' && (
          <>
            <div>
              <Label className="text-xs font-medium text-gray-700">Symbol Type</Label>
              <Select 
                value={config.symbolType} 
                onValueChange={(value) => updateConfigValue('symbol', 'symbolType', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="arrow">Arrow (→)</SelectItem>
                  <SelectItem value="triangle">Triangle (▲)</SelectItem>
                  <SelectItem value="circle">Circle (●)</SelectItem>
                  <SelectItem value="square">Square (■)</SelectItem>
                  <SelectItem value="custom">Custom Symbol</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {config.symbolType === 'custom' && (
              <div>
                <Label className="text-xs font-medium text-gray-700">Custom Symbol</Label>
                <Input
                  type="text"
                  value={config.customSymbol}
                  onChange={(e) => updateConfigValue('symbol', 'customSymbol', e.target.value)}
                  placeholder="Enter custom symbol (e.g., ★, ✈, ⚡)"
                  maxLength={3}
                  className="w-full"
                />
              </div>
            )}

            <div>
              <Label className="text-xs font-medium text-gray-700">Symbol Color</Label>
              <Input
                type="color"
                value={config.textColor}
                onChange={(e) => updateConfigValue('symbol', 'textColor', e.target.value)}
                className="w-full h-8"
              />
            </div>

            <div>
              <Label className="text-xs font-medium text-gray-700">Symbol Size</Label>
              <Slider
                value={[config.textSize]}
                onValueChange={([value]) => updateConfigValue('symbol', 'textSize', value)}
                min={8}
                max={32}
                step={1}
                className="flex-1"
              />
            </div>
          </>
        )}

        {selectedWeatherType === 'tropicalStorms' && (
          <>
            <div className="flex items-center justify-between mb-4">
              <Label className="text-sm font-medium text-gray-700">Tropical Storms Configuration</Label>
            </div>

            <div>
              <Label className="text-xs font-medium text-gray-700">Storm Opacity</Label>
              <Slider
                value={[config.opacity]}
                onValueChange={([value]) => updateConfigValue('tropicalStorms', 'opacity', value)}
                min={0}
                max={1}
                step={0.1}
                className="flex-1"
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={config.showLabels}
                onCheckedChange={(checked) => updateConfigValue('tropicalStorms', 'showLabels', checked)}
              />
              <Label className="text-xs">Show Storm Labels</Label>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4 p-4">
      <div>
        <Label className="block text-xs font-medium text-gray-700 mb-1">
          Weather Type
        </Label>
        <Select value={selectedWeatherType} onValueChange={setSelectedWeatherType}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select weather type" />
          </SelectTrigger>
          <SelectContent className="bg-white border shadow-lg z-50">
            <SelectItem value="wind">Wind Barbs</SelectItem>
            <SelectItem value="pressure">Pressure</SelectItem>
            <SelectItem value="swell">Swell (Filled)</SelectItem>
            <SelectItem value="symbol">Symbol</SelectItem>
            <SelectItem value="tropicalStorms">Tropical Storms</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {renderConfigurationPanel()}

      <Button 
        onClick={applyLayerConfiguration}
        className="w-full"
        size="sm"
      >
        <Save className="h-4 w-4 mr-2" />
        Apply Configuration
      </Button>
    </div>
  );
};

export default WeatherLayerConfig;
