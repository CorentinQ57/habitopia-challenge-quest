import { useQuery } from "@tanstack/react-query";
import { Gem, ShoppingBag, Award, Trophy, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { RewardCard } from "./rewards/RewardCard";
import { AddRewardDialog } from "./rewards/AddRewardDialog";

const getLevelIcon = (level: number) => {
  switch (level) {
    case 1:
      return <Star className="w-5 h-5 text-yellow-500" />;
    case 2:
      return <Award className="w-5 h-5 text-blue-500" />;
    case 3:
      return <Gem className="w-5 h-5 text-purple-500" />;
    case 4:
      return <Trophy className="w-5 h-5 text-amber-500" />;
    default:
      return <Star className="w-5 h-5 text-gray-500" />;
  }
};

const getLevelColor = (level: number): string => {
  const colors = {
    1: "from-yellow-500/20 to-yellow-500/10 border-yellow-500/20",
    2: "from-blue-500/20 to-blue-500/10 border-blue-500/20",
    3: "from-purple-500/20 to-purple-500/10 border-purple-500/20",
    4: "from-amber-500/20 to-amber-500/10 border-amber-500/20",
  };
  return colors[level as keyof typeof colors] || "from-gray-500/20 to-gray-500/10 border-gray-500/20";
};

export const RewardShop = () => {
  const { data: rewards } = useQuery({
    queryKey: ["rewards"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rewards")
        .select("*")
        .order("cost", { ascending: true });
      
      if (error) throw error;
      return data;
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

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          className="group relative overflow-hidden shadow-lg transition-all duration-300 animate-bounce-scale border-b-4 border-[#3f2b96]/20 active:border-b-0 active:translate-y-1 w-full"
          size="lg"
          style={{
            background: 'linear-gradient(135deg, #a8c0ff, #3f2b96)',
            boxShadow: '0 4px 15px rgba(63, 43, 150, 0.3)'
          }}
        >
          <div className="absolute inset-0 bg-white/20 group-hover:bg-white/30 transition-colors" />
          <span className="relative flex items-center justify-between w-full">
            <span className="flex items-center gap-2 text-stella-white">
              <ShoppingBag className="w-5 h-5" />
              Boutique
            </span>
            <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full text-sm">
              <Gem className="w-4 h-4" />
              <span>{totalXP || 0}</span>
            </div>
          </span>
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto bg-gradient-to-br from-background/95 to-background/98 backdrop-blur-sm border-l-2 border-primary/20">
        <SheetHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-3 text-2xl">
              <ShoppingBag className="w-6 h-6 text-primary" />
              Boutique de Récompenses
            </SheetTitle>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
                <Gem className="w-5 h-5 text-primary" />
                <span className="font-semibold">{totalXP || 0} XP</span>
              </div>
              <AddRewardDialog />
            </div>
          </div>
        </SheetHeader>

        <div className="mt-8 space-y-4">
          {rewards?.map((reward) => (
            <RewardCard
              key={reward.id}
              reward={reward}
              totalXP={totalXP || 0}
              getLevelIcon={getLevelIcon}
              getLevelColor={getLevelColor}
            />
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
};