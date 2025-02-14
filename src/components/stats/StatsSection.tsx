
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StatsCards } from "./StatsCards";
import { WeeklyProgress } from "./WeeklyProgress";
import { CategoryChart } from "./CategoryChart";
import { HourlyActivity } from "./HourlyActivity";

interface WeeklyStatsType {
  day: string;
  xp: number;
  count: number;
}

interface CategoryStatsType {
  name: string;
  value: number;
}

interface HabitLogWithHabit {
  habits: {
    category: string;
  } | null;
}

export const StatsSection = () => {
  const { data: weeklyStats } = useQuery<WeeklyStatsType[]>({
    queryKey: ["weeklyStats"],
    queryFn: async () => {
      const today = new Date();
      const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const { data, error } = await supabase
        .from("habit_logs")
        .select("completed_at, experience_gained")
        .gte("completed_at", lastWeek.toISOString())
        .order("completed_at");
      
      if (error) throw error;

      const dailyStats = data.reduce((acc: Record<string, WeeklyStatsType>, log) => {
        const date = new Date(log.completed_at).toLocaleDateString('fr-FR', { weekday: 'short' });
        if (!acc[date]) {
          acc[date] = {
            day: date,
            xp: 0,
            count: 0
          };
        }
        acc[date].xp += log.experience_gained;
        acc[date].count += 1;
        return acc;
      }, {});

      return Object.values(dailyStats);
    },
  });

  const { data: categoryStats } = useQuery<CategoryStatsType[]>({
    queryKey: ["categoryStats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("habit_logs")
        .select(`
          habits (
            category
          )
        `);
      
      if (error) throw error;

      const categories = (data as HabitLogWithHabit[]).reduce((acc: Record<string, number>, log) => {
        const category = log.habits?.category || 'Non catégorisé';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(categories).map(([name, value]) => ({
        name,
        value
      }));
    },
  });

  const { data: hourlyStats } = useQuery({
    queryKey: ["hourlyStats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("habit_logs")
        .select("completed_at");
      
      if (error) throw error;

      const hourly = Array(24).fill(0).map((_, i) => ({
        hour: i,
        count: 0
      }));

      data.forEach(log => {
        const hour = new Date(log.completed_at).getHours();
        hourly[hour].count++;
      });

      return hourly;
    },
  });

  const { data: streak } = useQuery({
    queryKey: ["userStreak"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("user_streaks")
        .select("*")
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-8 animate-fade-in">
      <h2 className="text-2xl font-bold">Statistiques</h2>
      
      <StatsCards streak={streak} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <WeeklyProgress data={weeklyStats || []} />
        <CategoryChart data={categoryStats || []} />
        <HourlyActivity data={hourlyStats || []} />
      </div>
    </div>
  );
};
