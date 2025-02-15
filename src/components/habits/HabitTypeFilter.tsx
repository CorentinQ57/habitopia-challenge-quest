
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface HabitTypeFilterProps {
  selectedType: 'all' | 'good' | 'bad';
  onTypeChange: (type: 'all' | 'good' | 'bad') => void;
}

export const HabitTypeFilter = ({ selectedType, onTypeChange }: HabitTypeFilterProps) => {
  return (
    <Select value={selectedType} onValueChange={onTypeChange}>
      <SelectTrigger className="w-[180px] bg-white/50 backdrop-blur-sm">
        <SelectValue placeholder="Type d'habitudes" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Toutes</SelectItem>
        <SelectItem value="good" className="text-emerald-700">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            Bonnes habitudes
          </div>
        </SelectItem>
        <SelectItem value="bad" className="text-red-700">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            Mauvaises habitudes
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
};
