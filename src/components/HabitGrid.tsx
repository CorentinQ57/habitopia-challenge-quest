import { Check, Trophy } from "lucide-react";
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
  frequency: string;
  is_popular: boolean;
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
        title: "Success!",
        description: "Habit marked as completed.",
      });

      queryClient.invalidateQueries({ queryKey: ["habits"] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark habit as completed.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <Trophy className="w-4 h-4 text-habit-warning" />
                )}
              </CardTitle>
              <button 
                onClick={() => handleComplete(habit.id)}
                className="habit-button bg-habit-success/20 text-habit-success hover:bg-habit-success/30"
              >
                <Check className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground">{habit.description}</p>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-sm">
              <span className="px-2 py-1 rounded-full bg-habit-info/20 text-habit-info">
                {habit.category}
              </span>
              <span className="text-muted-foreground">
                {habit.frequency}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};