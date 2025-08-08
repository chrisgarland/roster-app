import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Outlet } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
export default function AppLayout() {
  return <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset>
        <header className="h-14 sticky top-0 z-10 flex items-center gap-2 border-b backdrop-blur px-3 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 shadow-sm bg-slate-200">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="ml-1" />
            </div>
            <nav className="ml-auto flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="rounded-full p-0.5 ring-inset ring-2 ring-primary/40 ring-offset-2 ring-offset-background bg-gradient-to-br from-primary/20 to-transparent hover:from-primary/30 hover:ring-primary/50 transition-colors transition-shadow hover-scale shadow-md hover:shadow-lg drop-shadow-sm hover:drop-shadow-md outline-none focus-visible:ring-2 focus-visible:ring-primary data-[state=open]:ring-primary/70" aria-label="Open account menu" title="My account">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="" alt="User avatar" />
                      <AvatarFallback>RF</AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Sign out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>
          </header>
          <div className="p-4 animate-fade-in">
            <Outlet />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>;
}