import { Header } from "@/components/Header";
import { HabitGrid } from "@/components/HabitGrid";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
      return data;
    },
  });

  return (
    <div className="space-y-8">
      <Header />
      <HabitGrid habits={habits} isLoading={isLoading} />
    </div>
  );
};

export default Habits;