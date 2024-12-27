import { useState } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gem, Check, Badge as BadgeIcon } from "lucide-react";

interface SkinCardProps {
  skin: {
    id: string;
    title: string;
    description: string | null;
    preview_url: string | null;
    cost: number;
    type: string;
  };
  canPurchase: boolean;
}

export const SkinCard = ({ skin, canPurchase }: SkinCardProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isPurchasing, setIsPurchasing] = useState(false);

  // Check if the skin is already purchased
  const { data: isOwned } = useQuery({
    queryKey: ["skinOwnership", skin.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_skins")
        .select("id")
        .eq("skin_id", skin.id)
        .maybeSingle();
      
      if (error) throw error;
      return !!data;
    },
  });

  const purchaseSkin = async () => {
    try {
      setIsPurchasing(true);

      // Double check if skin is already owned before purchase
      const { data: existingPurchase } = await supabase
        .from("user_skins")
        .select("id")
        .eq("skin_id", skin.id)
        .maybeSingle();

      if (existingPurchase) {
        toast({
          title: "Skin déjà possédé",
          description: "Vous possédez déjà ce skin !",
          variant: "destructive",
        });
        return;
      }

      // Insérer l'achat du skin
      const { error: purchaseError } = await supabase
        .from("user_skins")
        .insert([{ 
          skin_id: skin.id,
          is_active: false
        }]);

      if (purchaseError) throw purchaseError;

      // Déduire l'XP
      const { error: xpError } = await supabase
        .from("habit_logs")
        .insert([{
          habit_id: null,
          experience_gained: -skin.cost,
          notes: `Achat du skin: ${skin.title}`
        }]);

      if (xpError) throw xpError;

      // Rafraîchir les données
      queryClient.invalidateQueries({ queryKey: ["totalXP"] });
      queryClient.invalidateQueries({ queryKey: ["userSkins"] });
      queryClient.invalidateQueries({ queryKey: ["skinOwnership", skin.id] });

      toast({
        title: "Skin débloqué !",
        description: `Vous avez débloqué : ${skin.title}`,
      });
    } catch (error) {
      console.error("Erreur lors de l'achat:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'acheter le skin.",
        variant: "destructive",
      });
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-lg border bg-gradient-to-br from-background/50 to-background/30 p-4 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
      {isOwned && (
        <Badge className="absolute right-2 top-2 z-10 flex items-center gap-1.5 bg-primary/20 text-primary hover:bg-primary/30">
          <BadgeIcon className="h-3 w-3" />
          Possédé
        </Badge>
      )}
      
      {skin.preview_url && (
        <div className="mb-4 aspect-video w-full overflow-hidden rounded-md">
          <img 
            src={skin.preview_url} 
            alt={skin.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">{skin.title}</h3>
          <div className="flex items-center gap-1 bg-background/40 px-2 py-1 rounded-full text-sm">
            <Gem className="w-4 h-4 text-primary" />
            <span>{skin.cost}</span>
          </div>
        </div>

        {skin.description && (
          <p className="text-sm text-muted-foreground">{skin.description}</p>
        )}

        <Button
          onClick={purchaseSkin}
          disabled={!canPurchase || isPurchasing || isOwned}
          variant={isOwned ? "secondary" : canPurchase ? "default" : "outline"}
          className="w-full"
        >
          {isOwned ? (
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              Déjà possédé
            </span>
          ) : isPurchasing ? (
            "Achat en cours..."
          ) : canPurchase ? (
            "Acheter"
          ) : (
            "Points insuffisants"
          )}
        </Button>
      </div>
    </div>
  );
};