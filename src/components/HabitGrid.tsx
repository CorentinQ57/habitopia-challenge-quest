import { Check, Trophy, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

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

interface HabitGridProps {
  habits: Habit[] | undefined;
  isLoading: boolean;
}

export const HabitGrid = ({ habits, isLoading }: HabitGridProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleComplete = async (habit: Habit) => {
    try {
      const { error } = await supabase
        .from("habit_logs")
        .insert([{ 
          habit_id: habit.id,
          experience_gained: habit.experience_points
        }]);

      if (error) throw error;

      toast({
        title: "Bravo !",
        description: `+${habit.experience_points} points d'expérience gagnés !`,
      });

      queryClient.invalidateQueries({ queryKey: ["habits"] });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de marquer l'habitude comme complétée.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="neo-card animate-pulse">
            <div className="space-y-3">
              <Skeleton className="h-4 w-1/2 bg-muted/20" />
              <Skeleton className="h-4 w-3/4 bg-muted/20" />
              <Skeleton className="h-20 w-full bg-muted/20" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const translateCategory = (category: string) => {
    const translations: { [key: string]: string } = {
      "Health": "Santé",
      "Wellness": "Bien-être",
      "Learning": "Apprentissage",
      "Productivity": "Productivité"
    };
    return translations[category] || category;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {habits?.map((habit) => (
        <div 
          key={habit.id}
          className="neo-card group flex flex-col min-h-[200px] backdrop-blur-sm"
        >
          <div className="flex-grow">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <h3 className="flex items-center gap-2 text-xl font-semibold mb-2">
                  {habit.title}
                  {habit.is_popular && (
                    <Trophy className="w-4 h-4 text-yellow-500 animate-bounce-scale" />
                  )}
                </h3>
                <p className="text-sm text-muted-foreground">{habit.description}</p>
              </div>
              <button 
                onClick={() => handleComplete(habit)}
                className="neo-button p-2 aspect-square rounded-xl text-primary hover:text-white"
              >
                <Check className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="mt-auto pt-4 flex items-center justify-between">
            <span className="category-tag">
              {translateCategory(habit.category)}
            </span>
            <div className="xp-badge text-amber-500">
              <Star className="w-4 h-4" />
              <span>{habit.experience_points} XP</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};