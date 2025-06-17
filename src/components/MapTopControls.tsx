
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
    <div className="absolute top-4 right-4 z-20 flex gap-2">
      {/* Theme Toggle */}
      {onToggleTheme && (
        <button 
          onClick={onToggleTheme}
          className="flex items-center justify-center bg-white border border-gray-200 rounded-md px-3 py-2 shadow-lg hover:bg-gray-50 transition-colors min-w-[44px] min-h-[44px]"
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDarkMode ? (
            <Sun className="h-5 w-5 text-yellow-500" />
          ) : (
            <Moon className="h-5 w-5 text-blue-600" />
          )}
        </button>
      )}

      {/* DTN Layers Toggle */}
      {onToggleLayers && (
        <button 
          onClick={onToggleLayers}
          className="flex items-center justify-center bg-white border border-gray-200 rounded-md px-3 py-2 shadow-lg hover:bg-gray-50 transition-colors min-w-[44px] min-h-[44px]"
          title="Toggle DTN Layers"
        >
          <Layers className="h-5 w-5 text-gray-700" />
        </button>
      )}
    </div>
  );
};

export default MapTopControls;
