import { LayoutDashboard, ListCheck, BarChart, UserRound, User } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
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
          <SidebarGroupLabel className="text-sm font-medium text-gray-500/80">Menu</SidebarGroupLabel>
          <div className="mt-2">
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
                      className="flex items-center gap-3 relative p-2"
                    >
                      <div className={`
                        relative flex items-center justify-center w-10 h-10 
                        rounded-xl bg-white/80 backdrop-blur-sm
                        group-hover:bg-white group-hover:shadow-md
                        transition-all duration-300
                        ${location.pathname === item.url ? 'shadow-md bg-white' : ''}
                      `}>
                        <item.icon className={`
                          h-5 w-5 transition-colors duration-300
                          ${location.pathname === item.url 
                            ? 'text-stella-royal' 
                            : 'text-gray-600 group-hover:text-stella-royal'}
                        `} />
                      </div>
                      <span className={`
                        font-medium transition-colors duration-300
                        ${location.pathname === item.url 
                          ? 'text-stella-royal' 
                          : 'text-gray-600 group-hover:text-stella-royal'}
                      `}>
                        {item.title}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </div>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}