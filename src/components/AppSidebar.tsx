import { LayoutDashboard, ListCheck, BarChart, UserRound, User } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useLocation, Link } from "react-router-dom";

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Habitudes",
    url: "/habitudes",
    icon: ListCheck,
  },
  {
    title: "Statistiques",
    url: "/statistiques",
    icon: BarChart,
  },
  {
    title: "Personnage",
    url: "/personnage",
    icon: UserRound,
  },
  {
    title: "Profil",
    url: "/profil",
    icon: User,
  },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-stella-black/70">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                    tooltip={item.title}
                    className="group relative overflow-hidden transition-all duration-300"
                  >
                    <Link 
                      to={item.url} 
                      className="flex items-center gap-3 relative"
                    >
                      <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-stella-royal to-stella-purple group-hover:shadow-lg group-hover:shadow-stella-purple/20 transition-all duration-300">
                        <item.icon className="h-5 w-5 text-stella-white" />
                        <div className="absolute inset-0 bg-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <span className="text-stella-black/80 group-hover:text-stella-black font-medium transition-colors">
                        {item.title}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}