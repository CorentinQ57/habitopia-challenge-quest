import { Plus } from "lucide-react";
import { HabitCard } from "./habits/HabitCard";
import { LoadingHabitGrid } from "./habits/LoadingHabitGrid";
import { AddHabitDialog } from "./AddHabitDialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
  const { data: habitLogs } = useQuery({
    queryKey: ["habitLogs"],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data } = await supabase
        .from("habit_logs")
        .select("habit_id")
        .gte("completed_at", `${today}T00:00:00`)
        .lte("completed_at", `${today}T23:59:59`);
      
      return data || [];
    },
  });

  const sortedHabits = habits?.slice().sort((a, b) => {
    const aCompleted = habitLogs?.some(log => log.habit_id === a.id) || false;
    const bCompleted = habitLogs?.some(log => log.habit_id === b.id) || false;
    
    if (aCompleted && !bCompleted) return 1;
    if (!aCompleted && bCompleted) return -1;
    return 0;
  });

  if (isLoading) {
    return <LoadingHabitGrid />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sortedHabits?.map((habit) => (
        <div
          key={habit.id}
          className="transition-all duration-700 ease-in-out transform"
        >
          <HabitCard habit={habit} />
        </div>
      ))}
      <AddHabitDialog />
    </div>
  );
};