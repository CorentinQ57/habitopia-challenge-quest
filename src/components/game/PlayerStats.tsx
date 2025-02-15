
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const PlayerStats = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  // Récupérer les stats du joueur
  const { data: stats, refetch: refetchStats } = useQuery({
    queryKey: ["playerStats"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("player_stats")
        .select("*")
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
  });

  // Mettre à jour une stat
  const updateStat = async (field: 'strength_points' | 'health_points') => {
    try {
      if (!stats || stats.available_xp < 100) {
        toast({
          title: "Points insuffisants",
          description: "Il vous faut 100 points d'XP pour augmenter une caractéristique",
          variant: "destructive",
        });
        return;
      }

      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("player_stats")
        .update({ 
          [field]: (stats?.[field] || 0) + 1,
          available_xp: stats.available_xp - 100
        })
        .eq('user_id', user.id);

      if (error) throw error;

      // Rafraîchir à la fois les stats du joueur et dans GameScene
      await queryClient.invalidateQueries({ queryKey: ["playerStats"] });
      await refetchStats();
      
      toast({
        title: "Statistiques mises à jour",
        description: field === 'strength_points' ? "Force augmentée!" : "Points de vie augmentés!",
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour les statistiques",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Stats de base niveau 1
  const baseStrength = 20;
  const baseHealth = 100;
  
  // Stats actuelles avec bonus
  const currentStrength = baseStrength + (stats?.strength_points || 0) * 10;
  const currentHealth = baseHealth + (stats?.health_points || 0) * 20;

  return (
    <Card className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">Caractéristiques</h3>
        <span className="text-sm">
          XP disponible: <span className="font-medium">{stats?.available_xp || 0}</span>
          <br/>
          <span className="text-xs text-muted-foreground">(Coût: 100 XP / point)</span>
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Force</span>
            <span className="font-medium">{currentStrength}</span>
          </div>
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => updateStat('strength_points')}
            disabled={isLoading || !stats || stats.available_xp < 100}
          >
            <Plus className="w-4 h-4 mr-2" />
            Augmenter ({stats?.strength_points || 0})
          </Button>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Points de Vie</span>
            <span className="font-medium">{currentHealth}</span>
          </div>
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => updateStat('health_points')}
            disabled={isLoading || !stats || stats.available_xp < 100}
          >
            <Plus className="w-4 h-4 mr-2" />
            Augmenter ({stats?.health_points || 0})
          </Button>
        </div>
      </div>
    </Card>
  );
};
