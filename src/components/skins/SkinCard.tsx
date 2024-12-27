import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Coins, ShoppingBag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface SkinCardProps {
  skin: {
    id: string;
    title: string;
    description: string | null;
    cost: number;
    type: string;
    theme_colors: any;
  };
}

export const SkinCard = ({ skin }: SkinCardProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  const { data: userSkins } = useQuery({
    queryKey: ["userSkins"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_skins")
        .select("*");
      
      if (error) throw error;
      return data;
    },
  });

  const isOwned = userSkins?.some(userSkin => userSkin.skin_id === skin.id);

  const purchaseSkin = async () => {
    if (totalXP && totalXP < skin.cost) {
      toast({
        title: "Points insuffisants",
        description: `Il vous manque ${skin.cost - totalXP} points d'expérience.`,
        variant: "destructive",
      });
      return;
    }

    try {
      // Insert the skin purchase
      const { error: purchaseError } = await supabase
        .from("user_skins")
        .insert([{ skin_id: skin.id }]);

      if (purchaseError) throw purchaseError;

      // Deduct XP by adding a negative log
      const { error: xpError } = await supabase
        .from("habit_logs")
        .insert([{
          habit_id: null,
          experience_gained: -skin.cost,
          notes: `Achat du skin: ${skin.title}`
        }]);

      if (xpError) throw xpError;

      // Refresh data
      queryClient.invalidateQueries({ queryKey: ["totalXP"] });
      queryClient.invalidateQueries({ queryKey: ["userSkins"] });

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
    }
  };

  const previewStyle = skin.type === 'theme' && skin.theme_colors 
    ? {
        background: `linear-gradient(135deg, ${skin.theme_colors.primary}, ${skin.theme_colors.secondary})`,
      }
    : {};

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <div 
        className="aspect-video w-full bg-gradient-to-br from-muted/50 to-muted flex items-center justify-center"
        style={previewStyle}
      >
        {skin.type === 'character' && (
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary-foreground flex items-center justify-center">
            <User className="w-12 h-12 text-white" />
          </div>
        )}
      </div>
      
      <CardHeader>
        <CardTitle>{skin.title}</CardTitle>
        {skin.description && (
          <CardDescription>{skin.description}</CardDescription>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="flex items-center gap-2 text-lg font-semibold">
          <Coins className="w-5 h-5 text-yellow-500" />
          <span>{skin.cost} XP</span>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={purchaseSkin}
          disabled={isOwned || (totalXP ? totalXP < skin.cost : true)}
          className="w-full"
          variant={isOwned ? "outline" : "default"}
        >
          <ShoppingBag className="w-4 h-4 mr-2" />
          {isOwned ? "Déjà possédé" : "Acheter"}
        </Button>
      </CardFooter>
    </Card>
  );
};