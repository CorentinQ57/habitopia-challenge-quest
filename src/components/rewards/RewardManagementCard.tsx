import { useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2, Award, Trophy, Star, Gem } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Reward {
  id: string;
  title: string;
  description: string | null;
  cost: number;
  level: number;
}

interface RewardManagementCardProps {
  reward: Reward;
}

const getLevelIcon = (level: number) => {
  switch (level) {
    case 1:
      return <Star className="w-5 h-5 text-yellow-500" />;
    case 2:
      return <Award className="w-5 h-5 text-blue-500" />;
    case 3:
      return <Gem className="w-5 h-5 text-purple-500" />;
    case 4:
      return <Trophy className="w-5 h-5 text-amber-500" />;
    default:
      return <Star className="w-5 h-5 text-gray-500" />;
  }
};

const getLevelColor = (level: number): string => {
  const colors = {
    1: "from-yellow-500/20 to-yellow-500/10 border-yellow-500/20",
    2: "from-blue-500/20 to-blue-500/10 border-blue-500/20",
    3: "from-purple-500/20 to-purple-500/10 border-purple-500/20",
    4: "from-amber-500/20 to-amber-500/10 border-amber-500/20",
  };
  return colors[level as keyof typeof colors] || "from-gray-500/20 to-gray-500/10 border-gray-500/20";
};

export const RewardManagementCard = ({ reward }: RewardManagementCardProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from("rewards")
        .delete()
        .eq("id", reward.id);

      if (error) throw error;

      toast({
        title: "Récompense supprimée",
        description: "La récompense a été supprimée avec succès.",
      });

      queryClient.invalidateQueries({ queryKey: ["rewards"] });
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la récompense.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className={`relative overflow-hidden bg-gradient-to-br ${getLevelColor(reward.level)}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getLevelIcon(reward.level)}
            <CardTitle>{reward.title}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Pencil className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleDelete}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        {reward.description && (
          <CardDescription>{reward.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 bg-background/40 px-3 py-1 rounded-full w-fit">
          <Gem className="w-4 h-4 text-primary" />
          <span className="font-semibold">{reward.cost} XP</span>
        </div>
      </CardContent>
    </Card>
  );
};