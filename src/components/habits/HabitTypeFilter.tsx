import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HabitTypeFilterProps {
  selectedType: 'all' | 'good' | 'bad';
  onTypeChange: (type: 'all' | 'good' | 'bad') => void;
}

export const HabitTypeFilter = ({ selectedType, onTypeChange }: HabitTypeFilterProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        onClick={() => onTypeChange('all')}
        className={cn(
          "backdrop-blur-sm border-gray-200/50 bg-gray-100 hover:bg-gray-200 text-gray-700",
          selectedType === 'all' ? "ring-2 ring-offset-2 ring-stella-royal/20" : ""
        )}
      >
        Toutes
      </Button>
      <Button
        variant="outline"
        onClick={() => onTypeChange('good')}
        className={cn(
          "backdrop-blur-sm border-gray-200/50 bg-emerald-100 hover:bg-emerald-200 text-emerald-700",
          selectedType === 'good' ? "ring-2 ring-offset-2 ring-emerald-500/20" : ""
        )}
      >
        Bonnes habitudes
      </Button>
      <Button
        variant="outline"
        onClick={() => onTypeChange('bad')}
        className={cn(
          "backdrop-blur-sm border-gray-200/50 bg-red-100 hover:bg-red-200 text-red-700",
          selectedType === 'bad' ? "ring-2 ring-offset-2 ring-red-500/20" : ""
        )}
      >
        Mauvaises habitudes
      </Button>
    </div>
  );
};