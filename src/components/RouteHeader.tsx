import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Bell, CheckCircle, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Route } from '@/lib/vessel-data';

interface RouteHeaderProps {
  route: Route;
  routeId: string;
  voyageStatus: 'active' | 'completed';
  onModifyVoyage: () => void;
  onCompleteVoyage: () => void;
}

const RouteHeader: React.FC<RouteHeaderProps> = ({
  route,
  routeId,
  voyageStatus,
  onModifyVoyage,
  onCompleteVoyage
}) => {
  const navigate = useNavigate();

  return (
    <div className="bg-[#0c1c3d] text-white p-4">
      <div className="flex items-center justify-between mb-4">
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-white" 
          onClick={() => navigate('/routes')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="text-white">
            <Search className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white">
            <Bell className="h-5 w-5" />
          </Button>
          
          {/* More Options Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white">
              <DropdownMenuItem onClick={onModifyVoyage}>
                Modify Voyage
              </DropdownMenuItem>
              {voyageStatus === 'active' && (
                <DropdownMenuItem onClick={onCompleteVoyage}>
                  Complete Voyage
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <div>
        <h1 className="text-xl font-semibold flex items-center">
          {route?.name}
          <span className={`text-xs font-medium ml-2 px-2 py-0.5 rounded ${
            voyageStatus === 'completed' 
              ? 'bg-gray-500 text-white' 
              : 'bg-green-500 text-white'
          }`}>
            {voyageStatus === 'completed' ? 'Completed' : route?.status}
          </span>
        </h1>
        <div className="flex text-sm text-gray-300">
          <span>29° 52' 43.2" N</span>
          <span className="mx-2">•</span>
          <span>{route?.startPort}</span>
        </div>
        <div className="text-sm text-gray-300">
          <span>121° 08' 29.5" E</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mt-4">
        <div className="border-r border-gray-700 pr-4">
          <p className="text-xs text-gray-400">Route ID</p>
          <p className="font-bold">#{routeId}</p>
        </div>
        <div className="border-r border-gray-700 pr-4">
          <p className="text-xs text-gray-400">Start Date</p>
          <p className="font-bold">{new Date(route?.departureDate).toLocaleDateString()}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Time</p>
          <p className="font-bold">07:40 UTC</p>
        </div>

        <div className="border-r border-gray-700 pr-4">
          <p className="text-xs text-gray-400">Distance</p>
          <p className="font-bold">{route?.distance} nm</p>
        </div>
        <div className="border-r border-gray-700 pr-4">
          <p className="text-xs text-gray-400">Est. Time</p>
          <p className="font-bold">{route?.estimatedTime}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Planned Speed</p>
          <p className="font-bold">10kt - 12kt</p>
        </div>
      </div>

      {voyageStatus === 'completed' && (
        <div className="mt-4 p-3 bg-gray-800 rounded-lg border border-gray-600">
          <div className="flex items-center text-gray-300">
            <CheckCircle className="h-4 w-4 mr-2 text-green-400" />
            <span className="text-sm">Voyage completed successfully</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default RouteHeader;