
import React, { useState } from 'react';
import MapboxMap from '../components/MapboxMap';
import MapLayersPanel from '../components/MapLayersPanel';

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
    console.log('Theme toggle clicked, current state:', isDarkMode);
    setIsDarkMode(!isDarkMode);
  };

  const toggleLayersPanel = () => {
    console.log('Layers panel toggle clicked, current state:', showLayersPanel);
    setShowLayersPanel(!showLayersPanel);
  };

  return (
    <div className="absolute inset-0">
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
        onToggleLayers={toggleLayersPanel}
      />
    </div>
  );
};

export default Index;
