
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { DeleteHabitDialog } from "./DeleteHabitDialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface DeleteHabitButtonProps {
  habitId: string;
  habitTitle: string;
}

export const DeleteHabitButton = ({ habitId, habitTitle }: DeleteHabitButtonProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from("habits")
        .delete()
        .eq("id", habitId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["habits"] });
      
      toast({
        title: "Habitude supprimée",
        description: "L'habitude a été supprimée avec succès.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'habitude.",
        variant: "destructive",
      });
    } finally {
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowDeleteDialog(true);
        }}
        className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-red-500 hover:text-white transition-colors"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      <DeleteHabitDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        habitTitle={habitTitle}
      />
    </>
  );
};
