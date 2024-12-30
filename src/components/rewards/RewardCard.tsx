import { Gem, Trash2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { usePurchaseReward } from "@/hooks/use-purchase-reward";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface Reward {
  id: string;
  title: string;
  description: string;
  cost: number;
  level: number;
  is_freeze_token?: boolean;
  user_id?: string | null;
}

interface RewardCardProps {
  reward: Reward;
  totalXP: number;
  getLevelIcon: (level: number) => JSX.Element;
  getLevelColor: (level: number) => string;
}

export const RewardCard = ({ reward, totalXP, getLevelIcon, getLevelColor }: RewardCardProps) => {
  const { purchaseReward, isPurchasing } = usePurchaseReward();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const { data: isOwned } = useQuery({
    queryKey: ["rewardOwnership", reward.id],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from("user_rewards")
        .select("id")
        .eq("reward_id", reward.id)
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (error) throw error;
      return !!data;
    },
  });

  const handleDelete = async () => {
    try {
      console.log("Deleting reward:", reward.id); // Debug log

      // Vérifier que la récompense n'est pas un jeton de gel
      if (reward.is_freeze_token) {
        throw new Error("Cannot delete freeze tokens");
      }

      const { error } = await supabase
        .from("rewards")
        .delete()
        .eq("id", reward.id);

      if (error) {
        console.error("Delete error:", error);
        throw error;
      }

      // Invalider les requêtes après une suppression réussie
      await queryClient.invalidateQueries({ queryKey: ["rewards"] });
      await queryClient.invalidateQueries({ queryKey: ["rewardOwnership"] });
      
      toast({
        title: "Récompense supprimée",
        description: "La récompense a été supprimée avec succès.",
      });
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la récompense.",
        variant: "destructive",
      });
    } finally {
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <div
        className={`relative overflow-hidden rounded-lg border bg-gradient-to-br ${getLevelColor(reward.level)} p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            {getLevelIcon(reward.level)}
            <h3 className="text-lg font-semibold">{reward.title}</h3>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-background/40 px-3 py-1 rounded-full">
              <Gem className="w-4 h-4 text-primary" />
              <span className="font-semibold">{reward.cost} XP</span>
            </div>
            {!reward.is_freeze_token && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 bg-background/40 hover:bg-red-500 hover:text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteDialog(true);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        {reward.description && (
          <p className="text-sm text-muted-foreground mb-4">{reward.description}</p>
        )}

        <Button
          onClick={() => purchaseReward(reward, totalXP)}
          disabled={totalXP < reward.cost || isPurchasing || isOwned}
          variant={isOwned || totalXP < reward.cost ? "outline" : "default"}
          className={`w-full ${
            isOwned || totalXP < reward.cost
              ? "bg-background/50 hover:bg-background/70"
              : "bg-background/50 hover:bg-background/70"
          }`}
        >
          {isOwned ? (
            "Déjà possédé"
          ) : isPurchasing ? (
            "Achat en cours..."
          ) : totalXP >= reward.cost ? (
            "Acheter"
          ) : (
            "Points insuffisants"
          )}
        </Button>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la récompense</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer définitivement la récompense "{reward.title}" ?
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteDialog(false)}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};