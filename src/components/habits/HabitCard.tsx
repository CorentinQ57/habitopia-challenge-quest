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

  // Vérifier si l'habitude a déjà été complétée aujourd'hui
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
      const { data: habitsCompleted } = await supabase
        .from("habit_logs")
        .select("id")
        .eq("user_id", user.id)
        .gte("completed_at", `${today}T00:00:00`)
        .lte("completed_at", `${today}T23:59:59`);

      const tasksCompletedToday = (habitsCompleted?.length || 1) - 1;

      await updateUserStreak(tasksCompletedToday);

      // Supprimer l'entrée du journal d'habitudes
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
      const { data: habitsCompleted } = await supabase
        .from("habit_logs")
        .select("id")
        .eq("user_id", user.id)
        .gte("completed_at", `${today}T00:00:00`)
        .lte("completed_at", `${today}T23:59:59`);

      const tasksCompletedToday = (habitsCompleted?.length || 0) + 1;

      await updateUserStreak(tasksCompletedToday);

      const { error: habitError } = await supabase
        .from("habit_logs")
        .insert([{ 
          habit_id: habit.id,
          user_id: user.id,
          experience_gained: habit.experience_points,
          notes: `Habitude complétée: ${habit.title}`
        }]);

      if (habitError) throw habitError;

      setIsCompleted(true);
      
      // Invalider toutes les requêtes pertinentes pour forcer le rafraîchissement
      queryClient.invalidateQueries({ queryKey: ["habitLogs"] });
      queryClient.invalidateQueries({ queryKey: ["todayXP"] });
      queryClient.invalidateQueries({ queryKey: ["totalXP"] });
      queryClient.invalidateQueries({ queryKey: ["userStreak"] });
      queryClient.invalidateQueries({ queryKey: ["weeklyStats"] });
      queryClient.invalidateQueries({ queryKey: ["habits"] });

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
        className={`group relative transition-all duration-300 animate-fade-in backdrop-blur-sm bg-white/90 flex flex-col h-[280px] noise
          ${isCompleted ? 'bg-habit-success/20 hover:bg-habit-success/30 order-last' : 'hover:bg-stella-royal/5'}`}
        style={{
          boxShadow: isCompleted 
            ? "0 8px 32px 0 rgba(167, 243, 208, 0.2)"
            : "0 8px 32px 0 rgba(65, 105, 225, 0.1)",
        }}
      >
        <HabitCardHeader 
          title={habit.title}
          description={habit.description}
          isPopular={habit.is_popular}
          isCompleted={isCompleted}
        />
        
        <CardContent className="flex-1 flex flex-col justify-between gap-4 pt-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <CategoryBadge category={habit.category} />
            <ExperiencePoints points={habit.experience_points} />
          </div>
          
          <HabitCardActions 
            habitId={habit.id}
            habitTitle={habit.title}
            isCompleted={isCompleted}
            onComplete={handleClick}
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