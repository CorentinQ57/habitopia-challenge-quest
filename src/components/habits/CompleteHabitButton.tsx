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
        "shrink-0 w-12 h-12 rounded-full transition-all duration-300 shadow-lg",
        "hover:scale-105 active:scale-95",
        "flex items-center justify-center",
        isCompleted 
          ? "bg-habit-success hover:bg-red-500 hover:rotate-12" 
          : "bg-white hover:bg-habit-success"
      )}
      style={{
        boxShadow: isCompleted 
          ? '0 0 20px rgba(167, 243, 208, 0.5)' 
          : '0 4px 12px rgba(0, 0, 0, 0.1)',
      }}
    >
      {isCompleted ? (
        <X className="w-6 h-6 text-white transition-transform" />
      ) : (
        <Check className={cn(
          "w-6 h-6 transition-colors",
          isCompleted ? "text-white" : "text-habit-success"
        )} />
      )}
    </button>
  );
};