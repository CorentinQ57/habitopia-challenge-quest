import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Reward {
  id: string;
  title: string;
  cost: number;
  is_freeze_token?: boolean;
}

export const usePurchaseReward = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { mutate: purchaseReward, isPending: isPurchasing } = useMutation({
    mutationFn: async ({ reward, totalXP }: { reward: Reward; totalXP: number }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      if (totalXP < reward.cost) {
        throw new Error("Insufficient XP");
      }

      // Déduire les points d'expérience
      const { error: xpError } = await supabase
        .from("habit_logs")
        .insert([{
          habit_id: null,
          experience_gained: -reward.cost,
          notes: `Achat de la récompense: ${reward.title}`,
          user_id: user.id
        }]);

      if (xpError) throw xpError;

      // Ajouter la récompense à l'utilisateur
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

      // Si c'est un glaçon, ajouter un jeton de gel
      if (reward.is_freeze_token) {
        // D'abord, récupérer le nombre actuel de jetons
        const { data: streakData } = await supabase
          .from("user_streaks")
          .select("freeze_tokens")
          .eq("user_id", user.id)
          .single();

        const currentTokens = streakData?.freeze_tokens || 0;

        // Ensuite, mettre à jour avec le nouveau nombre
        const { error: freezeError } = await supabase
          .from("user_streaks")
          .update({ freeze_tokens: currentTokens + 1 })
          .eq("user_id", user.id);

        if (freezeError) throw freezeError;
      }

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["totalXP"] });
      queryClient.invalidateQueries({ queryKey: ["userRewards"] });
      queryClient.invalidateQueries({ queryKey: ["userStreaks"] });
      toast({
        title: "Récompense achetée !",
        description: "La récompense a été ajoutée à votre inventaire.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'acheter la récompense.",
        variant: "destructive",
      });
    },
  });

  return {
    purchaseReward: (reward: Reward, totalXP: number) => purchaseReward({ reward, totalXP }),
    isPurchasing,
  };
};