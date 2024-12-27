import { Plus } from "lucide-react";
import { AddHabitDialog } from "./AddHabitDialog";

export const Header = () => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 animate-fade-in">
      <div>
        <h1 className="text-4xl font-bold mb-2">
          Bienvenue sur Habitify 👋
        </h1>
        <p className="text-muted-foreground">
          Développez de meilleures habitudes, jour après jour
        </p>
      </div>
      <AddHabitDialog />
    </div>
  );
};