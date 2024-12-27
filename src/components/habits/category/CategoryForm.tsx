import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CategoryFormProps {
  onSuccess: () => void;
  onClose: () => void;
}

export const CategoryForm = ({ onSuccess, onClose }: CategoryFormProps) => {
  const [name, setName] = useState("");
  const [color, setColor] = useState("#9b87f5");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("habit_categories")
        .insert([{ 
          name, 
          color,
          user_id: user?.id 
        }]);

      if (error) throw error;

      toast({
        title: "Catégorie créée",
        description: "Votre nouvelle catégorie a été créée avec succès.",
      });

      onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer la catégorie.",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Nom</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Sport"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="color">Couleur</Label>
          <Input
            id="color"
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Annuler
        </Button>
        <Button type="submit">Créer la catégorie</Button>
      </div>
    </form>
  );
};