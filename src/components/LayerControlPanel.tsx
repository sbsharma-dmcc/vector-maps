
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, Trash2 } from 'lucide-react';
import WeatherLayerConfig from './WeatherLayerConfig';
import WeatherConfigDrafts from './WeatherConfigDrafts';

interface LayerControlPanelProps {
  selectedWeatherType: string;
  setSelectedWeatherType: (type: string) => void;
  selectedDraft: string;
  setSelectedDraft: (draftId: string) => void;
  weatherDrafts: any[];
  layerConfigs: any;
  updateConfigValue: (layerType: string, property: string, value: any) => void;
  swellConfigLocked: boolean;
  setSwellConfigLocked: (locked: boolean) => void;
  activeOverlays: string[];
  loadDraft: (draftId: string) => void;
  deleteDraft: (draftId: string) => void;
  applyLayerConfiguration: () => void;
  loadConfigFromDraft: (config: any) => void;
  getCurrentWeatherTypeDrafts: () => any[];
  convertRgbToHex: (rgbString: string) => string;
  convertHexToRgb: (hex: string) => string;
  getSymbolByType: (symbolType: string, customSymbol?: string) => string;
}

const LayerControlPanel: React.FC<LayerControlPanelProps> = ({
  selectedWeatherType,
  setSelectedWeatherType,
  selectedDraft,
  setSelectedDraft,
  weatherDrafts,
  layerConfigs,
  updateConfigValue,
  swellConfigLocked,
  setSwellConfigLocked,
  activeOverlays,
  loadDraft,
  deleteDraft,
  applyLayerConfiguration,
  loadConfigFromDraft,
  getCurrentWeatherTypeDrafts,
  convertRgbToHex,
  convertHexToRgb,
  getSymbolByType
}) => {
  return (
    <div className="absolute top-32 right-4 z-20 bg-white rounded-lg shadow-lg p-4 min-w-[360px] max-h-[80vh] overflow-y-auto">
      <h3 className="text-sm font-semibold mb-3">Weather Layer Configuration</h3>
      
      <div className="space-y-4">
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
            </SelectContent>
          </Select>
        </div>

        {/* Draft Selection */}
        {getCurrentWeatherTypeDrafts().length > 0 && (
          <div>
            <Label className="block text-xs font-medium text-gray-700 mb-1">
              Load Draft
            </Label>
            <div className="flex gap-2">
              <Select value={selectedDraft} onValueChange={loadDraft}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select a draft" />
                </SelectTrigger>
                <SelectContent className="bg-white border shadow-lg z-50">
                  {getCurrentWeatherTypeDrafts().map((draft) => (
                    <SelectItem key={draft.id} value={draft.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{draft.name}</span>
                        <span className="text-xs text-gray-400">
                          {new Date(draft.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedDraft && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteDraft(selectedDraft)}
                  className="p-2"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              )}
            </div>
            {getCurrentWeatherTypeDrafts().length > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                {getCurrentWeatherTypeDrafts().length} draft(s) available for {selectedWeatherType}
              </p>
            )}
          </div>
        )}

        <WeatherLayerConfig
          selectedWeatherType={selectedWeatherType}
          layerConfigs={layerConfigs}
          updateConfigValue={updateConfigValue}
          swellConfigLocked={swellConfigLocked}
          setSwellConfigLocked={setSwellConfigLocked}
          convertRgbToHex={convertRgbToHex}
          convertHexToRgb={convertHexToRgb}
          getSymbolByType={getSymbolByType}
        />

        <Button 
          onClick={applyLayerConfiguration}
          className="w-full"
          size="sm"
        >
          <Save className="h-4 w-4 mr-2" />
          Apply & Save as Draft
        </Button>

        <WeatherConfigDrafts
          currentConfig={layerConfigs}
          onLoadConfig={loadConfigFromDraft}
        />

        <div className="text-xs text-gray-500 mt-4 pt-4 border-t">
          <div className="font-medium mb-2">Active Layers: {activeOverlays.length}</div>
          {activeOverlays.map(layer => (
            <div key={layer} className="text-xs capitalize">
              • {layer}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LayerControlPanel;
