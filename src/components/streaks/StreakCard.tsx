import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame, Snowflake } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FreezeButton } from "./FreezeButton";
import { StreakStats } from "./StreakStats";
import { cn } from "@/lib/utils";

export const StreakCard = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: streak } = useQuery({
    queryKey: ["userStreak"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // First try to get the most recent streak
      const { data: streaks, error: fetchError } = await supabase
        .from("user_streaks")
        .select("*")
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (fetchError) throw fetchError;

      const today = new Date().toISOString().split('T')[0];

      // If no streak exists, create one
      if (!streaks || streaks.length === 0) {
        const { data: newStreak, error: createError } = await supabase
          .from("user_streaks")
          .insert([{
            user_id: user.id,
            current_streak: 0,
            longest_streak: 0,
            tasks_completed_today: 0,
            last_activity_date: today,
            freeze_tokens: 0,
            freeze_used_date: null
          }])
          .select()
          .single();

        if (createError) throw createError;
        return newStreak;
      }

      return streaks[0];
    },
  });

  const useFreeze = async () => {
    if (!streak || streak.freeze_tokens <= 0) return;

    const today = new Date().toISOString().split('T')[0];
    const lastActivityDate = new Date(streak.last_activity_date).toISOString().split('T')[0];

    // Vérifier si la série du jour a déjà été validée
    if (lastActivityDate === today && streak.tasks_completed_today >= 3) {
      toast({
        title: "Action impossible",
        description: "Vous avez déjà validé votre série aujourd'hui.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Mettre à jour le streak en ajoutant +1 et en marquant le glaçon comme utilisé
      const { error } = await supabase
        .from("user_streaks")
        .update({ 
          freeze_tokens: streak.freeze_tokens - 1,
          freeze_used_date: today,
          current_streak: streak.current_streak + 1,
          longest_streak: Math.max(streak.longest_streak, streak.current_streak + 1),
          tasks_completed_today: 3 // On considère que le glaçon valide la journée
        })
        .eq("id", streak.id)
        .eq("user_id", streak.user_id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["userStreak"] });

      toast({
        title: "Série gelée !",
        description: "Votre série est protégée pour aujourd'hui.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'utiliser le glaçon.",
        variant: "destructive",
      });
    }
  };

  if (!streak) return null;

  const isStreakFrozen = streak.freeze_used_date === new Date().toISOString().split('T')[0];

  return (
    <Card className={cn(
      "bg-gradient-to-br from-orange-500/10 to-red-500/10 backdrop-blur-sm transition-colors duration-300",
      isStreakFrozen && "from-blue-500/10 to-blue-400/10"
    )}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isStreakFrozen ? (
              <Snowflake className="w-5 h-5 text-blue-500" />
            ) : (
              <Flame className="w-5 h-5 text-orange-500" />
            )}
            Série en cours
          </div>
          <FreezeButton 
            freezeTokens={streak.freeze_tokens || 0} 
            onUseFreeze={useFreeze}
          />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <StreakStats 
          currentStreak={streak.current_streak}
          longestStreak={streak.longest_streak}
          tasksCompletedToday={streak.tasks_completed_today}
        />
      </CardContent>
    </Card>
  );
};