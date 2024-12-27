import { useQuery } from "@tanstack/react-query";
import { Plus, Gift } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { AddRewardDialog } from "@/components/rewards/AddRewardDialog";
import { RewardGrid } from "@/components/rewards/RewardGrid";

const RewardManagement = () => {
  const { data: userRewards, isLoading } = useQuery({
    queryKey: ["userRewards"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      const { data, error } = await supabase
        .from("user_rewards")
        .select(`
          id,
          purchased_at,
          reward:rewards (
            id,
            title,
            description,
            cost,
            level
          )
        `)
        .eq("user_id", user.id)
        .order("purchased_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mes Récompenses</h1>
          <p className="text-muted-foreground mt-2">
            Gérez vos récompenses et débloquez de nouveaux avantages
          </p>
        </div>
        <AddRewardDialog />
      </div>

      {userRewards?.length === 0 ? (
        <div className="text-center py-12 bg-muted/50 rounded-lg">
          <Gift className="w-12 h-12 mx-auto text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Aucune récompense</h3>
          <p className="text-muted-foreground mt-2">
            Vous n'avez pas encore de récompenses. Commencez par en créer une !
          </p>
          <Button className="mt-4" onClick={() => document.querySelector<HTMLButtonElement>("[data-new-reward]")?.click()}>
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle Récompense
          </Button>
        </div>
      ) : (
        <RewardGrid rewards={userRewards} />
      )}
    </div>
  );
};

export default RewardManagement;