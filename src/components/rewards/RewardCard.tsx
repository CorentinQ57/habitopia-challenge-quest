
import { useState } from "react";
import { usePurchaseReward } from "@/hooks/use-purchase-reward";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gem, BadgeIcon } from "lucide-react";

interface Reward {
  id: string;
  title: string;
  description: string | null;
  cost: number;
  is_freeze_token?: boolean;
}

interface RewardCardProps {
  reward: Reward;
  totalXP: number;
  getLevelIcon: (level: number) => JSX.Element;
  getLevelColor: (level: number) => string;
}

export const RewardCard = ({ reward, totalXP, getLevelIcon, getLevelColor }: RewardCardProps) => {
  const { purchaseReward, isPurchasing } = usePurchaseReward();
  const [isOwned, setIsOwned] = useState(false);

  // Determiner le niveau en fonction du coût
  const getLevel = (cost: number) => {
    if (cost <= 100) return 1;
    if (cost <= 300) return 2;
    if (cost <= 600) return 3;
    return 4;
  };

  const level = getLevel(reward.cost);
  const canPurchase = totalXP >= reward.cost;

  return (
    <Card className={`relative overflow-hidden bg-gradient-to-br ${getLevelColor(level)}`}>
      {isOwned && (
        <Badge className="absolute right-2 top-2 z-10 flex items-center gap-1.5 bg-primary text-primary-foreground">
          <BadgeIcon className="h-3 w-3" />
          Possédé
        </Badge>
      )}
      
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <h4 className="font-semibold tracking-tight">{reward.title}</h4>
          {reward.description && (
            <p className="text-sm text-muted-foreground">{reward.description}</p>
          )}
        </div>
        {getLevelIcon(level)}
      </CardHeader>
      
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Gem className="h-4 w-4 text-primary" />
            <span className="font-semibold">{reward.cost}</span>
          </div>
          <Button
            onClick={() => {
              purchaseReward(reward, totalXP);
              setIsOwned(true);
            }}
            disabled={!canPurchase || isPurchasing || isOwned}
            variant={isOwned ? "secondary" : canPurchase ? "default" : "outline"}
            size="sm"
            className={`transition-all duration-300 ${
              isOwned 
                ? "text-primary-foreground"
                : canPurchase 
                ? "text-primary-foreground" 
                : "text-foreground"
            }`}
          >
            {isOwned ? (
              <span className="flex items-center gap-2">
                <BadgeIcon className="w-4 h-4" />
                Possédé
              </span>
            ) : isPurchasing ? (
              "Achat en cours..."
            ) : canPurchase ? (
              "Acheter"
            ) : (
              "Points insuffisants"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
