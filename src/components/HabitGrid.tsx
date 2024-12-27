import { useState } from "react";
import { HabitCard } from "./habits/HabitCard";
import { AddHabitDialog } from "./AddHabitDialog";
import { LoadingHabitGrid } from "./habits/LoadingHabitGrid";
import { CategoryFilter } from "./habits/CategoryFilter";

interface Habit {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  is_popular: boolean;
  experience_points: number;
  created_at: string;
}

interface HabitGridProps {
  habits: Habit[] | undefined;
  isLoading: boolean;
}

export const HabitGrid = ({ habits, isLoading }: HabitGridProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  if (isLoading) {
    return <LoadingHabitGrid />;
  }

  const filteredHabits = selectedCategory
    ? habits?.filter((habit) => habit.category === selectedCategory)
    : habits;

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <CategoryFilter
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredHabits?.map((habit) => (
          <HabitCard key={habit.id} habit={habit} />
        ))}
        <AddHabitDialog variant="card" />
      </div>
    </div>
  );
};