import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { updateUserStreak } from "@/utils/streakManagement";
import { CancelHabitDialog } from "./CancelHabitDialog";
import { CategoryBadge } from "./CategoryBadge";
import { ExperiencePoints } from "./ExperiencePoints";
import { HabitCardHeader } from "./HabitCardHeader";
import { HabitCardActions } from "./HabitCardActions";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Habit {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  is_popular: boolean;
  created_at: string;
  experience_points: number;
  habit_type: 'good' | 'bad';
}

interface HabitCardProps {
  habit: Habit;
}

export const HabitCard = ({ habit }: HabitCardProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCompleted, setIsCompleted] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  useEffect(() => {
    const checkIfCompleted = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];
      const { data: habitLog } = await supabase
        .from("habit_logs")
        .select("*")
        .eq("habit_id", habit.id)
        .eq("user_id", user.id)
        .gte("completed_at", `${today}T00:00:00`)
        .lte("completed_at", `${today}T23:59:59`)
        .maybeSingle();

      setIsCompleted(!!habitLog);
    };

    checkIfCompleted();
  }, [habit.id]);

  const handleClick = () => {
    if (isCompleted) {
      setShowCancelDialog(true);
    } else {
      handleComplete();
    }
  };

  const handleCancelHabit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];

      const { data: userStreak } = await supabase
        .from("user_streaks")
        .select("freeze_used_date, tasks_completed_today")
        .eq("user_id", user.id)
        .single();

      const isStreakFrozen = userStreak?.freeze_used_date === today;

      if (isStreakFrozen && userStreak.tasks_completed_today <= 3) {
        toast({
          title: "Action impossible",
          description: "Vous ne pouvez pas annuler cette habitude car un glaçon a été utilisé aujourd'hui.",
          variant: "destructive",
        });
        return;
      }

      const { data: habitsCompleted } = await supabase
        .from("habit_logs")
        .select("id")
        .eq("user_id", user.id)
        .gte("completed_at", `${today}T00:00:00`)
        .lte("completed_at", `${today}T23:59:59`);

      const tasksCompletedToday = (habitsCompleted?.length || 1) - 1;

      if (!isStreakFrozen) {
        await updateUserStreak(tasksCompletedToday);
      }

      const { error: deleteError } = await supabase
        .from("habit_logs")
        .delete()
        .eq("habit_id", habit.id)
        .eq("user_id", user.id)
        .gte("completed_at", `${today}T00:00:00`)
        .lte("completed_at", `${today}T23:59:59`);

      if (deleteError) throw deleteError;

      setIsCompleted(false);
      setShowCancelDialog(false);

      queryClient.invalidateQueries({ queryKey: ["habitLogs"] });
      queryClient.invalidateQueries({ queryKey: ["todayXP"] });
      queryClient.invalidateQueries({ queryKey: ["totalXP"] });
      queryClient.invalidateQueries({ queryKey: ["userStreak"] });
      queryClient.invalidateQueries({ queryKey: ["weeklyStats"] });
      queryClient.invalidateQueries({ queryKey: ["habits"] });

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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];
      
      const { data: userStreak } = await supabase
        .from("user_streaks")
        .select("freeze_used_date")
        .eq("user_id", user.id)
        .single();

      const isStreakFrozen = userStreak?.freeze_used_date === today;

      if (!isStreakFrozen) {
        const { data: habitsCompleted } = await supabase
          .from("habit_logs")
          .select("id")
          .eq("user_id", user.id)
          .gte("completed_at", `${today}T00:00:00`)
          .lte("completed_at", `${today}T23:59:59`);

        const tasksCompletedToday = (habitsCompleted?.length || 0) + 1;
        await updateUserStreak(tasksCompletedToday);
      }

      const { error: habitError } = await supabase
        .from("habit_logs")
        .insert([{ 
          habit_id: habit.id,
          user_id: user.id,
          experience_gained: habit.experience_points,
          notes: `Habitude ${habit.habit_type === 'good' ? 'complétée' : 'évitée'}: ${habit.title}`
        }]);

      if (habitError) throw habitError;

      setIsCompleted(true);
      
      queryClient.invalidateQueries({ queryKey: ["habitLogs"] });
      queryClient.invalidateQueries({ queryKey: ["todayXP"] });
      queryClient.invalidateQueries({ queryKey: ["totalXP"] });
      queryClient.invalidateQueries({ queryKey: ["userStreak"] });
      queryClient.invalidateQueries({ queryKey: ["weeklyStats"] });
      queryClient.invalidateQueries({ queryKey: ["habits"] });

      const xpMessage = habit.habit_type === 'good' 
        ? `+${habit.experience_points} points d'expérience gagnés !`
        : `${habit.experience_points} points d'expérience perdus.`;

      toast({
        title: habit.habit_type === 'good' ? "Bravo !" : "Bien joué !",
        description: xpMessage,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de marquer l'habitude comme complétée.",
        variant: "destructive",
      });
    }
  };

  const cardClassName = cn(
    "group relative transition-all duration-300 animate-fade-in backdrop-blur-sm flex flex-col h-[280px] noise",
    {
      'bg-white/90 hover:bg-stella-royal/5': !isCompleted && habit.habit_type === 'good',
      'bg-habit-success/20 hover:bg-habit-success/30 order-last': isCompleted && habit.habit_type === 'good',
      'bg-red-50/90 hover:bg-red-100/90': !isCompleted && habit.habit_type === 'bad',
      'bg-red-200/20 hover:bg-red-200/30 order-last': isCompleted && habit.habit_type === 'bad',
    }
  );

  const cardStyle = {
    boxShadow: isCompleted
      ? habit.habit_type === 'good'
        ? "0 8px 32px 0 rgba(167, 243, 208, 0.2)"
        : "0 8px 32px 0 rgba(254, 202, 202, 0.2)"
      : "0 8px 32px 0 rgba(65, 105, 225, 0.1)",
  };

  return (
    <>
      <Card className={cardClassName} style={cardStyle}>
        <HabitCardHeader 
          title={habit.title}
          description={habit.description}
          isPopular={habit.is_popular}
          isCompleted={isCompleted}
          habitType={habit.habit_type}
        />
        
        <CardContent className="flex-1 flex flex-col justify-between gap-4 pt-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <CategoryBadge category={habit.category} />
            <ExperiencePoints points={habit.experience_points} type={habit.habit_type} />
          </div>
          
          <HabitCardActions 
            habitId={habit.id}
            habitTitle={habit.title}
            isCompleted={isCompleted}
            onComplete={handleClick}
            habitType={habit.habit_type}
          />
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