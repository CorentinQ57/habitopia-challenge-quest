import { Star, Award, Gem, Trophy } from "lucide-react";

export const getLevelIcon = (level: number) => {
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

export const getLevelColor = (level: number): string => {
  const colors = {
    1: "from-yellow-500/20 to-yellow-500/10 border-yellow-500/20",
    2: "from-blue-500/20 to-blue-500/10 border-blue-500/20",
    3: "from-purple-500/20 to-purple-500/10 border-purple-500/20",
    4: "from-amber-500/20 to-amber-500/10 border-amber-500/20",
  };
  return colors[level as keyof typeof colors] || "from-gray-500/20 to-gray-500/10 border-gray-500/20";
};