
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Habit } from "@/types/habit";
import { Loader2 } from "lucide-react";

interface GenerateHabitsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentHabits: Habit[];
}

export const GenerateHabitsDialog = ({
  isOpen,
  onClose,
  currentHabits,
}: GenerateHabitsDialogProps) => {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleGenerate = async () => {
    try {
      setIsLoading(true);
      
      // Appeler l'edge function pour générer les actions
      const { data: actions, error: generateError } = await supabase.functions.invoke(
        'generate-habits',
        {
          body: {
            prompt,
            currentHabits,
          },
        }
      );

      if (generateError) throw generateError;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      // Supprimer les habitudes
      if (actions.toDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from("habits")
          .delete()
          .eq('user_id', user.id)
          .in('title', actions.toDelete);

        if (deleteError) throw deleteError;
      }

      // Créer les nouvelles habitudes
      if (actions.toCreate.length > 0) {
        const habitsToCreate = actions.toCreate.map((habit: Partial<Habit>) => ({
          ...habit,
          user_id: user.id,
        }));

        const { error: createError } = await supabase
          .from("habits")
          .insert(habitsToCreate);

        if (createError) throw createError;
      }

      queryClient.invalidateQueries({ queryKey: ["habits"] });
      
      toast({
        title: "Habitudes mises à jour",
        description: `${actions.toCreate.length} habitude(s) créée(s), ${actions.toDelete.length} supprimée(s)`,
      });
      
      onClose();
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer les habitudes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Générer avec l'IA</DialogTitle>
          <DialogDescription>
            Décrivez les habitudes que vous souhaitez créer ou supprimer. L'IA vous aidera à les gérer.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <Textarea
            placeholder="Exemple: Je veux créer des habitudes pour le sport et supprimer mes mauvaises habitudes alimentaires"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[100px]"
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Annuler
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Génération...
              </>
            ) : (
              "Générer"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
