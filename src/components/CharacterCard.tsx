
import { useState } from "react";
import { UserRound, Award, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SkinSelector } from "./skins/SkinSelector";

export const CharacterCard = () => {
  const [isSkinSelectorOpen, setIsSkinSelectorOpen] = useState(false);

  const { data: todayXP } = useQuery({
    queryKey: ["todayXP"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data, error } = await supabase
        .from("habit_logs")
        .select("experience_gained")
        .eq('user_id', user.id)
        .gte("completed_at", today.toISOString());
      
      if (error) throw error;
      return data.reduce((sum, log) => sum + log.experience_gained, 0);
    },
  });

  const { data: totalXP } = useQuery({
    queryKey: ["totalXP"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;

      const { data, error } = await supabase
        .from("habit_logs")
        .select("experience_gained")
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data.reduce((sum, log) => sum + log.experience_gained, 0);
    },
  });

  const getCharacterImage = async (skinTitle: string | undefined) => {
    if (!skinTitle) return null;
    
    const images: { [key: string]: string } = {
      'Guerrier': 'warrior.jpg',
      'Mage': 'magus.jpg',
      'Ninja': 'ninja.jpg'
    };
    
    const filename = images[skinTitle];
    if (!filename) return null;

    const { data: { publicUrl } } = supabase
      .storage
      .from('skins')
      .getPublicUrl(filename);
    
    return publicUrl;
  };

  const calculateLevel = (xp: number) => {
    return Math.floor(xp / 100) + 1;
  };

  const calculateProgress = (xp: number) => {
    return (xp % 100);
  };

  const level = calculateLevel(totalXP || 0);
  const progress = calculateProgress(totalXP || 0);

  const { data: activeSkin } = useQuery({
    queryKey: ["activeSkin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_skins")
        .select(`
          *,
          skin:skins (
            id,
            title,
            preview_url
          )
        `)
        .eq("is_active", true)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
  });

  const { data: characterImage } = useQuery({
    queryKey: ["characterImage", activeSkin?.skin?.title],
    queryFn: () => getCharacterImage(activeSkin?.skin?.title),
    enabled: !!activeSkin?.skin?.title,
  });

  return (
    <div className="relative overflow-hidden rounded-xl p-6 backdrop-blur-lg border border-white/20 shadow-xl animate-fade-in noise
      before:absolute before:inset-0 before:bg-gradient-to-br before:from-stella-royal/0 before:to-stella-purple/0 before:transition-colors before:duration-500
      after:absolute after:inset-0 after:rounded-xl after:opacity-0 after:transition-opacity after:duration-500 after:bg-[radial-gradient(circle_at_50%_50%,rgba(65,105,225,0.4),transparent_60%)]" 
      style={{
        background: 'linear-gradient(135deg, rgba(168, 192, 255, 0.9), rgba(63, 43, 150, 0.2)'
      }}
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-stella-white/10 rounded-full overflow-hidden">
        <div 
          className="h-full transition-all duration-500 ease-out"
          style={{ 
            width: `${progress}%`,
            background: 'linear-gradient(to right, #a8c0ff, #3f2b96)'
          }}
        />
      </div>
      
      <div className="flex flex-col items-center space-y-6 relative z-10">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-stella-royal to-stella-purple rounded-full blur-lg group-hover:blur-xl transition-all duration-300 opacity-75" />
          <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-stella-royal to-stella-purple flex items-center justify-center border-4 border-stella-white/20 shadow-lg transition-transform duration-300 group-hover:translate-y-[-2px] overflow-hidden">
            {characterImage ? (
              <img 
                src={characterImage}
                alt={activeSkin?.skin?.title || "Character"}
                className="w-full h-full object-cover"
              />
            ) : (
              <UserRound className="w-12 h-12 text-stella-white" />
            )}
          </div>
          <button 
            onClick={() => setIsSkinSelectorOpen(true)}
            className="absolute -bottom-2 -right-2 bg-gradient-to-br from-stella-royal to-stella-purple rounded-full p-2 shadow-lg animate-bounce-scale hover:from-stella-purple hover:to-stella-royal transition-all duration-300"
          >
            <Plus className="w-4 h-4 text-stella-white" />
          </button>
        </div>
        
        <div className="text-center space-y-4">
          <h3 className="text-2xl font-bold text-stella-white">
            Niveau {level}
          </h3>
          
          <div className="grid grid-cols-2 gap-8">
            <div className="relative p-4 rounded-lg bg-stella-white/5 backdrop-blur-sm border border-stella-white/10 transition-transform duration-300 hover:translate-y-[-2px]">
              <div className="absolute -top-3 -right-3">
                <Award className="w-6 h-6 text-yellow-500" />
              </div>
              <p className="text-sm text-stella-white/60 mb-1">XP Total</p>
              <span className="text-xl font-bold text-stella-white">{totalXP || 0}</span>
            </div>
            
            <div className="relative p-4 rounded-lg bg-stella-white/5 backdrop-blur-sm border border-stella-white/10 transition-transform duration-300 hover:translate-y-[-2px]">
              <div className="absolute -top-3 -right-3">
                <Plus className="w-6 h-6 text-green-500" />
              </div>
              <p className="text-sm text-stella-white/60 mb-1">XP Aujourd'hui</p>
              <span className="text-xl font-bold text-stella-white">{todayXP || 0}</span>
            </div>
          </div>
        </div>
      </div>

      <SkinSelector 
        isOpen={isSkinSelectorOpen}
        onClose={() => setIsSkinSelectorOpen(false)}
      />
    </div>
  );
};
