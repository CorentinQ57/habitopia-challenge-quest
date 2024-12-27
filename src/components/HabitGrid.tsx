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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {habits?.map((habit) => (
        <Card 
          key={habit.id}
          className="group hover:shadow-lg transition-all duration-300 animate-fade-in backdrop-blur-sm bg-white/90"
          style={{
            boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.07)",
          }}
        >
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="flex items-center gap-2 text-xl mb-1">
                  {habit.title}
                  {habit.is_popular && (
                    <Trophy className="w-4 h-4 text-yellow-500 animate-bounce-scale" />
                  )}
                </CardTitle>
                <p className="text-sm text-muted-foreground line-clamp-2">{habit.description}</p>
              </div>
              <button 
                onClick={() => handleComplete(habit)}
                className="shrink-0 p-2 rounded-full bg-habit-success hover:bg-green-100 text-green-600 transition-all duration-300 hover:scale-110"
                style={{
                  boxShadow: "0 0 15px rgba(167, 243, 208, 0.5)",
                }}
              >
                <Check className="w-5 h-5" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
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
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};