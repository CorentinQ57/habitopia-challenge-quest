import { Snowflake } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface FreezeButtonProps {
  freezeTokens: number;
  onUseFreeze: () => Promise<void>;
}

export const FreezeButton = ({ freezeTokens, onUseFreeze }: FreezeButtonProps) => {
  if (freezeTokens <= 0) return null;

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20"
        >
          <Snowflake className="w-4 h-4 text-blue-500" />
          <span className="text-blue-500">Utiliser un glaçon ({freezeTokens})</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Utiliser un glaçon ?</AlertDialogTitle>
          <AlertDialogDescription>
            Votre série sera gelée pour aujourd'hui. Vous ne perdrez pas votre progression même si vous ne complétez pas vos tâches.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction onClick={onUseFreeze}>
            Utiliser
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};