import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame, Snowflake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

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
          .insert([{}])
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
          last_activity_date: new Date().toISOString().split('T')[0]
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

  return (
    <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            Série en cours
          </div>
          {streak.freeze_tokens > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={useFreeze}
              className="flex items-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20"
            >
              <Snowflake className="w-4 h-4 text-blue-500" />
              <span className="text-blue-500">Utiliser un glaçon ({streak.freeze_tokens})</span>
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
            <p className="text-sm text-muted-foreground mb-1">Série actuelle</p>
            <p className="text-2xl font-bold">{streak.current_streak} jours</p>
          </div>
          <div className="p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
            <p className="text-sm text-muted-foreground mb-1">Record</p>
            <p className="text-2xl font-bold">{streak.longest_streak} jours</p>
          </div>
          <div className="col-span-2 p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
            <p className="text-sm text-muted-foreground mb-1">Aujourd'hui</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((streak.tasks_completed_today / 3) * 100, 100)}%` }}
                />
              </div>
              <span className="text-sm font-medium">
                {streak.tasks_completed_today}/3
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};