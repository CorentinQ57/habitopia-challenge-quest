import { Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { updateUserStreak } from "@/utils/streakManagement";
import { CancelHabitDialog } from "./CancelHabitDialog";
import { DeleteHabitButton } from "./DeleteHabitButton";
import { CategoryBadge } from "./CategoryBadge";
import { CompleteHabitButton } from "./CompleteHabitButton";
import { ExperiencePoints } from "./ExperiencePoints";

interface Habit {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  is_popular: boolean;
  created_at: string;
  experience_points: number;
}

interface HabitCardProps {
  habit: Habit;
}

export const HabitCard = ({ habit }: HabitCardProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCompleted, setIsCompleted] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const { data: habitLog } = useQuery({
    queryKey: ["habitLog", habit.id],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data } = await supabase
        .from("habit_logs")
        .select("*")
        .eq("habit_id", habit.id)
        .gte("completed_at", `${today}T00:00:00`)
        .lte("completed_at", `${today}T23:59:59`)
        .maybeSingle();
      
      return data;
    },
  });

  useEffect(() => {
    setIsCompleted(!!habitLog);
  }, [habitLog]);

  const handleClick = () => {
    if (isCompleted) {
      setShowCancelDialog(true);
    } else {
      handleComplete();
    }
  };

  const handleCancelHabit = async () => {
    try {
      if (!habitLog) return;

      const today = new Date().toISOString().split('T')[0];
      const { data: habitsCompleted } = await supabase
        .from("habit_logs")
        .select("id")
        .gte("completed_at", `${today}T00:00:00`)
        .lte("completed_at", `${today}T23:59:59`);

      const tasksCompletedToday = (habitsCompleted?.length || 1) - 1;

      await supabase
        .from("habit_logs")
        .delete()
        .eq('id', habitLog.id);

      await updateUserStreak(tasksCompletedToday);

      setIsCompleted(false);
      setShowCancelDialog(false);

      queryClient.invalidateQueries({ queryKey: ["todayXP"] });
      queryClient.invalidateQueries({ queryKey: ["totalXP"] });
      queryClient.invalidateQueries({ queryKey: ["userStreak"] });
      queryClient.invalidateQueries({ queryKey: ["weeklyStats"] });
      queryClient.invalidateQueries({ queryKey: ["habitLog", habit.id] });

      toast({
        title: "Habitude annulée",
        description: "L'habitude a été annulée pour aujourd'hui.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'annuler l'habitude.",
        variant: "destructive",
      });
    }
  };

  const handleComplete = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data: habitsCompleted } = await supabase
        .from("habit_logs")
        .select("id")
        .gte("completed_at", `${today}T00:00:00`)
        .lte("completed_at", `${today}T23:59:59`);

      const tasksCompletedToday = (habitsCompleted?.length || 0) + 1;

      await updateUserStreak(tasksCompletedToday);

      const { error: habitError } = await supabase
        .from("habit_logs")
        .insert([{ 
          habit_id: habit.id,
          experience_gained: habit.experience_points,
          notes: `Habitude complétée: ${habit.title}`
        }]);

      if (habitError) throw habitError;

      setIsCompleted(true);
      
      queryClient.invalidateQueries({ queryKey: ["todayXP"] });
      queryClient.invalidateQueries({ queryKey: ["totalXP"] });
      queryClient.invalidateQueries({ queryKey: ["userStreak"] });
      queryClient.invalidateQueries({ queryKey: ["weeklyStats"] });
      queryClient.invalidateQueries({ queryKey: ["habitLog", habit.id] });

      toast({
        title: "Bravo !",
        description: `+${habit.experience_points} points d'expérience gagnés !`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de marquer l'habitude comme complétée.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Card 
        className={`group relative transition-all duration-300 animate-fade-in backdrop-blur-sm bg-white/90 flex flex-col min-h-[220px]
          ${isCompleted ? 'bg-habit-success/20' hover:bg-habit-success/30' : 'hover:bg-white'}`}
        style={{
          boxShadow: isCompleted 
            ? "0 8px 32px 0 rgba(167, 243, 208, 0.2)"
            : "0 8px 32px 0 rgba(31, 38, 135, 0.07)",
        }}
      >
        <DeleteHabitButton habitId={habit.id} habitTitle={habit.title} />
        
        <CardHeader className="pb-2 flex-grow">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className={`flex items-center gap-2 text-xl mb-2 ${isCompleted ? 'text-muted-foreground' : ''}`}>
                {habit.title}
                {habit.is_popular && (
                  <Trophy className="w-4 h-4 text-yellow-500 animate-bounce-scale" />
                )}
              </CardTitle>
              <p className={`text-sm ${isCompleted ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                {habit.description}
              </p>
            </div>
            <CompleteHabitButton 
              isCompleted={isCompleted}
              onClick={handleClick}
            />
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <CategoryBadge category={habit.category} />
            <ExperiencePoints points={habit.experience_points} />
          </div>
        </CardContent>
      </Card>

      <CancelHabitDialog
        isOpen={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        onConfirm={handleCancelHabit}
        habitTitle={habit.title}
      />
    </>
  );
};