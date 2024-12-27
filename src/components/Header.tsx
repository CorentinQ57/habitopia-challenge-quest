import { Calendar } from "lucide-react";

export const Header = () => {
  const today = new Date();
  const dayName = today.toLocaleDateString('fr-FR', { weekday: 'long' });
  const capitalizedDay = dayName.charAt(0).toUpperCase() + dayName.slice(1);

  return (
    <div className="flex items-center justify-between mb-8 animate-fade-in">
      <div>
        <h1 className="text-4xl font-bold mb-2">
          Happy {capitalizedDay} 👋
        </h1>
        <p className="text-muted-foreground">
          {today.toLocaleDateString('fr-FR', { 
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>
      <button className="habit-button bg-habit-warning text-primary-foreground font-medium">
        <span className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          + New Habit
        </span>
      </button>
    </div>
  );
};