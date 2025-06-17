
import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, Route, History, Ship, Search, Plus, Key, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import DirectTokenInput from "./DirectTokenInput";
import WeatherConfigPopup from "./WeatherConfigPopup";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

interface WeatherConfig {
  fillOpacity: number;
  heatmapIntensity: number;
  heatmapRadius: number;
  heatmapWeight: number;
  lineOpacity: number;
  lineWidth: number;
  colorScheme: string;
  customColors: {
    lowPressure: string;
    mediumPressure: string;
    highPressure: string;
  };
  enableAnimation: boolean;
  animationSpeed: number;
  blendMode: string;
  smoothing: boolean;
  contourInterval: number;
}

interface AppSidebarProps {
  onWeatherConfigChange?: (configs: Record<string, WeatherConfig>) => void;
}

const navigationItems = [
  { title: "Dashboard", path: "/", icon: LayoutDashboard },
  { title: "Routes", path: "/routes", icon: Route },
  { title: "History", path: "/history", icon: History },
];

const AppSidebar: React.FC<AppSidebarProps> = ({ onWeatherConfigChange }) => {
  const location = useLocation();
  const currentPath = location.pathname;
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [showWeatherConfig, setShowWeatherConfig] = useState(false);
  const [weatherConfigs, setWeatherConfigs] = useState<Record<string, WeatherConfig>>({});

  // Helper function
  const isActive = (path: string) => 
    path === "/" ? currentPath === path : currentPath.startsWith(path);

  const handleWeatherConfig = (layerType: string, config: WeatherConfig) => {
    console.log('Weather config applied:', layerType, config);
    
    const newConfigs = {
      ...weatherConfigs,
      [layerType]: config
    };
    
    setWeatherConfigs(newConfigs);
    
    // Notify parent component (which should pass this to MapboxMap)
    if (onWeatherConfigChange) {
      onWeatherConfigChange(newConfigs);
    }
  };

  return (
    <Sidebar className="w-16 bg-white/90 shadow-md z-10 flex flex-col" collapsible="none">
      <div className="p-2 border-b flex justify-center">
        <Ship className="h-6 w-6 text-vessel-green" />
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <div className="px-2 py-4">
              <Button variant="outline" size="icon" className="w-full mb-4 bg-white">
                <Search className="h-4 w-4" />
              </Button>
              
              <SidebarMenu>
                {navigationItems.map((item) => (
                  <SidebarMenuItem key={item.title} className="mb-2">
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <NavLink
                        to={item.path}
                        end={item.path === "/"}
                        className={({ isActive }) =>
                          `flex items-center justify-center py-2 rounded-md transition-colors ${
                            isActive
                              ? "bg-vessel-green text-white"
                              : "text-gray-600 hover:bg-gray-100"
                          }`
                        }
                      >
                        <item.icon className="h-5 w-5" />
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>

              <div className="mt-4 space-y-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="w-full bg-white"
                  onClick={() => setShowTokenInput(!showTokenInput)}
                  title="DTN Token"
                >
                  <Key className="h-4 w-4" />
                </Button>

                <Button 
                  variant="outline" 
                  size="icon" 
                  className="w-full bg-white"
                  onClick={() => setShowWeatherConfig(true)}
                  title="Weather Configuration"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <div className="mt-auto p-2 mb-4">
        <Button className="w-full bg-blue-600 hover:bg-blue-700" size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {showTokenInput && <DirectTokenInput />}
      
      <WeatherConfigPopup 
        isOpen={showWeatherConfig}
        onClose={() => setShowWeatherConfig(false)}
        onApplyConfig={handleWeatherConfig}
      />
    </Sidebar>
  );
};

export default AppSidebar;
