
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
  console.log('MapTopControls rendered:', { isDarkMode, hasToggleTheme: !!onToggleTheme, hasToggleLayers: !!onToggleLayers });
  
  return (
    <div className="absolute top-4 right-4 z-30 flex gap-2">
      {/* Theme Toggle */}
      {onToggleTheme && (
        <button 
          onClick={onToggleTheme}
          className="flex items-center justify-center bg-white border-2 border-gray-300 rounded-md px-3 py-2 shadow-xl hover:bg-gray-50 transition-colors min-w-[48px] min-h-[48px]"
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          style={{ zIndex: 9999 }}
        >
          {isDarkMode ? (
            <Sun className="h-6 w-6 text-yellow-500" />
          ) : (
            <Moon className="h-6 w-6 text-blue-600" />
          )}
        </button>
      )}

      {/* DTN Layers Toggle */}
      {onToggleLayers && (
        <button 
          onClick={onToggleLayers}
          className="flex items-center justify-center bg-white border-2 border-gray-300 rounded-md px-3 py-2 shadow-xl hover:bg-gray-50 transition-colors min-w-[48px] min-h-[48px]"
          title="Toggle DTN Layers"
          style={{ zIndex: 9999 }}
        >
          <Layers className="h-6 w-6 text-gray-700" />
        </button>
      )}
      
      {/* Debug indicator when no functions are passed */}
      {!onToggleTheme && !onToggleLayers && (
        <div className="bg-red-500 text-white p-2 rounded text-xs">
          No controls available
        </div>
      )}
    </div>
  );
};

export default MapTopControls;
