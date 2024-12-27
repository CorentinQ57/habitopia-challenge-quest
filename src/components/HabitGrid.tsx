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
      <AddHabitDialog />
    </div>
  );
};