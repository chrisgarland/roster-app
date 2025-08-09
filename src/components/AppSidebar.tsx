import { CalendarDays, MapPin, Users, Settings } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
export function AppSidebar({ className }: { className?: string }) {
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
  return <Sidebar className={className}>
      <SidebarHeader className="h-14 flex items-center justify-center px-3 bg-sidebar">
        <div className="self-center inline-flex items-center gap-2 text-2xl font-bold font-playfair tracking-tight"><CalendarDays className="h-6 w-6" aria-hidden /><span>RosterPro</span></div>
      </SidebarHeader>
      <SidebarContent className="bg-sidebar">
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