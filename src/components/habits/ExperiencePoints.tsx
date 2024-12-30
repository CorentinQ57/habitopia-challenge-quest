import { Star, Skull } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExperiencePointsProps {
  points: number;
  type?: 'good' | 'bad';
}

export const ExperiencePoints = ({ points, type = 'good' }: ExperiencePointsProps) => {
  const Icon = type === 'good' ? Star : Skull;
  
  return (
    <div 
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-full",
        type === 'good' 
          ? "text-stella-royal bg-stella-royal/10"
          : "text-red-600 bg-red-100"
      )}
    >
      <Icon className="w-4 h-4" />
      <span className="font-medium text-sm">
        {points} XP
      </span>
    </div>
  );
};