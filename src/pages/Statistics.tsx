import { StatsSection } from "@/components/stats/StatsSection";
import { StreakCard } from "@/components/streaks/StreakCard";

const Statistics = () => {
  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold">Statistiques</h1>
      <div className="grid grid-cols-1 gap-8">
        <StreakCard />
        <StatsSection />
      </div>
    </div>
  );
};

export default Statistics;