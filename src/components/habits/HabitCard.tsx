import { Check, Trophy, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

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

  const handleComplete = async () => {
    try {
      // 1. Vérifier d'abord le nombre d'habitudes complétées aujourd'hui
      const today = new Date().toISOString().split('T')[0];
      const { data: habitsCompleted } = await supabase
        .from("habit_logs")
        .select("id")
        .gte("completed_at", `${today}T00:00:00`)
        .lte("completed_at", `${today}T23:59:59`);

      if (habitsCompleted && habitsCompleted.length >= 3) {
        toast({
          title: "Limite atteinte",
          description: "Vous avez déjà complété 3 habitudes aujourd'hui !",
          variant: "destructive",
        });
        return;
      }

      // 2. Récupérer l'enregistrement user_streaks actuel
      const { data: existingStreak } = await supabase
        .from("user_streaks")
        .select("*")
        .maybeSingle();

      const tasksCompletedToday = (habitsCompleted?.length || 0) + 1;

      if (!existingStreak) {
        // Créer un nouvel enregistrement si aucun n'existe
        await supabase
          .from("user_streaks")
          .insert([{
            tasks_completed_today: tasksCompletedToday,
            last_activity_date: today,
            current_streak: 0,
            longest_streak: 0
          }]);
      } else {
        // Mettre à jour l'enregistrement existant
        const shouldIncrementStreak = tasksCompletedToday === 3 && 
          existingStreak.last_activity_date !== today;

        const newCurrentStreak = shouldIncrementStreak 
          ? existingStreak.current_streak + 1 
          : existingStreak.current_streak;

        const newLongestStreak = Math.max(newCurrentStreak, existingStreak.longest_streak);

        const { error: streakError } = await supabase
          .from("user_streaks")
          .update({
            tasks_completed_today: tasksCompletedToday,
            last_activity_date: today,
            current_streak: newCurrentStreak,
            longest_streak: newLongestStreak
          })
          .eq('id', existingStreak.id);

        if (streakError) throw streakError;
      }

      // 3. Enregistrer l'habitude comme complétée
      const { error: habitError } = await supabase
        .from("habit_logs")
        .insert([{ 
          habit_id: habit.id,
          experience_gained: habit.experience_points,
          notes: `Habitude complétée: ${habit.title}`
        }]);

      if (habitError) throw habitError;

      setIsCompleted(true);
      
      // Invalider les queries pour rafraîchir l'XP et les streaks
      queryClient.invalidateQueries({ queryKey: ["todayXP"] });
      queryClient.invalidateQueries({ queryKey: ["totalXP"] });
      queryClient.invalidateQueries({ queryKey: ["userStreak"] });

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

  const translateCategory = (category: string) => {
    const translations: { [key: string]: string } = {
      "Health": "Santé",
      "Wellness": "Bien-être",
      "Learning": "Apprentissage",
      "Productivity": "Productivité"
    };
    return translations[category] || category;
  };

  const getCategoryColor = (category: string): string => {
    const colors: { [key: string]: string } = {
      "Health": "text-emerald-600 bg-emerald-50",
      "Wellness": "text-blue-600 bg-blue-50",
      "Learning": "text-purple-600 bg-purple-50",
      "Productivity": "text-orange-600 bg-orange-50"
    };
    return colors[category] || "text-gray-600 bg-gray-50";
  };

  return (
    <Card 
      className={`group transition-all duration-300 animate-fade-in backdrop-blur-sm bg-white/90 flex flex-col min-h-[200px]
        ${isCompleted ? 'bg-habit-success/20' : ''}`}
      style={{
        boxShadow: isCompleted 
          ? "0 8px 32px 0 rgba(167, 243, 208, 0.2)"
          : "0 8px 32px 0 rgba(31, 38, 135, 0.07)",
      }}
    >
      <CardHeader className="pb-2 flex-grow">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className={`flex items-center gap-2 text-xl mb-1 ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
              {habit.title}
              {habit.is_popular && (
                <Trophy className="w-4 h-4 text-yellow-500 animate-bounce-scale" />
              )}
            </CardTitle>
            <p className={`text-sm ${isCompleted ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
              {habit.description}
            </p>
          </div>
          <button 
            onClick={handleComplete}
            disabled={isCompleted}
            className={`shrink-0 p-2 rounded-full transition-all duration-300
              ${isCompleted 
                ? 'bg-habit-success cursor-default' 
                : 'bg-white hover:bg-habit-success hover:text-white'}`}
            style={{
              boxShadow: isCompleted ? '0 0 15px rgba(167, 243, 208, 0.5)' : 'none',
            }}
          >
            <Check className={`w-5 h-5 ${isCompleted ? 'text-white' : 'text-habit-success'}`} />
          </button>
        </div>
      </CardHeader>
      <CardContent className="mt-auto pt-4">
        <div className="flex items-center justify-between text-sm">
          <span className={`px-3 py-1 rounded-full ${getCategoryColor(habit.category)}`}>
            {translateCategory(habit.category)}
          </span>
          <div className="flex items-center gap-1.5 text-amber-500">
            <Star className="w-4 h-4" />
            <span className="font-medium">
              {habit.experience_points} XP
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};