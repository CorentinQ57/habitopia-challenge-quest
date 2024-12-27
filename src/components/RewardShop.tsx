import { useQuery } from "@tanstack/react-query";
import { Gem, ShoppingBag, Award } from "lucide-react";
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

  const getLevelColor = (level: number): string => {
    const colors = {
      1: "bg-emerald-100 text-emerald-700",
      2: "bg-blue-100 text-blue-700",
      3: "bg-purple-100 text-purple-700",
      4: "bg-amber-100 text-amber-700",
    };
    return colors[level as keyof typeof colors] || "bg-gray-100 text-gray-700";
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rewards?.map((reward) => (
          <Card key={reward.id} className="overflow-hidden transition-all duration-300 hover:shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{reward.title}</CardTitle>
                <span className={`px-3 py-1 rounded-full text-sm ${getLevelColor(reward.level)}`}>
                  Niveau {reward.level}
                </span>
              </div>
              {reward.description && (
                <p className="text-sm text-muted-foreground">{reward.description}</p>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <Award className="w-5 h-5 text-primary" />
                  <span className="font-semibold">{reward.cost} XP</span>
                </div>
                <Button
                  onClick={() => purchaseReward(reward)}
                  disabled={totalXP ? totalXP < reward.cost : true}
                  variant={totalXP && totalXP >= reward.cost ? "default" : "outline"}
                >
                  {totalXP && totalXP >= reward.cost ? "Débloquer" : "Points insuffisants"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};