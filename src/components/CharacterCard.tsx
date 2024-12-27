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

  // Use a separate query for the character image
  const { data: characterImage } = useQuery({
    queryKey: ["characterImage", activeSkin?.skin?.title],
    queryFn: () => getCharacterImage(activeSkin?.skin?.title),
    enabled: !!activeSkin?.skin?.title,
  });

  return (
    <>
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 p-6 backdrop-blur-lg border border-white/20 shadow-xl animate-fade-in">
        <div className="absolute top-0 left-0 w-full h-1 bg-gray-200/20 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <div className="flex flex-col items-center space-y-6">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-lg group-hover:blur-xl transition-all duration-300 opacity-75" />
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center border-4 border-white/20 shadow-lg transform group-hover:scale-105 transition-all duration-300 overflow-hidden">
              {characterImage ? (
                <img 
                  src={characterImage}
                  alt={activeSkin?.skin?.title || "Character"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserRound className="w-12 h-12 text-white" />
              )}
            </div>
            <button 
              onClick={() => setIsSkinSelectorOpen(true)}
              className="absolute -bottom-2 -right-2 bg-gradient-to-br from-green-400 to-green-600 rounded-full p-2 shadow-lg animate-bounce-scale"
            >
              <Plus className="w-4 h-4 text-white" />
            </button>
          </div>
          
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
              Niveau {level}
            </h3>
            
            <div className="grid grid-cols-2 gap-8">
              <div className="relative p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 transform hover:scale-105 transition-all duration-300">
                <div className="absolute -top-3 -right-3">
                  <Award className="w-6 h-6 text-yellow-500" />
                </div>
                <p className="text-sm text-gray-400 mb-1">XP Total</p>
                <span className="text-xl font-bold text-white">{totalXP || 0}</span>
              </div>
              
              <div className="relative p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 transform hover:scale-105 transition-all duration-300">
                <div className="absolute -top-3 -right-3">
                  <Plus className="w-6 h-4 text-green-500" />
                </div>
                <p className="text-sm text-gray-400 mb-1">XP Aujourd'hui</p>
                <span className="text-xl font-bold text-white">{todayXP || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <SkinSelector 
        isOpen={isSkinSelectorOpen}
        onClose={() => setIsSkinSelectorOpen(false)}
      />
    </>
  );
};