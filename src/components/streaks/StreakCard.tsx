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
      // First try to get the most recent streak
      const { data: streaks, error: fetchError } = await supabase
        .from("user_streaks")
        .select("*")
        .order('created_at', { ascending: false })
        .limit(1);

      if (fetchError) throw fetchError;

      const today = new Date().toISOString().split('T')[0];

      // If no streak exists, create one
      if (!streaks || streaks.length === 0) {
        const { data: newStreak, error: createError } = await supabase
          .from("user_streaks")
          .insert([{
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

      const currentStreak = streaks[0];
      
      // Reset streak if a day was missed (unless frozen)
      const lastActivityDate = new Date(currentStreak.last_activity_date);
      const todayDate = new Date(today);
      const daysDifference = Math.floor((todayDate.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDifference > 1 && currentStreak.freeze_used_date !== today) {
        const { error: resetError } = await supabase
          .from("user_streaks")
          .update({
            current_streak: 0,
            tasks_completed_today: 0,
            last_activity_date: today
          })
          .eq("id", currentStreak.id);

        if (resetError) throw resetError;
        
        return {
          ...currentStreak,
          current_streak: 0,
          tasks_completed_today: 0,
          last_activity_date: today
        };
      }

      return currentStreak;
    },
  });

  const useFreeze = async () => {
    if (!streak || streak.freeze_tokens <= 0) return;

    // Vérifier si la série du jour a déjà été validée
    if (streak.last_activity_date === new Date().toISOString().split('T')[0]) {
      toast({
        title: "Action impossible",
        description: "Vous avez déjà validé votre série aujourd'hui.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("user_streaks")
        .update({ 
          freeze_tokens: streak.freeze_tokens - 1,
          freeze_used_date: new Date().toISOString().split('T')[0]
        })
        .eq("id", streak.id);

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