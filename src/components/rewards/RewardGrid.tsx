import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AddRewardDialog } from "./AddRewardDialog";
import { RewardManagementCard } from "./RewardManagementCard";

export const RewardGrid = () => {
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);

  const { data: rewards, isLoading } = useQuery({
    queryKey: ["rewards"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rewards")
        .select("*")
        .order("cost", { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  const filteredRewards = selectedLevel
    ? rewards?.filter((reward) => reward.level === selectedLevel)
    : rewards;

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((level) => (
            <button
              key={level}
              onClick={() => setSelectedLevel(selectedLevel === level ? null : level)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedLevel === level
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary hover:bg-secondary/80"
              }`}
            >
              Niveau {level}
            </button>
          ))}
        </div>
        <AddRewardDialog />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRewards?.map((reward) => (
          <RewardManagementCard key={reward.id} reward={reward} />
        ))}
      </div>
    </div>
  );
};