import { useState } from "react";
import { Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
import { useToast } from "@/hooks/use-toast";

interface Category {
  id: string;
  name: string;
  color: string;
  is_default: boolean;
}

export const CategoryManager = () => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#9b87f5");
  const { toast } = useToast();
  
  const { data: categories, refetch } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("habit_categories")
        .select("*")
        .order("is_default", { ascending: false })
        .order("name");
      
      if (error) throw error;
      return data as Category[];
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { error } = await supabase
        .from("habit_categories")
        .insert([{ name, color }]);

      if (error) throw error;

      toast({
        title: "Catégorie créée",
        description: "Votre nouvelle catégorie a été créée avec succès.",
      });

      setOpen(false);
      setName("");
      setColor("#9b87f5");
      refetch();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer la catégorie.",
        variant: "destructive",
      });
    }
  };

  const handleColorChange = async (id: string, newColor: string) => {
    try {
      const { error } = await supabase
        .from("habit_categories")
        .update({ color: newColor })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Couleur mise à jour",
        description: "La couleur de la catégorie a été mise à jour.",
      });
      
      refetch();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la couleur.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("habit_categories")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Catégorie supprimée",
        description: "La catégorie a été supprimée avec succès.",
      });
      
      refetch();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la catégorie.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Catégories</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle Catégorie
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nouvelle catégorie</DialogTitle>
              <DialogDescription>
                Créez une nouvelle catégorie pour vos habitudes.
              </DialogDescription>
            </DialogHeader>
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
              <DialogFooter>
                <Button type="submit">Créer la catégorie</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-2">
        {categories?.map((category) => (
          <div
            key={category.id}
            className="flex items-center justify-between p-2 rounded-lg border"
          >
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: category.color }}
              />
              <span>{category.name}</span>
              {category.is_default && (
                <span className="text-xs text-muted-foreground">(Par défaut)</span>
              )}
            </div>
            {!category.is_default && (
              <div className="flex items-center gap-2">
                <Input
                  type="color"
                  value={category.color}
                  onChange={(e) => handleColorChange(category.id, e.target.value)}
                  className="w-8 h-8 p-0 border-0"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleDelete(category.id)}
                >
                  Supprimer
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};