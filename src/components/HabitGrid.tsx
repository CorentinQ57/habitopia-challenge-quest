import { useState } from "react";
import { HabitCard } from "./habits/HabitCard";
import { AddHabitDialog } from "./AddHabitDialog";
import { LoadingHabitGrid } from "./habits/LoadingHabitGrid";
import { CategoryFilter } from "./habits/CategoryFilter";
import { HabitTypeFilter } from "./habits/HabitTypeFilter";

interface Habit {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  is_popular: boolean;
  experience_points: number;
  created_at: string;
  habit_type: 'good' | 'bad';
}

interface HabitGridProps {
  habits: Habit[] | undefined;
  isLoading: boolean;
}

export const HabitGrid = ({ habits, isLoading }: HabitGridProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<'all' | 'good' | 'bad'>('all');

  if (isLoading) {
    return <LoadingHabitGrid />;
  }

  const filteredHabits = habits?.filter((habit) => {
    const matchesCategory = selectedCategory ? habit.category === selectedCategory : true;
    const matchesType = selectedType === 'all' ? true : habit.habit_type === selectedType;
    return matchesCategory && matchesType;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <CategoryFilter
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
        <HabitTypeFilter
          selectedType={selectedType}
          onTypeChange={setSelectedType}
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