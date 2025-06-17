
import React from 'react';
import { Moon, Sun, Layers } from 'lucide-react';

interface MapTopControlsProps {
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
  onToggleLayers?: () => void;
}

const MapTopControls: React.FC<MapTopControlsProps> = ({ 
  isDarkMode = false, 
  onToggleTheme,
  onToggleLayers
}) => {
  return (
    <div className="absolute top-4 right-4 z-10 flex gap-2">
      {/* Theme Toggle */}
      {onToggleTheme && (
        <button 
          onClick={onToggleTheme}
          className="flex items-center bg-white rounded-md px-3 py-2 shadow-lg hover:bg-gray-50 transition-colors"
        >
          {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      )}

      {/* DTN Layers Toggle */}
      {onToggleLayers && (
        <button 
          onClick={onToggleLayers}
          className="flex items-center bg-white rounded-md px-3 py-2 shadow-lg hover:bg-gray-50 transition-colors"
        >
          <Layers className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default MapTopControls;
