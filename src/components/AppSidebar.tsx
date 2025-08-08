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
      <SidebarHeader className="h-14 flex items-center px-3">
        <div className="inline-flex items-center rounded-md px-2 py-1 bg-primary/10 text-primary text-base font-bold font-display tracking-tight">RosterFlow</div>
      </SidebarHeader>
      <SidebarContent className="bg-slate-100">
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