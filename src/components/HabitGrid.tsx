
import { useState } from "react";
import { HabitCard } from "./habits/HabitCard";
import { AddHabitDialog } from "./AddHabitDialog";
import { LoadingHabitGrid } from "./habits/LoadingHabitGrid";
import { CategoryFilter } from "./habits/CategoryFilter";
import { HabitTypeFilter } from "./habits/HabitTypeFilter";
import { GenerateHabitsDialog } from "./habits/GenerateHabitsDialog";
import { Habit } from "@/types/habit";
import { Button } from "./ui/button";
import { Sparkles } from "lucide-react";

interface HabitGridProps {
  habits: Habit[] | undefined;
  isLoading: boolean;
}

export const HabitGrid = ({ habits, isLoading }: HabitGridProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<'all' | 'good' | 'bad'>('all');
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);

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
        <div className="flex-1 flex flex-col sm:flex-row gap-4">
          <CategoryFilter
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
          <HabitTypeFilter
            selectedType={selectedType}
            onTypeChange={setSelectedType}
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowGenerateDialog(true)}
          className="shrink-0"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Générer avec l'IA
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredHabits?.map((habit) => (
          <HabitCard key={habit.id} habit={habit} />
        ))}
        <AddHabitDialog variant="card" />
      </div>

      <GenerateHabitsDialog
        isOpen={showGenerateDialog}
        onClose={() => setShowGenerateDialog(false)}
        currentHabits={habits || []}
      />
    </div>
  );
};
