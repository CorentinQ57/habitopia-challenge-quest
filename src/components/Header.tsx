import { Calendar, Plus } from "lucide-react";
import { AddHabitDialog } from "./AddHabitDialog";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export const Header = () => {
  const today = new Date();
  const dayName = format(today, "EEEE", { locale: fr });
  const capitalizedDay = dayName.charAt(0).toUpperCase() + dayName.slice(1);

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 animate-fade-in">
      <div>
        <h1 className="text-4xl font-bold mb-2">
          Bonne journée de {capitalizedDay} 👋
        </h1>
        <p className="text-muted-foreground flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          {format(today, "d MMMM yyyy", { locale: fr })}
        </p>
      </div>
      <AddHabitDialog />
    </div>
  );
};