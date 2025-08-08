import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Outlet } from "react-router-dom";

export default function AppLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset>
          <header className="h-14 sticky top-0 z-10 flex items-center gap-2 border-b bg-background/80 backdrop-blur px-3">
            <SidebarTrigger className="ml-1" />
            <h1 className="text-sm font-semibold tracking-tight">RosterFlow</h1>
          </header>
          <div className="p-4">
            <Outlet />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
