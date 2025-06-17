
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Lock, Unlock } from 'lucide-react';

interface WeatherLayerConfigProps {
  selectedWeatherType: string;
  layerConfigs: any;
  updateConfigValue: (layerType: string, property: string, value: any) => void;
  swellConfigLocked: boolean;
  setSwellConfigLocked: (locked: boolean) => void;
  convertRgbToHex: (rgbString: string) => string;
  convertHexToRgb: (hex: string) => string;
  getSymbolByType: (symbolType: string, customSymbol?: string) => string;
}

const WeatherLayerConfig: React.FC<WeatherLayerConfigProps> = ({
  selectedWeatherType,
  layerConfigs,
  updateConfigValue,
  swellConfigLocked,
  setSwellConfigLocked,
  convertRgbToHex,
  convertHexToRgb,
  getSymbolByType
}) => {
  const config = layerConfigs[selectedWeatherType];

  const renderSwellConfig = () => (
    <>
      <div className="flex items-center justify-between mb-4">
        <Label className="text-sm font-medium text-gray-700">Swell Configuration</Label>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSwellConfigLocked(!swellConfigLocked)}
          className="p-2"
        >
          {swellConfigLocked ? (
            <Lock className="h-4 w-4 text-red-500" />
          ) : (
            <Unlock className="h-4 w-4 text-green-500" />
          )}
        </Button>
      </div>

      {swellConfigLocked && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-yellow-800">
            Swell configuration is locked. Click the lock icon to unlock and make changes.
          </p>
        </div>
      )}

      <div>
        <Label className="text-xs font-medium text-gray-700">Fill Opacity</Label>
        <div className="flex items-center gap-2">
          <Slider
            value={[config.fillOpacity]}
            onValueChange={([value]) => !swellConfigLocked && updateConfigValue('swell', 'fillOpacity', value)}
            min={0}
            max={1}
            step={0.1}
            className="flex-1"
            disabled={swellConfigLocked}
          />
          <span className="text-xs w-12">{config.fillOpacity}</span>
        </div>
      </div>

      <div>
        <Label className="text-xs font-medium text-gray-700">Fill Outline Color</Label>
        <Input
          type="color"
          value={config.fillOutlineColor === 'transparent' ? '#000000' : config.fillOutlineColor}
          onChange={(e) => !swellConfigLocked && updateConfigValue('swell', 'fillOutlineColor', e.target.value)}
          className="w-full h-8"
          disabled={swellConfigLocked}
        />
      </div>

      <div className="border-t pt-4">
        <Label className="text-sm font-medium text-gray-700 mb-3 block">Layer Blur Settings</Label>
        
        <div className="flex items-center gap-2 mb-3">
          <Switch
            checked={config.layerBlurEnabled}
            onCheckedChange={(checked) => !swellConfigLocked && updateConfigValue('swell', 'layerBlurEnabled', checked)}
            disabled={swellConfigLocked}
          />
          <Label className="text-xs">Enable Layer Blur</Label>
        </div>

        {config.layerBlurEnabled && (
          <>
            <div>
              <Label className="text-xs font-medium text-gray-700">Blur Radius</Label>
              <div className="flex items-center gap-2">
                <Slider
                  value={[config.layerBlurRadius]}
                  onValueChange={([value]) => !swellConfigLocked && updateConfigValue('swell', 'layerBlurRadius', value)}
                  min={1}
                  max={10}
                  step={1}
                  className="flex-1"
                  disabled={swellConfigLocked}
                />
                <span className="text-xs w-12">{config.layerBlurRadius}</span>
              </div>
            </div>

            <div>
              <Label className="text-xs font-medium text-gray-700">Blur Intensity</Label>
              <div className="flex items-center gap-2">
                <Slider
                  value={[config.layerBlurIntensity]}
                  onValueChange={([value]) => !swellConfigLocked && updateConfigValue('swell', 'layerBlurIntensity', value)}
                  min={0.1}
                  max={2}
                  step={0.1}
                  className="flex-1"
                  disabled={swellConfigLocked}
                />
                <span className="text-xs w-12">{config.layerBlurIntensity.toFixed(1)}</span>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Switch
          checked={config.fillAntialias}
          onCheckedChange={(checked) => !swellConfigLocked && updateConfigValue('swell', 'fillAntialias', checked)}
          disabled={swellConfigLocked}
        />
        <Label className="text-xs">Anti-aliasing</Label>
      </div>

      <div className="flex items-center gap-2">
        <Switch
          checked={config.animationEnabled}
          onCheckedChange={(checked) => !swellConfigLocked && updateConfigValue('swell', 'animationEnabled', checked)}
          disabled={swellConfigLocked}
        />
        <Label className="text-xs">Animation</Label>
      </div>

      {config.animationEnabled && (
        <div>
          <Label className="text-xs font-medium text-gray-700">Animation Speed</Label>
          <Slider
            value={[config.animationSpeed * 1000]}
            onValueChange={([value]) => !swellConfigLocked && updateConfigValue('swell', 'animationSpeed', value / 1000)}
            min={0.1}
            max={5}
            step={0.1}
            className="flex-1"
            disabled={swellConfigLocked}
          />
        </div>
      )}

      <div>
        <Label className="text-xs font-medium text-gray-700 mb-2">Wave Height Gradient (0m to 10m+)</Label>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {config.gradient.map((item: any, index: number) => (
            <div key={index} className={`flex items-center gap-2 p-2 border rounded ${swellConfigLocked ? 'bg-gray-50' : 'bg-white'}`}>
              <Input
                type="color"
                value={convertRgbToHex(item.color)}
                onChange={(e) => {
                  if (!swellConfigLocked) {
                    const newGradient = [...config.gradient];
                    newGradient[index].color = convertHexToRgb(e.target.value);
                    updateConfigValue('swell', 'gradient', newGradient);
                  }
                }}
                className="w-10 h-8 p-0 border-2"
                disabled={swellConfigLocked}
              />
              <span className="text-xs w-14 font-medium text-gray-700">{item.value}</span>
              <div className="flex-1">
                <Label className="text-xs text-gray-600 mb-1 block">Opacity: {item.opacity.toFixed(1)}</Label>
                <Slider
                  value={[item.opacity]}
                  onValueChange={([value]) => {
                    if (!swellConfigLocked) {
                      const newGradient = [...config.gradient];
                      newGradient[index].opacity = value;
                      updateConfigValue('swell', 'gradient', newGradient);
                    }
                  }}
                  min={0}
                  max={1}
                  step={0.1}
                  className="w-full"
                  disabled={swellConfigLocked}
                />
              </div>
            </div>
          ))}
        </div>
        {!swellConfigLocked && (
          <div className="mt-2 text-xs text-gray-500 bg-blue-50 p-2 rounded">
            <strong>Tip:</strong> Click the color boxes to change wave height colors and adjust the sliders to modify individual opacity for each height range.
          </div>
        )}
      </div>
    </>
  );

  const renderPressureConfig = () => (
    <>
      <div>
        <Label className="text-xs font-medium text-gray-700">Line Color</Label>
        <Input
          type="color"
          value={config.lineColor}
          onChange={(e) => updateConfigValue('pressure', 'lineColor', e.target.value)}
          className="w-full h-8"
        />
      </div>

      <div>
        <Label className="text-xs font-medium text-gray-700">Line Width</Label>
        <Slider
          value={[config.lineWidth]}
          onValueChange={([value]) => updateConfigValue('pressure', 'lineWidth', value)}
          min={0.5}
          max={10}
          step={0.5}
          className="flex-1"
        />
      </div>

      <div>
        <Label className="text-xs font-medium text-gray-700">Line Opacity</Label>
        <Slider
          value={[config.lineOpacity]}
          onValueChange={([value]) => updateConfigValue('pressure', 'lineOpacity', value)}
          min={0}
          max={1}
          step={0.1}
          className="flex-1"
        />
      </div>

      <div>
        <Label className="text-xs font-medium text-gray-700">Line Blur</Label>
        <Slider
          value={[config.lineBlur]}
          onValueChange={([value]) => updateConfigValue('pressure', 'lineBlur', value)}
          min={0}
          max={5}
          step={0.5}
          className="flex-1"
        />
      </div>

      <div>
        <Label className="text-xs font-medium text-gray-700">Line Gap Width</Label>
        <Slider
          value={[config.lineGapWidth]}
          onValueChange={([value]) => updateConfigValue('pressure', 'lineGapWidth', value)}
          min={0}
          max={10}
          step={1}
          className="flex-1"
        />
      </div>

      <div>
        <Label className="text-xs font-medium text-gray-700">Line Cap</Label>
        <Select 
          value={config.lineCap} 
          onValueChange={(value) => updateConfigValue('pressure', 'lineCap', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="butt">Butt</SelectItem>
            <SelectItem value="round">Round</SelectItem>
            <SelectItem value="square">Square</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-xs font-medium text-gray-700">Line Join</Label>
        <Select 
          value={config.lineJoin} 
          onValueChange={(value) => updateConfigValue('pressure', 'lineJoin', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bevel">Bevel</SelectItem>
            <SelectItem value="round">Round</SelectItem>
            <SelectItem value="miter">Miter</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );

  const renderWindConfig = () => (
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

      <div className="text-xs text-gray-500 mt-2 p-2 bg-gray-50 rounded">
        <div className="font-semibold mb-1">Meteorological Wind Barb Legend:</div>
        <div>○ = Calm (0-2 kts)</div>
        <div>│ = Light air (3-7 kts)</div>
        <div>╸│ = Half barb (5 kts)</div>
        <div>━│ = Full barb (10 kts)</div>
        <div>◤│ = Pennant (50 kts)</div>
        <div className="mt-1 text-xs text-blue-600">
          Wind direction: Points toward where wind is blowing
        </div>
      </div>
    </>
  );

  const renderSymbolConfig = () => (
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

      <div>
        <Label className="text-xs font-medium text-gray-700">Symbol Opacity</Label>
        <Slider
          value={[config.textOpacity]}
          onValueChange={([value]) => updateConfigValue('symbol', 'textOpacity', value)}
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
          onChange={(e) => updateConfigValue('symbol', 'haloColor', e.target.value)}
          className="w-full h-8"
        />
      </div>

      <div>
        <Label className="text-xs font-medium text-gray-700">Halo Width</Label>
        <Slider
          value={[config.haloWidth]}
          onValueChange={([value]) => updateConfigValue('symbol', 'haloWidth', value)}
          min={0}
          max={5}
          step={0.5}
          className="flex-1"
        />
      </div>

      <div>
        <Label className="text-xs font-medium text-gray-700">Symbol Spacing</Label>
        <Slider
          value={[config.symbolSpacing]}
          onValueChange={([value]) => updateConfigValue('symbol', 'symbolSpacing', value)}
          min={20}
          max={200}
          step={10}
          className="flex-1"
        />
      </div>

      <div className="flex items-center gap-2">
        <Switch
          checked={config.allowOverlap}
          onCheckedChange={(checked) => updateConfigValue('symbol', 'allowOverlap', checked)}
        />
        <Label className="text-xs">Allow Overlap</Label>
      </div>

      <div>
        <Label className="text-xs font-medium text-gray-700">Rotation Alignment</Label>
        <Select 
          value={config.rotationAlignment} 
          onValueChange={(value) => updateConfigValue('symbol', 'rotationAlignment', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="map">Map</SelectItem>
            <SelectItem value="viewport">Viewport</SelectItem>
            <SelectItem value="auto">Auto</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );

  return (
    <div className="space-y-4">
      {selectedWeatherType === 'swell' && renderSwellConfig()}
      {selectedWeatherType === 'pressure' && renderPressureConfig()}
      {selectedWeatherType === 'wind' && renderWindConfig()}
      {selectedWeatherType === 'symbol' && renderSymbolConfig()}
    </div>
  );
};

export default WeatherLayerConfig;
