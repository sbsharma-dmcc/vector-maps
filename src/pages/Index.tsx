
import React, { useState } from 'react';
import { Layers } from 'lucide-react';
import MapboxMap from '../components/MapboxMap';
import MapLayersPanel from '../components/MapLayersPanel';
import { Button } from '@/components/ui/button';

const Index = () => {
  const [showLayersPanel, setShowLayersPanel] = useState(false);
  const [activeLayers, setActiveLayers] = useState<Record<string, boolean>>({
    wind: false,
    swell: false,
    pressure: false
  });
  const [activeBaseLayer, setActiveBaseLayer] = useState('default');
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleLayerToggle = (layerType: string, enabled: boolean) => {
    console.log(`Toggling layer ${layerType} to ${enabled}`);
    setActiveLayers(prev => ({
      ...prev,
      [layerType]: enabled
    }));
  };

  const handleBaseLayerChange = (layer: string) => {
    console.log(`Changing base layer to ${layer}`);
    setActiveBaseLayer(layer);
  };

  const toggleMapTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className="absolute inset-0">
      {/* Top Controls */}
      <div className="absolute top-4 left-4 z-30 flex gap-2">
        {/* Layers control button */}
        <Button
          onClick={() => setShowLayersPanel(!showLayersPanel)}
          variant="outline"
          size="icon"
          className="bg-white/90 hover:bg-white shadow-lg"
        >
          <Layers className="h-4 w-4" />
        </Button>
      </div>

      {/* Map Layers Panel */}
      <MapLayersPanel
        isOpen={showLayersPanel}
        onClose={() => setShowLayersPanel(false)}
        onLayerToggle={handleLayerToggle}
        activeLayer={activeBaseLayer}
        onBaseLayerChange={handleBaseLayerChange}
      />

      {/* Map */}
      <MapboxMap 
        activeLayers={activeLayers}
        activeBaseLayer={activeBaseLayer}
        mapStyle={isDarkMode ? 'mapbox://styles/mapbox/dark-v11' : 'mapbox://styles/geoserve/cmbf0vz6e006g01sdcdl40oi7'}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleMapTheme}
      />
    </div>
  );
};

export default Index;
