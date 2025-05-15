
import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, Route, History, Ship } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const navigationItems = [
  { title: "Dashboard", path: "/", icon: LayoutDashboard },
  { title: "Routes", path: "/routes", icon: Route },
  { title: "History", path: "/history", icon: History },
];

const AppSidebar = () => {
  const { collapsed } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  // Helper functions
  const isActive = (path: string) => 
    path === "/" ? currentPath === path : currentPath.startsWith(path);
  const isMainNavExpanded = navigationItems.some((item) => isActive(item.path));

  return (
    <Sidebar
      className={`${collapsed ? "w-18" : "w-64"} border-r transition-width duration-300 bg-sidebar`}
    >
      <div className={`${collapsed ? "px-2 py-4" : "px-4 py-5"} flex items-center justify-between border-b`}>
        {!collapsed && (
          <div className="flex items-center">
            <Ship className="h-6 w-6 mr-3 text-vessel-green" />
            <span className="font-bold text-lg">VesselTrack</span>
          </div>
        )}
        {collapsed && <Ship className="h-6 w-6 mx-auto text-vessel-green" />}
        <SidebarTrigger className={`${collapsed ? "ml-auto" : ""}`} />
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={`${collapsed ? "sr-only" : ""}`}>
            Navigation
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.path}
                      end={item.path === "/"}
                      className={({ isActive }) =>
                        `flex items-center py-2 px-3 rounded-md transition-colors ${
                          isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                            : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                        } ${collapsed ? "justify-center" : ""}`
                      }
                    >
                      <item.icon className={`h-5 w-5 ${collapsed ? "" : "mr-3"}`} />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
