import { Trophy } from "lucide-react";
import { CardHeader, CardTitle } from "@/components/ui/card";

interface HabitCardHeaderProps {
  title: string;
  description: string;
  isPopular: boolean;
  isCompleted: boolean;
}

export const HabitCardHeader = ({ title, description, isPopular, isCompleted }: HabitCardHeaderProps) => {
  return (
    <CardHeader className="pb-2 flex-none">
      <div className="space-y-1.5">
        <CardTitle className={`flex items-center gap-2 text-xl ${isCompleted ? 'text-muted-foreground' : ''}`}>
          {title}
          {isPopular && (
            <Trophy className="w-4 h-4 text-yellow-500 animate-bounce-scale" />
          )}
        </CardTitle>
        <p className={`text-sm line-clamp-2 ${isCompleted ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
          {description}
        </p>
      </div>
    </CardHeader>
  );
};