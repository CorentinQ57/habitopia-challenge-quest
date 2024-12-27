import { Check, Trophy, Calendar } from "lucide-react";
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
  frequency: string;
  is_popular: boolean;
  created_at: string;
}

interface HabitGridProps {
  habits: Habit[] | undefined;
  isLoading: boolean;
}

export const HabitGrid = ({ habits, isLoading }: HabitGridProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleComplete = async (habitId: string) => {
    try {
      const { error } = await supabase
        .from("habit_logs")
        .insert([{ habit_id: habitId }]);

      if (error) throw error;

      toast({
        title: "Bravo !",
        description: "Habitude marquée comme complétée.",
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {habits?.map((habit) => (
        <Card 
          key={habit.id}
          className="group hover:shadow-lg transition-all duration-200 animate-fade-in"
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-xl">
                {habit.title}
                {habit.is_popular && (
                  <Trophy className="w-4 h-4 text-yellow-500" />
                )}
              </CardTitle>
              <button 
                onClick={() => handleComplete(habit.id)}
                className="habit-button bg-habit-success/20 text-green-600 hover:bg-habit-success/30 group-hover:scale-110 transition-all"
              >
                <Check className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground">{habit.description}</p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="px-2 py-1 rounded-full bg-habit-info/20 text-blue-600">
                  {habit.category}
                </span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(habit.created_at), "d MMMM yyyy", { locale: fr })}
                </span>
              </div>
              <div className="text-sm text-muted-foreground flex items-center justify-between">
                <span>Fréquence:</span>
                <span className="font-medium text-foreground">
                  {habit.frequency === 'daily' ? 'Quotidienne' :
                   habit.frequency === 'weekly' ? 'Hebdomadaire' : 
                   'Mensuelle'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};