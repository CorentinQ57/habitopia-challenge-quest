import { Check, Trophy, Calendar, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

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
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
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
        <Card 
          key={habit.id}
          className="group hover:shadow-lg transition-all duration-300 animate-fade-in backdrop-blur-sm bg-white/80 border border-white/20"
          style={{
            background: "rgba(255, 255, 255, 0.8)",
            boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.07)"
          }}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-xl">
                {habit.title}
                {habit.is_popular && (
                  <Trophy className="w-4 h-4 text-yellow-500 animate-bounce-scale" />
                )}
              </CardTitle>
              <button 
                onClick={() => handleComplete(habit)}
                className="habit-button bg-habit-success/20 text-green-600 hover:bg-habit-success/30 group-hover:scale-110 transition-all duration-300"
                style={{
                  animation: "glow 2s ease-in-out infinite"
                }}
              >
                <Check className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground">{habit.description}</p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="px-2 py-1 rounded-full bg-habit-info/20 text-blue-600 backdrop-blur-sm">
                  {translateCategory(habit.category)}
                </span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(habit.created_at), "d MMMM yyyy", { locale: fr })}
                </span>
              </div>
              <div className="text-sm text-muted-foreground flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 animate-bounce-scale" />
                  Points d'expérience:
                </span>
                <span className="font-medium text-foreground">
                  {habit.experience_points}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
