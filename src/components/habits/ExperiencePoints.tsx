import { Star } from "lucide-react";

interface ExperiencePointsProps {
  points: number;
}

export const ExperiencePoints = ({ points }: ExperiencePointsProps) => {
  return (
    <div className="flex items-center gap-1.5 text-stella-royal bg-stella-royal/10 px-3 py-1.5 rounded-full">
      <Star className="w-4 h-4" />
      <span className="font-medium text-sm">
        {points} XP
      </span>
    </div>
  );
};