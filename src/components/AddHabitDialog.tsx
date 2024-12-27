import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "./ui/textarea";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface AddHabitDialogProps {
  variant?: "button" | "card";
}

export const AddHabitDialog = ({ variant = "button" }: AddHabitDialogProps) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { error } = await supabase.from("habits").insert([
        {
          title,
          description,
        },
      ]);

      if (error) throw error;

      toast({
        title: "Habitude créée",
        description: "Votre nouvelle habitude a été créée avec succès.",
      });

      setOpen(false);
      setTitle("");
      setDescription("");
      queryClient.invalidateQueries({ queryKey: ["habits"] });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer l'habitude.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {variant === "button" ? (
          <Button variant="outline" className="gap-2 bg-habit-warning/20 hover:bg-habit-warning/30 border-0">
            <Plus className="w-4 h-4" />
            Nouvelle Habitude
          </Button>
        ) : (
          <div className="h-full min-h-[280px] rounded-lg border border-dashed border-gray-300 bg-gray-50/50 hover:bg-gray-50/80 transition-colors cursor-pointer flex items-center justify-center">
            <Plus className="w-12 h-12 text-gray-400" />
          </div>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nouvelle habitude</DialogTitle>
          <DialogDescription>
            Créez une nouvelle habitude à suivre quotidiennement.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Titre</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Méditer 10 minutes"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Prendre un moment pour méditer et se recentrer"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Créer l'habitude</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};