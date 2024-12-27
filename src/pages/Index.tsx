import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { HabitGrid } from "@/components/HabitGrid";
import { CharacterCard } from "@/components/CharacterCard";
import { RewardShop } from "@/components/RewardShop";
import { StatsSection } from "@/components/stats/StatsSection";
import { StreakCard } from "@/components/streaks/StreakCard";

const Index = () => {
  const { data: habits, isLoading } = useQuery({
    queryKey: ["habits"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("habits")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen p-8 bg-background">
      <div className="max-w-7xl mx-auto space-y-8">
        <Header />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <HabitGrid habits={habits} isLoading={isLoading} />
          </div>
          <div className="space-y-8">
            <CharacterCard />
            <StreakCard />
            <RewardShop />
          </div>
        </div>
        <StatsSection />
      </div>
    </div>
  );
};

export default Index;