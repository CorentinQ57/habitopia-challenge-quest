import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SkinCard } from "./SkinCard";
import { Gem } from "lucide-react";

export const SkinShop = () => {
  const { data: skins } = useQuery({
    queryKey: ["skins"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("skins")
        .select("*")
        .eq('type', 'character')
        .order("cost", { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  const { data: totalXP } = useQuery({
    queryKey: ["totalXP"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("habit_logs")
        .select("experience_gained");
      
      if (error) throw error;
      return data.reduce((sum, log) => sum + log.experience_gained, 0);
    },
  });

  return (
    <div className="rounded-xl bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 p-6 backdrop-blur-lg border border-white/20 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Boutique de Skins</h2>
        <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
          <Gem className="w-5 h-5 text-primary" />
          <span className="font-semibold">{totalXP || 0} XP</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {skins?.map((skin) => (
          <SkinCard 
            key={skin.id} 
            skin={skin} 
            canPurchase={totalXP ? totalXP >= skin.cost : false}
          />
        ))}
      </div>
    </div>
  );
};