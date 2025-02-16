import { LayoutDashboard, ListCheck, BarChart, UserRound, LogOut, Sparkles, User, BookText } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { AIAssistantButton } from "./AIAssistantButton";

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
    title: "Notes",
    url: "/notes",
    icon: BookText,
  },
  {
    title: "Profil",
    url: "/profil",
    icon: User,
  },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/profil");
      toast({
        title: "Déconnexion réussie",
        description: "À bientôt !",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de vous déconnecter.",
        variant: "destructive",
      });
    }
  };

  return (
    <Sidebar>
      <SidebarContent className="flex flex-col h-full">
        <SidebarGroup>
          <div className="flex items-center gap-2 px-4 py-2">
            <Sparkles className="h-6 w-6 text-stella-royal" />
            <span className="font-abril text-lg">Stella</span>
          </div>
          <div className="mt-2">
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title} className="my-2">
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                    tooltip={item.title}
                    className="group relative overflow-hidden transition-all duration-300"
                  >
                    <Link 
                      to={item.url} 
                      className={`
                        flex items-center gap-3 relative p-4 leading-relaxed rounded-sm
                        ${location.pathname === item.url 
                          ? '-mx-2 bg-gradient-to-r from-[#a8c0ff] to-[#3f2b96]' 
                          : ''}
                      `}
                    >
                      <item.icon className={`
                        h-5 w-5 transition-colors duration-300
                        ${location.pathname === item.url 
                          ? 'text-white' 
                          : 'text-gray-600'}
                      `} />
                      <span className={`
                        font-medium transition-colors duration-300
                        ${location.pathname === item.url 
                          ? 'text-white' 
                          : 'text-gray-600'}
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

        <div className="mt-auto">
          <div className="px-4">
            <AIAssistantButton />
          </div>
          <div className="p-4 border-t border-gray-200/50">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback className="bg-stella-royal text-white">
                  {profile?.username?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 truncate">
                  {profile?.username || "Utilisateur"}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                className="h-8 w-8 text-gray-500 hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" />
                <span className="sr-only">Se déconnecter</span>
              </Button>
            </div>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
