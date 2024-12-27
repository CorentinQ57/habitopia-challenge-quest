import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface CompleteHabitButtonProps {
  isCompleted: boolean;
  onClick: () => void;
}

export const CompleteHabitButton = ({ isCompleted, onClick }: CompleteHabitButtonProps) => {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full h-12 rounded-lg transition-all duration-300",
        "flex items-center justify-center gap-2 font-medium",
        "transform hover:-translate-y-1 active:translate-y-0",
        isCompleted 
          ? "bg-red-500 hover:bg-red-600 text-white" 
          : "bg-habit-success hover:bg-emerald-400 text-white",
        !isCompleted && "shadow-[0_4px_0_rgb(34,197,94)] hover:shadow-[0_6px_0_rgb(34,197,94)]",
        !isCompleted && "active:shadow-[0_0px_0_rgb(34,197,94)]",
        isCompleted && "animate-glow"
      )}
      style={{
        boxShadow: isCompleted 
          ? '0 4px 0 rgb(239, 68, 68), 0 0 20px rgba(239, 68, 68, 0.5)' 
          : '0 4px 0 rgb(34, 197, 94)',
      }}
    >
      <span>{isCompleted ? "Annuler" : "Valider"}</span>
      {isCompleted ? (
        <X className="w-5 h-5" />
      ) : (
        <Check className="w-5 h-5" />
      )}
    </button>
  );
};