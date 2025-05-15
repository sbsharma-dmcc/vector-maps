
import React, { useState, useEffect } from 'react';
import MapboxMap from '../components/MapboxMap';
import { generateMockVessels, getVesselStats, Vessel, VesselType } from '@/lib/vessel-data';

const Dashboard = () => {
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [filteredVessels, setFilteredVessels] = useState<Vessel[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | VesselType>('all');

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

  return (
    <div className="h-full flex-1">
      <MapboxMap vessels={filteredVessels} />
    </div>
  );
};

export default Dashboard;
