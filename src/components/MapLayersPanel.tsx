
import React, { useState } from 'react';
import { X, Wind } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MapLayersPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onLayerToggle: (layerType: string, enabled: boolean) => void;
  activeLayer: string;
  onBaseLayerChange: (layer: string) => void;
}

const MapLayersPanel: React.FC<MapLayersPanelProps> = ({
  isOpen,
  onClose,
  onLayerToggle,
  activeLayer,
  onBaseLayerChange
}) => {
  const [enabledLayers, setEnabledLayers] = useState<Record<string, boolean>>({
    wind: false
  });

  const [globeView, setGlobeView] = useState(false);

  const handleLayerToggle = (layerType: string) => {
    const newState = !enabledLayers[layerType];
    setEnabledLayers(prev => ({
      ...prev,
      [layerType]: newState
    }));
    onLayerToggle(layerType, newState);
  };

  // Only wind layer active for testing
  const overlayLayers = [
    { id: 'wind', name: 'Wind', icon: Wind }
  ];

  const baseLayers = [
    { id: 'default', name: 'Default' },
    { id: 'swell', name: 'Swell' },
    { id: 'wave', name: 'Wave' }
  ];

  if (!isOpen) return null;

  return (
    <div className="absolute top-4 left-4 z-20 bg-white rounded-lg shadow-lg p-4 w-80">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Overlays</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Overlay Layers - Only Wind for now */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {overlayLayers.map((layer) => {
          const IconComponent = layer.icon;
          const isEnabled = enabledLayers[layer.id];
          
          return (
            <div key={layer.id} className="flex flex-col items-center">
              <button
                onClick={() => handleLayerToggle(layer.id)}
                className={`w-16 h-16 rounded-lg flex items-center justify-center mb-2 transition-colors ${
                  isEnabled 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-blue-100 text-blue-500 hover:bg-blue-200'
                }`}
              >
                <IconComponent className="h-8 w-8" />
              </button>
              <span className="text-sm font-medium">{layer.name}</span>
            </div>
          );
        })}
      </div>

      {/* Separator */}
      <div className="border-t border-gray-200 my-4"></div>

      {/* Base Layer */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold mb-3">Base layer</h4>
        <div className="grid grid-cols-3 gap-3">
          {baseLayers.map((layer) => (
            <div key={layer.id} className="flex flex-col items-center">
              <button
                onClick={() => onBaseLayerChange(layer.id)}
                className={`w-16 h-16 rounded-lg border-2 transition-colors ${
                  activeLayer === layer.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className={`w-full h-full rounded-md ${
                  layer.id === 'default' ? 'bg-blue-500' :
                  layer.id === 'swell' ? 'bg-blue-300' : 'bg-blue-200'
                }`}></div>
              </button>
              <span className="text-xs mt-1">{layer.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Separator */}
      <div className="border-t border-gray-200 my-4"></div>

      {/* Globe View Toggle */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="globe-view"
          checked={globeView}
          onChange={(e) => setGlobeView(e.target.checked)}
          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="globe-view" className="ml-2 text-sm font-medium">
          Globe View
        </label>
      </div>
    </div>
  );
};

export default MapLayersPanel;
