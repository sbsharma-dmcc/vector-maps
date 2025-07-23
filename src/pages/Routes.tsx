
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  generateMockVessels, 
  generateMockRoutes, 
  Route as RouteType,
  Vessel 
} from '@/lib/vessel-data';
import { Route, Search, Calendar } from 'lucide-react';

const Routes = () => {
  const navigate = useNavigate();
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [routes, setRoutes] = useState<RouteType[]>([]);
  const [filteredRoutes, setFilteredRoutes] = useState<RouteType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  

  useEffect(() => {
    // Generate mock vessel and route data
    const mockVessels = generateMockVessels();
    const mockRoutes = generateMockRoutes(mockVessels);
    
    setVessels(mockVessels);
    setRoutes(mockRoutes);
    setFilteredRoutes(mockRoutes);
  }, []);

  useEffect(() => {
    // Apply filters when search term changes - only show in-progress routes
    let filtered = routes.filter(route => route.status === 'in-progress');
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(route => 
        route.name.toLowerCase().includes(term) || 
        route.vesselId.toLowerCase().includes(term) ||
        route.startPort.toLowerCase().includes(term) ||
        route.endPort.toLowerCase().includes(term)
      );
    }
    
    setFilteredRoutes(filtered);
  }, [searchTerm, routes]);
  
  // Format date to a more readable format
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // Get vessel name by ID
  const getVesselName = (id: string): string => {
    const vessel = vessels.find(v => v.id === id);
    return vessel ? vessel.name : 'Unknown Vessel';
  };

  // Get vessel type by ID - updated to handle all vessel types
  const getVesselType = (id: string) => {
    const vessel = vessels.find(v => v.id === id);
    return vessel ? vessel.type : 'unknown';
  };

  // Navigate to route detail page
  const handleViewDetails = (routeId: string) => {
    navigate(`/routes/${routeId}`);
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Routes</h1>
        <p className="text-muted-foreground">
          Manage and monitor vessel routes and itineraries
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <Card className="flex-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Search Routes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by vessel, route, or port..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
        
      </div>

      {/* In Progress Routes Table */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">In Progress Routes</h2>
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">Route ID</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Route Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Vessel</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Departure</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Arrival</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRoutes.length > 0 ? (
                  filteredRoutes.map(route => (
                    <tr 
                      key={route.id} 
                      className="border-t hover:bg-muted/30 cursor-pointer"
                      onClick={() => handleViewDetails(route.id)}
                    >
                      <td className="px-4 py-3 text-sm">{route.id}</td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center">
                          <Route className="h-4 w-4 mr-2 text-muted-foreground" />
                          {route.name}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center">
                          <span className={`h-3 w-3 rounded-full bg-vessel-${getVesselType(route.vesselId)} mr-2`}></span>
                          {getVesselName(route.vesselId)}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                          {formatDate(route.departureDate)}
                        </div>
                        <div className="text-xs text-muted-foreground">{route.startPort}</div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                          {formatDate(route.arrivalDate)}
                        </div>
                        <div className="text-xs text-muted-foreground">{route.endPort}</div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="px-2 py-1 rounded-full text-xs bg-amber-100 text-amber-800">
                          In Progress
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails(route.id);
                          }}
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                      No in-progress routes found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Completed Routes Table */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Completed Routes</h2>
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">Route ID</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Route Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Vessel</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Departure</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Arrival</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {routes.filter(route => route.status === 'completed').length > 0 ? (
                  routes.filter(route => route.status === 'completed').map(route => (
                    <tr 
                      key={route.id} 
                      className="border-t hover:bg-muted/30 cursor-pointer"
                      onClick={() => handleViewDetails(route.id)}
                    >
                      <td className="px-4 py-3 text-sm">{route.id}</td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center">
                          <Route className="h-4 w-4 mr-2 text-muted-foreground" />
                          {route.name}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center">
                          <span className={`h-3 w-3 rounded-full bg-vessel-${getVesselType(route.vesselId)} mr-2`}></span>
                          {getVesselName(route.vesselId)}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                          {formatDate(route.departureDate)}
                        </div>
                        <div className="text-xs text-muted-foreground">{route.startPort}</div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                          {formatDate(route.arrivalDate)}
                        </div>
                        <div className="text-xs text-muted-foreground">{route.endPort}</div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                          Completed
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails(route.id);
                          }}
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                      No completed routes found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Routes;
