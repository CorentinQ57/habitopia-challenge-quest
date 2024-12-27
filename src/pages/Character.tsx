import { useQuery } from "@tanstack/react-query";
import { Palette, ShoppingBag, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CharacterCard } from "@/components/CharacterCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SkinCard } from "@/components/skins/SkinCard";
import { LoadingSkinGrid } from "@/components/skins/LoadingSkinGrid";

const Character = () => {
  const { data: skins, isLoading } = useQuery({
    queryKey: ["skins"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("skins")
        .select("*")
        .order("cost", { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  const characterSkins = skins?.filter(skin => skin.type === "character") || [];
  const themeSkins = skins?.filter(skin => skin.type === "theme") || [];

  return (
    <div className="space-y-8">
      <h1>Personnage</h1>
      
      <div className="grid gap-8 lg:grid-cols-[350px,1fr]">
        <CharacterCard />
        
        <Tabs defaultValue="character" className="space-y-6">
          <TabsList>
            <TabsTrigger value="character" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Personnages
            </TabsTrigger>
            <TabsTrigger value="theme" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Thèmes
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="character" className="space-y-6">
            {isLoading ? (
              <LoadingSkinGrid />
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {characterSkins.map((skin) => (
                  <SkinCard key={skin.id} skin={skin} />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="theme" className="space-y-6">
            {isLoading ? (
              <LoadingSkinGrid />
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {themeSkins.map((skin) => (
                  <SkinCard key={skin.id} skin={skin} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Character;