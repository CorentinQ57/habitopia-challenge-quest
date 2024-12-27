import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Gem, ShoppingBag, Award, Trophy, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

interface Reward {
  id: string;
  title: string;
  description: string;
  cost: number;
  level: number;
  is_freeze_token?: boolean;
}

export const RewardShop = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
      const { data, error } = await supabase
        .from("habit_logs")
        .select("experience_gained");
      
      if (error) throw error;
      return data.reduce((sum, log) => sum + log.experience_gained, 0);
    },
  });

  const purchaseReward = async (reward: Reward) => {
    if (totalXP && totalXP < reward.cost) {
      toast({
        title: "Points insuffisants",
        description: `Il vous manque ${reward.cost - totalXP} points d'expérience.`,
        variant: "destructive",
      });
      return;
    }

    try {
      // Insérer l'achat de la récompense
      const { error: purchaseError } = await supabase
        .from("user_rewards")
        .insert([{ reward_id: reward.id }]);

      if (purchaseError) throw purchaseError;

      // Si c'est un glaçon, mettre à jour le nombre de glaçons disponibles
      if (reward.is_freeze_token) {
        const { data: streakData, error: streakError } = await supabase
          .from("user_streaks")
          .select("freeze_tokens")
          .single();

        if (streakError) throw streakError;

        const { error: freezeError } = await supabase
          .from("user_streaks")
          .update({ 
            freeze_tokens: (streakData?.freeze_tokens || 0) + 1
          })
          .not("id", "is", null);

        if (freezeError) throw freezeError;
      }

      // Déduire l'XP en ajoutant un log négatif
      const { error: xpError } = await supabase
        .from("habit_logs")
        .insert([{
          habit_id: null,
          experience_gained: -reward.cost,
          notes: `Achat de la récompense: ${reward.title}`
        }]);

      if (xpError) throw xpError;

      // Rafraîchir les données
      queryClient.invalidateQueries({ queryKey: ["totalXP"] });
      queryClient.invalidateQueries({ queryKey: ["userStreak"] });

      toast({
        title: "Récompense débloquée !",
        description: `Vous avez débloqué : ${reward.title}`,
      });
    } catch (error) {
      console.error("Erreur lors de l'achat:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'acheter la récompense.",
        variant: "destructive",
      });
    }
  };

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

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          className="group relative overflow-hidden bg-gradient-to-br from-primary/90 to-primary shadow-lg hover:shadow-primary/50 transition-all duration-300 animate-bounce-scale border-b-4 border-primary-foreground/20 active:border-b-0 active:translate-y-1"
          size="lg"
        >
          <div className="absolute inset-0 bg-white/20 group-hover:bg-white/30 transition-colors" />
          <span className="relative flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Boutique
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
            <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
              <Gem className="w-5 h-5 text-primary" />
              <span className="font-semibold">{totalXP || 0} XP</span>
            </div>
          </div>
        </SheetHeader>

        <div className="mt-8 space-y-4">
          {rewards?.map((reward) => (
            <div
              key={reward.id}
              className={`relative overflow-hidden rounded-lg border bg-gradient-to-br ${getLevelColor(reward.level)} p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {getLevelIcon(reward.level)}
                  <h3 className="text-lg font-semibold">{reward.title}</h3>
                </div>
                <div className="flex items-center gap-2 bg-background/40 px-3 py-1 rounded-full">
                  <Gem className="w-4 h-4 text-primary" />
                  <span className="font-semibold">{reward.cost} XP</span>
                </div>
              </div>
              
              {reward.description && (
                <p className="text-sm text-muted-foreground mb-4">{reward.description}</p>
              )}

              <Button
                onClick={() => purchaseReward(reward)}
                disabled={totalXP ? totalXP < reward.cost : true}
                variant={totalXP && totalXP >= reward.cost ? "default" : "outline"}
                className="w-full bg-background/50 hover:bg-background/70"
              >
                {totalXP && totalXP >= reward.cost ? "Débloquer" : "Points insuffisants"}
              </Button>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
};