import { Trophy } from "lucide-react";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface HabitCardHeaderProps {
  title: string;
  description: string;
  isPopular: boolean;
  isCompleted: boolean;
  habitType: 'good' | 'bad';
}

export const HabitCardHeader = ({ 
  title, 
  description, 
  isPopular, 
  isCompleted,
  habitType
}: HabitCardHeaderProps) => {
  return (
    <CardHeader className="pb-2 flex-none">
      <div className="space-y-1.5">
        <CardTitle className={cn(
          "flex items-center gap-2 text-xl",
          {
            'text-muted-foreground': isCompleted,
            'text-red-600': !isCompleted && habitType === 'bad'
          }
        )}>
          {title}
          {isPopular && (
            <Trophy className="w-4 h-4 text-yellow-500 animate-bounce-scale" />
          )}
        </CardTitle>
        <p className={cn(
          "text-sm line-clamp-2",
          isCompleted ? 'text-muted-foreground' : 'text-muted-foreground'
        )}>
          {description}
        </p>
      </div>
    </CardHeader>
  );
};