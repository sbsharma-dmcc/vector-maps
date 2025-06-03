
import React, { useState, useEffect } from 'react';
import { Layers } from 'lucide-react';
import MapboxMap from '../components/MapboxMap';
import MapLayersPanel from '../components/MapLayersPanel';
import { generateMockVessels, getVesselStats, Vessel, VesselType } from '@/lib/vessel-data';

const Dashboard = () => {
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [filteredVessels, setFilteredVessels] = useState<Vessel[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | VesselType>('all');
  const [showLayersPanel, setShowLayersPanel] = useState(false);
  const [activeLayers, setActiveLayers] = useState<Record<string, boolean>>({
    pressure: false,
    storm: false,
    current: false,
    wind: false
  });
  const [activeBaseLayer, setActiveBaseLayer] = useState('default');

  useEffect(() => {
    // Generate mock vessel data
    const mockVessels = generateMockVessels(25);
    setVessels(mockVessels);
    setFilteredVessels(mockVessels);
  }, []);

  const handleFilterChange = (filter: 'all' | VesselType) => {
    setActiveFilter(filter);
    if (filter === 'all') {
      setFilteredVessels(vessels);
    } else {
      setFilteredVessels(vessels.filter(v => v.type === filter));
    }
  };

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

  return (
    <div className="absolute inset-0">
      {/* Layers control button */}
      <button
        onClick={() => setShowLayersPanel(!showLayersPanel)}
        className="absolute top-4 left-4 z-30 bg-white rounded-lg shadow-lg p-3 hover:bg-gray-50 transition-colors"
      >
        <Layers className="h-5 w-5 text-gray-700" />
      </button>

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
        vessels={filteredVessels} 
        activeLayers={activeLayers}
        activeBaseLayer={activeBaseLayer}
      />
    </div>
  );
};

export default Dashboard;
