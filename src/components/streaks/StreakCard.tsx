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
      const { data: existingStreak, error: fetchError } = await supabase
        .from("user_streaks")
        .select("*")
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (!existingStreak) {
        const { data: newStreak, error: createError } = await supabase
          .from("user_streaks")
          .insert([{
            freeze_used_date: null
          }])
          .select()
          .single();

        if (createError) throw createError;
        return newStreak;
      }

      return existingStreak;
    },
  });

  const useFreeze = async () => {
    if (!streak || streak.freeze_tokens <= 0) return;

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