import { CompleteHabitButton } from "./CompleteHabitButton";
import { DeleteHabitButton } from "./DeleteHabitButton";

interface HabitCardActionsProps {
  habitId: string;
  habitTitle: string;
  isCompleted: boolean;
  onComplete: () => void;
  habitType: 'good' | 'bad';
}

export const HabitCardActions = ({ 
  habitId, 
  habitTitle, 
  isCompleted, 
  onComplete,
  habitType 
}: HabitCardActionsProps) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="absolute top-3 right-3 z-10">
        <DeleteHabitButton habitId={habitId} habitTitle={habitTitle} />
      </div>
      <CompleteHabitButton 
        isCompleted={isCompleted}
        onClick={onComplete}
      />
    </div>
  );
};