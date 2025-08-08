import { CalendarDays, MapPin, Users, Settings } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
export function AppSidebar() {
  const location = useLocation();
  const current = location.pathname;
  const isActive = (path: string) => current === path;
  const nav = [{
    title: "Calendar",
    url: "/app/calendar",
    icon: CalendarDays
  }, {
    title: "Locations",
    url: "/app/locations",
    icon: MapPin
  }, {
    title: "Staff",
    url: "/app/staff",
    icon: Users
  }, {
    title: "Settings",
    url: "/app/settings",
    icon: Settings
  }];
  return <Sidebar>
      <SidebarHeader className="h-14 flex items-center justify-center px-3 bg-slate-200">
        <div className="self-center text-2xl font-bold font-playfair tracking-tight">RosterPro</div>
      </SidebarHeader>
      <SidebarContent className="bg-slate-200">
        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {nav.map(item => <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                    <NavLink to={item.url} end className={({
                  isActive
                }) => isActive ? "" : ""}>
                      <item.icon className="mr-2 h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>;
}