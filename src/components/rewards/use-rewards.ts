import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useRewards = () => {
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

  const purchaseReward = async (reward: any) => {
    if (totalXP && totalXP < reward.cost) {
      toast({
        title: "Points insuffisants",
        description: `Il vous manque ${reward.cost - totalXP} points d'expérience.`,
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // First, insert the user reward
      const { error: purchaseError } = await supabase
        .from("user_rewards")
        .insert([{ 
          reward_id: reward.id,
          user_id: user.id
        }]);

      if (purchaseError) throw purchaseError;

      // If it's a freeze token, update the user's streak
      if (reward.is_freeze_token) {
        const { data: streakData, error: streakError } = await supabase
          .from("user_streaks")
          .select("freeze_tokens")
          .maybeSingle();

        if (streakError) throw streakError;

        const { error: freezeError } = await supabase
          .from("user_streaks")
          .update({ 
            freeze_tokens: (streakData?.freeze_tokens || 0) + 1
          })
          .eq("user_id", user.id);

        if (freezeError) throw freezeError;
      }

      // Finally, deduct the XP
      const { error: xpError } = await supabase
        .from("habit_logs")
        .insert([{
          habit_id: null,
          experience_gained: -reward.cost,
          notes: `Achat de la récompense: ${reward.title}`
        }]);

      if (xpError) throw xpError;

      // Invalidate relevant queries
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

  return {
    rewards,
    totalXP,
    purchaseReward
  };
};