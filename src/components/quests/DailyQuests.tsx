import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const DailyQuests = () => {
  const { toast } = useToast();
  const { data: quests, refetch } = useQuery({
    queryKey: ["dailyQuests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("daily_quests")
        .select("*")
        .eq("is_active", true)
        .is("completed_at", null)
        .order("created_at");
      
      if (error) throw error;
      return data;
    },
  });

  const handleCompleteQuest = async (questId: string, xp: number) => {
    try {
      const { error } = await supabase
        .from("daily_quests")
        .update({ completed_at: new Date().toISOString() })
        .eq("id", questId);

      if (error) throw error;

      await supabase
        .from("habit_logs")
        .insert([{
          notes: "Quête journalière complétée",
          experience_gained: xp
        }]);

      toast({
        title: "Quête complétée !",
        description: `+${xp} points d'expérience gagnés !`,
      });

      refetch();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de compléter la quête.",
        variant: "destructive",
      });
    }
  };

  if (!quests?.length) return null;

  return (
    <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-500" />
          Quêtes Journalières
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {quests.map((quest) => (
          <div
            key={quest.id}
            className="flex items-center justify-between gap-4 p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 transition-all duration-300 hover:bg-white/10"
          >
            <div>
              <h4 className="font-medium">{quest.title}</h4>
              {quest.description && (
                <p className="text-sm text-muted-foreground">{quest.description}</p>
              )}
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-amber-500">
                +{quest.experience_points} XP
              </span>
              <button
                onClick={() => handleCompleteQuest(quest.id, quest.experience_points)}
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
              >
                <Check className="w-4 h-4 text-green-500" />
              </button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};