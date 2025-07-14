import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const RouteStats: React.FC = () => {
  return (
    <div className="p-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded">
          <div className="flex flex-col items-center">
            <p className="text-sm text-gray-500">21st May 25</p>
            <p className="font-medium">11:50 UTC</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded">
          <div className="flex flex-col items-center">
            <p className="text-sm text-green-500">21st May 25</p>
            <p className="font-medium text-green-500">08:49 UTC</p>
          </div>
        </div>
      </div>
      
      <div className="mt-4">
        <div className="bg-white rounded">
          <div className="grid grid-cols-2 border-b">
            <div className="p-4 border-r">
              <p className="text-sm text-gray-500">Total Distance</p>
              <p className="font-medium">1,342 nm</p>
            </div>
            <div className="p-4 flex">
              <p className="font-medium text-red-500">1,351 nm</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 border-b">
            <div className="p-4 border-r">
              <p className="text-sm text-gray-500">Total Consumption</p>
              <p className="font-medium">154 mt</p>
            </div>
            <div className="p-4">
              <p className="font-medium text-green-500">151 mt</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 border-b">
            <div className="p-4 border-r">
              <p className="text-sm text-gray-500">Fuel Cost</p>
              <p className="font-medium">$0</p>
            </div>
            <div className="p-4">
              <p className="font-medium">$0</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 border-b">
            <div className="p-4 border-r">
              <p className="text-sm text-gray-500">Hire Cost</p>
              <p className="font-medium">$0</p>
            </div>
            <div className="p-4">
              <p className="font-medium">$0</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2">
            <div className="p-4 border-r">
              <p className="text-sm text-gray-500">Total Est. Cost</p>
              <p className="font-medium">$0</p>
            </div>
            <div className="p-4">
              <p className="font-medium">$0</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-4">
        <Button 
          variant="ghost" 
          className="w-full justify-between bg-white hover:bg-gray-50 py-6"
        >
          <div className="flex items-center">
            <div className="font-medium">More Details</div>
            <div className="text-sm text-gray-500 ml-2">Route ID, Weather, Waypoints etc...</div>
          </div>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default RouteStats;