import { useQuery } from "@tanstack/react-query";
import { Gem, ShoppingBag, Award, Trophy, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Reward {
  id: string;
  title: string;
  description: string;
  cost: number;
  level: number;
}

export const RewardShop = () => {
  const { toast } = useToast();

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
      const { error } = await supabase
        .from("user_rewards")
        .insert([{ reward_id: reward.id }]);

      if (error) throw error;

      toast({
        title: "Récompense débloquée !",
        description: `Vous avez débloqué : ${reward.title}`,
      });
    } catch (error) {
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
      1: "bg-yellow-100 text-yellow-700 border-yellow-200",
      2: "bg-blue-100 text-blue-700 border-blue-200",
      3: "bg-purple-100 text-purple-700 border-purple-200",
      4: "bg-amber-100 text-amber-700 border-amber-200",
    };
    return colors[level as keyof typeof colors] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">Boutique de Récompenses</h2>
        </div>
        <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
          <Gem className="w-5 h-5 text-primary" />
          <span className="font-semibold">{totalXP || 0} XP</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 max-w-2xl mx-auto">
        {rewards?.map((reward) => (
          <Card 
            key={reward.id} 
            className={`overflow-hidden transition-all duration-300 hover:shadow-lg border-l-4 ${getLevelColor(reward.level)}`}
          >
            <CardHeader className="pb-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  {getLevelIcon(reward.level)}
                  <CardTitle className="text-lg">{reward.title}</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Gem className="w-4 h-4 text-primary" />
                  <span className="font-semibold">{reward.cost} XP</span>
                </div>
              </div>
              {reward.description && (
                <p className="text-sm text-muted-foreground mt-2">{reward.description}</p>
              )}
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => purchaseReward(reward)}
                disabled={totalXP ? totalXP < reward.cost : true}
                variant={totalXP && totalXP >= reward.cost ? "default" : "outline"}
                className="w-full"
              >
                {totalXP && totalXP >= reward.cost ? "Débloquer" : "Points insuffisants"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};