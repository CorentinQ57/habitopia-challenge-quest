import { useState } from "react";
import { Star, Award, Gem, Trophy } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Reward {
  id: string;
  purchased_at: string;
  reward: {
    id: string;
    title: string;
    description: string | null;
    cost: number;
    level: number;
  };
}

const getLevelIcon = (level: number) => {
  switch (level) {
    case 1:
      return <Star className="w-5 h-5 text-yellow-500" />;
    case 2:
      return <Award className="w-5 h-5 text-blue-500" />;
    case 3:
      return <Gem className="w-5 h-5 text-purple-500" />;
    case 4:
      return <Trophy className="w-5 h-5 text-amber-500" />;
    default:
      return <Star className="w-5 h-5 text-gray-500" />;
  }
};

const getLevelColor = (level: number): string => {
  const colors = {
    1: "bg-yellow-500/10 text-yellow-500 ring-yellow-500/20",
    2: "bg-blue-500/10 text-blue-500 ring-blue-500/20",
    3: "bg-purple-500/10 text-purple-500 ring-purple-500/20",
    4: "bg-amber-500/10 text-amber-500 ring-amber-500/20",
  };
  return colors[level as keyof typeof colors] || "bg-gray-500/10 text-gray-500 ring-gray-500/20";
};

export const RewardGrid = ({ rewards }: { rewards: Reward[] }) => {
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);

  const filteredRewards = selectedLevel
    ? rewards.filter((reward) => reward.reward.level === selectedLevel)
    : rewards;

  return (
    <div className="space-y-6">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRewards.map(({ id, reward, purchased_at }) => (
          <Card key={id} className="overflow-hidden">
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{reward.title}</CardTitle>
                <Badge variant="outline" className={getLevelColor(reward.level)}>
                  <span className="flex items-center gap-1">
                    {getLevelIcon(reward.level)}
                    Niveau {reward.level}
                  </span>
                </Badge>
              </div>
              <CardDescription>
                {reward.description || "Aucune description"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Coût: {reward.cost} XP</span>
                <span>
                  Obtenue le{" "}
                  {format(new Date(purchased_at), "d MMMM yyyy", { locale: fr })}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};