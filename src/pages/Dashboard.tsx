
import React, { useState, useEffect } from 'react';
import MapboxMap from '../components/MapboxMap';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { generateMockVessels, getVesselStats, Vessel, VesselType } from '@/lib/vessel-data';
import { Ship, Navigation } from 'lucide-react';

const Dashboard = () => {
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [filteredVessels, setFilteredVessels] = useState<Vessel[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | VesselType>('all');
  const [stats, setStats] = useState<ReturnType<typeof getVesselStats> | null>(null);

  useEffect(() => {
    // Generate mock vessel data
    const mockVessels = generateMockVessels(25);
    setVessels(mockVessels);
    setFilteredVessels(mockVessels);
    setStats(getVesselStats(mockVessels));
  }, []);

  const handleFilterChange = (filter: 'all' | VesselType) => {
    setActiveFilter(filter);
    if (filter === 'all') {
      setFilteredVessels(vessels);
    } else {
      setFilteredVessels(vessels.filter(v => v.type === filter));
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="h-screen flex flex-col p-4 overflow-hidden">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Vessel Dashboard</h1>
        <p className="text-muted-foreground">
          Tracking {stats?.total || 0} vessels across global waters
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Vessels</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Ship className="h-5 w-5 mr-2 text-blue-500" />
              <span className="text-2xl font-bold">{stats?.total || 0}</span>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center mr-4">
                <span className="h-3 w-3 rounded-full bg-vessel-green mr-1"></span>
                Green: {stats?.byType.green || 0}
              </span>
              <span className="inline-flex items-center">
                <span className="h-3 w-3 rounded-full bg-vessel-orange mr-1"></span>
                Orange: {stats?.byType.orange || 0}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Vessels</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Navigation className="h-5 w-5 mr-2 text-green-500" />
              <span className="text-2xl font-bold">{stats?.active || 0}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {stats?.docked || 0} docked · {stats?.maintenance || 0} in maintenance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Vessel Filter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2">
              <button
                onClick={() => handleFilterChange('all')}
                className={`px-3 py-1 rounded-full text-sm ${
                  activeFilter === 'all' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-secondary hover:bg-secondary/80'
                }`}
              >
                All
              </button>
              <button
                onClick={() => handleFilterChange('green')}
                className={`px-3 py-1 rounded-full text-sm ${
                  activeFilter === 'green' 
                    ? 'bg-vessel-green text-white' 
                    : 'bg-secondary hover:bg-secondary/80'
                }`}
              >
                Green
              </button>
              <button
                onClick={() => handleFilterChange('orange')}
                className={`px-3 py-1 rounded-full text-sm ${
                  activeFilter === 'orange' 
                    ? 'bg-vessel-orange text-white' 
                    : 'bg-secondary hover:bg-secondary/80'
                }`}
              >
                Orange
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden rounded-lg border">
        <MapboxMap vessels={filteredVessels} />
      </div>

      <div className="mt-4">
        <Tabs defaultValue="list">
          <TabsList>
            <TabsTrigger value="list">Vessel List</TabsTrigger>
            <TabsTrigger value="recent">Recent Updates</TabsTrigger>
          </TabsList>
          <TabsContent value="list" className="border rounded-md p-4">
            <div className="overflow-auto max-h-48">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left font-medium text-sm">ID</th>
                    <th className="text-left font-medium text-sm">Name</th>
                    <th className="text-left font-medium text-sm">Type</th>
                    <th className="text-left font-medium text-sm">Speed</th>
                    <th className="text-left font-medium text-sm">Status</th>
                    <th className="text-left font-medium text-sm">Last Update</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVessels.map(vessel => (
                    <tr key={vessel.id} className="hover:bg-muted/50">
                      <td className="py-2 text-sm">{vessel.id}</td>
                      <td className="py-2 text-sm">{vessel.name}</td>
                      <td className="py-2 text-sm">
                        <span className={`inline-block w-4 h-4 rounded-full bg-vessel-${vessel.type} mr-2`}></span>
                        {vessel.type}
                      </td>
                      <td className="py-2 text-sm">{vessel.speed} knots</td>
                      <td className="py-2 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          vessel.status === 'active' ? 'bg-green-100 text-green-800' :
                          vessel.status === 'docked' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {vessel.status}
                        </span>
                      </td>
                      <td className="py-2 text-sm">{formatTime(vessel.lastUpdated)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
          <TabsContent value="recent" className="border rounded-md p-4">
            <div className="overflow-auto max-h-48 space-y-3">
              {vessels.slice(0, 5).map(vessel => (
                <div key={`update-${vessel.id}`} className="flex items-start">
                  <span className={`mt-1 inline-block w-3 h-3 rounded-full bg-vessel-${vessel.type} mr-2`}></span>
                  <div>
                    <p className="font-medium text-sm">{vessel.name} ({vessel.id})</p>
                    <p className="text-xs text-muted-foreground">
                      Updated position at {formatTime(vessel.lastUpdated)} - 
                      Speed: {vessel.speed} knots - Status: {vessel.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
