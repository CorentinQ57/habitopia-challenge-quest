
import { Header } from "@/components/Header";
import { HabitGrid } from "@/components/HabitGrid";
import { CategoryManager } from "@/components/habits/CategoryManager";
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
  habit_type: 'good' | 'bad';
}

const Habits = () => {
  const { data: habits, isLoading } = useQuery({
    queryKey: ["habits"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from("habits")
        .select("*")
        .eq('user_id', user?.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as Habit[];
    },
  });

  return (
    <div className="space-y-8">
      <Header />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <HabitGrid habits={habits} isLoading={isLoading} />
        </div>
        <div>
          <CategoryManager />
        </div>
      </div>
    </div>
  );
};

export default Habits;
