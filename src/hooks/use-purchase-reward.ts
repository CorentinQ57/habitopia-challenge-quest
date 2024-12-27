import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Reward {
  id: string;
  title: string;
  description: string;
  cost: number;
  level: number;
  is_freeze_token?: boolean;
}

export const usePurchaseReward = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const purchaseReward = async (reward: Reward, totalXP: number) => {
    if (totalXP < reward.cost) {
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

      // 1. Déduire les points d'expérience d'abord
      const { error: xpError } = await supabase
        .from("habit_logs")
        .insert([{
          habit_id: null,
          experience_gained: -reward.cost,
          notes: `Achat de la récompense: ${reward.title}`
        }]);

      if (xpError) throw xpError;

      // 2. Ajouter la récompense à l'utilisateur
      const { error: purchaseError } = await supabase
        .from("user_rewards")
        .insert([{ 
          reward_id: reward.id,
          user_id: user.id
        }]);

      if (purchaseError) throw purchaseError;

      // 3. Gérer le jeton de gel si applicable
      if (reward.is_freeze_token) {
        const { data: streakData, error: streakError } = await supabase
          .from("user_streaks")
          .select("freeze_tokens")
          .eq('user_id', user.id)
          .maybeSingle();

        if (streakError) throw streakError;

        const { error: freezeError } = await supabase
          .from("user_streaks")
          .update({ 
            freeze_tokens: (streakData?.freeze_tokens || 0) + 1
          })
          .eq('user_id', user.id);

        if (freezeError) throw freezeError;
      }

      // 4. Invalider les requêtes pour mettre à jour l'interface
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

  return { purchaseReward };
};