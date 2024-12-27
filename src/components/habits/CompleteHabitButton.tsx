import { X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import confetti from 'canvas-confetti';

interface CompleteHabitButtonProps {
  isCompleted: boolean;
  onClick: () => void;
}

export const CompleteHabitButton = ({
  isCompleted,
  onClick,
}: CompleteHabitButtonProps) => {
  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isCompleted) {
      const button = e.currentTarget;
      const rect = button.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { 
          x: x / window.innerWidth,
          y: y / window.innerHeight
        }
      });
    }
    
    // S'assurer que l'événement onClick est toujours appelé
    await onClick();
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "w-full h-12 rounded-lg transition-all duration-200",
        "flex items-center justify-center gap-2 font-medium",
        "transform hover:-translate-y-1 active:translate-y-0",
        isCompleted 
          ? "bg-red-500 hover:bg-red-600 text-white shadow-[0_4px_0_rgb(185,28,28)]" 
          : "bg-habit-success hover:bg-emerald-400 text-white shadow-[0_4px_0_rgb(34,197,94)]",
        "active:shadow-[0_0px_0_rgb(34,197,94)]"
      )}
    >
      <span>{isCompleted ? "Annuler" : "Valider"}</span>
      {isCompleted ? (
        <X className="w-4 h-4" />
      ) : (
        <Check className="w-4 h-4" />
      )}
    </button>
  );
};