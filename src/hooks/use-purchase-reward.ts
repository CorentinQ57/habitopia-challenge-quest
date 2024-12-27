import { useState } from "react";
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
  const [isPurchasing, setIsPurchasing] = useState(false);

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
      setIsPurchasing(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // 1. Vérifier si l'utilisateur possède déjà la récompense
      const { data: existingReward } = await supabase
        .from("user_rewards")
        .select("id")
        .eq("reward_id", reward.id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (existingReward) {
        toast({
          title: "Récompense déjà possédée",
          description: "Vous possédez déjà cette récompense !",
          variant: "destructive",
        });
        return;
      }

      // 2. Déduire les points d'expérience
      const { error: xpError } = await supabase
        .from("habit_logs")
        .insert([{
          habit_id: null,
          experience_gained: -reward.cost,
          notes: `Achat de la récompense: ${reward.title}`,
          user_id: user.id
        }]);

      if (xpError) throw xpError;

      // 3. Ajouter la récompense à l'utilisateur
      const { error: purchaseError } = await supabase
        .from("user_rewards")
        .insert([{ 
          reward_id: reward.id,
          user_id: user.id
        }]);

      if (purchaseError) {
        // En cas d'erreur, rembourser les points
        await supabase
          .from("habit_logs")
          .insert([{
            habit_id: null,
            experience_gained: reward.cost,
            notes: `Remboursement - Échec de l'achat: ${reward.title}`,
            user_id: user.id
          }]);

        throw purchaseError;
      }

      // 4. Gérer le jeton de gel si applicable
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

      // 5. Invalider les requêtes pour mettre à jour l'interface
      queryClient.invalidateQueries({ queryKey: ["totalXP"] });
      queryClient.invalidateQueries({ queryKey: ["userRewards"] });
      queryClient.invalidateQueries({ queryKey: ["rewardOwnership", reward.id] });
      if (reward.is_freeze_token) {
        queryClient.invalidateQueries({ queryKey: ["userStreak"] });
      }

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
    } finally {
      setIsPurchasing(false);
    }
  };

  return { purchaseReward, isPurchasing };
};