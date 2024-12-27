import { Gem } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePurchaseReward } from "@/hooks/use-purchase-reward";

interface Reward {
  id: string;
  title: string;
  description: string;
  cost: number;
  level: number;
  is_freeze_token?: boolean;
}

interface RewardCardProps {
  reward: Reward;
  totalXP: number;
  getLevelIcon: (level: number) => JSX.Element;
  getLevelColor: (level: number) => string;
}

export const RewardCard = ({ reward, totalXP, getLevelIcon, getLevelColor }: RewardCardProps) => {
  const { purchaseReward } = usePurchaseReward();

  return (
    <div
      className={`relative overflow-hidden rounded-lg border bg-gradient-to-br ${getLevelColor(reward.level)} p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {getLevelIcon(reward.level)}
          <h3 className="text-lg font-semibold">{reward.title}</h3>
        </div>
        <div className="flex items-center gap-2 bg-background/40 px-3 py-1 rounded-full">
          <Gem className="w-4 h-4 text-primary" />
          <span className="font-semibold">{reward.cost} XP</span>
        </div>
      </div>
      
      {reward.description && (
        <p className="text-sm text-muted-foreground mb-4">{reward.description}</p>
      )}

      <Button
        onClick={() => purchaseReward(reward, totalXP)}
        disabled={totalXP < reward.cost}
        variant={totalXP >= reward.cost ? "default" : "outline"}
        className="w-full bg-background/50 hover:bg-background/70"
      >
        {totalXP >= reward.cost ? "Débloquer" : "Points insuffisants"}
      </Button>
    </div>
  );
};