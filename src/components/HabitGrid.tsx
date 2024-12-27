import { Plus } from "lucide-react";
import { HabitCard } from "./habits/HabitCard";
import { LoadingHabitGrid } from "./habits/LoadingHabitGrid";
import { AddHabitDialog } from "./AddHabitDialog";

interface Habit {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  is_popular: boolean;
  created_at: string;
  experience_points: number;
}

interface HabitGridProps {
  habits: Habit[] | undefined;
  isLoading: boolean;
}

export const HabitGrid = ({ habits, isLoading }: HabitGridProps) => {
  if (isLoading) {
    return <LoadingHabitGrid />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {habits?.map((habit) => (
        <HabitCard key={habit.id} habit={habit} />
      ))}
      <AddHabitDialog
        trigger={
          <button className="h-full min-h-[200px] rounded-xl border-2 border-dashed border-gray-200 hover:border-primary hover:bg-primary/5 transition-all duration-300 flex flex-col items-center justify-center gap-4 group">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Plus className="w-8 h-8 text-primary" />
            </div>
            <p className="text-lg font-medium text-gray-500 group-hover:text-primary transition-colors">
              Nouvelle Habitude
            </p>
          </button>
        }
      />
    </div>
  );
};