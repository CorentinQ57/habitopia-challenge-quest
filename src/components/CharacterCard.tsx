import { UserRound, Award, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const CharacterCard = () => {
  const { data: todayXP } = useQuery({
    queryKey: ["todayXP"],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data, error } = await supabase
        .from("habit_logs")
        .select("experience_gained")
        .gte("completed_at", today.toISOString());
      
      if (error) throw error;
      return data.reduce((sum, log) => sum + log.experience_gained, 0);
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
    <div className="habit-card bg-gradient-to-br from-blue-500/10 to-purple-500/10 animate-fade-in backdrop-blur-sm">
      <div className="flex flex-col items-center space-y-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
            <UserRound className="w-12 h-12 text-white" />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2">
            <Plus className="w-4 h-4 text-white" />
          </div>
        </div>
        
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
            Mon Personnage
          </h3>
          
          <div className="grid grid-cols-2 gap-8">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">XP Total</p>
              <div className="flex items-center justify-center gap-2">
                <Award className="w-5 h-5 text-yellow-500" />
                <span className="text-xl font-bold">{totalXP || 0}</span>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">XP Aujourd'hui</p>
              <div className="flex items-center justify-center gap-2">
                <Plus className="w-5 h-5 text-green-500" />
                <span className="text-xl font-bold">{todayXP || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};