
import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, Route, History, Ship, Grid, Settings, Clock, BarChart } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const navigationItems = [
  { title: "Dashboard", path: "/", icon: LayoutDashboard },
  { title: "Grid View", path: "/grid", icon: Grid },
  { title: "Routes", path: "/routes", icon: Route },
  { title: "History", path: "/history", icon: History },
  { title: "Statistics", path: "/stats", icon: BarChart },
  { title: "Schedule", path: "/schedule", icon: Clock },
];

const AppSidebar = () => {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const currentPath = location.pathname;

  // Helper function
  const isActive = (path: string) => 
    path === "/" ? currentPath === path : currentPath.startsWith(path);

  return (
    <Sidebar
      className="bg-blue-950 flex flex-col items-center pt-4 pb-2 border-r-0 transition-width duration-300"
      style={{ width: "64px", minWidth: "64px" }}
    >
      <div className="mb-4">
        <NavLink to="/" className="block">
          <Ship className="h-7 w-7 mx-auto text-blue-400" />
        </NavLink>
      </div>

      <SidebarTrigger className="hidden" />

      <SidebarContent>
        <SidebarMenu>
          {navigationItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <NavLink
                  to={item.path}
                  title={item.title}
                  end={item.path === "/"}
                  className={({ isActive }) =>
                    `flex justify-center rounded-md my-3 transition-colors ${
                      isActive
                        ? "text-white bg-blue-800"
                        : "text-blue-300 hover:bg-blue-800/50"
                    } p-2`
                  }
                >
                  <item.icon className="h-5 w-5" />
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      
      <div className="mt-auto">
        <NavLink 
          to="/settings" 
          title="Settings"
          className={({ isActive }) =>
            `flex justify-center rounded-md my-3 transition-colors ${
              isActive
                ? "text-white bg-blue-800"
                : "text-blue-300 hover:bg-blue-800/50"
            } p-2`
          }
        >
          <Settings className="h-5 w-5" />
        </NavLink>
        
        <div className="h-8 w-8 bg-indigo-600 rounded-full text-white flex items-center justify-center mt-5">
          A
        </div>
      </div>
    </Sidebar>
  );
};

export default AppSidebar;
