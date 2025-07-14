import React from 'react';
import { Button } from '@/components/ui/button';

interface RouteTabsProps {
  activeTab: 'base' | 'weather';
  onTabChange: (tab: 'base' | 'weather') => void;
}

const RouteTabs: React.FC<RouteTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="bg-white">
      <div className="flex">
        <Button 
          variant="ghost" 
          className={`flex-1 rounded-none py-6 ${activeTab === 'base' ? 'bg-gray-100' : ''}`}
          onClick={() => onTabChange('base')}
        >
          <span>Base Route</span>
        </Button>
        <Button 
          variant="ghost" 
          className={`flex-1 rounded-none py-6 ${activeTab === 'weather' ? 'bg-gray-100' : ''}`}
          onClick={() => onTabChange('weather')}
        >
          <span>Weather Routing</span>
        </Button>
      </div>
    </div>
  );
};

export default RouteTabs;