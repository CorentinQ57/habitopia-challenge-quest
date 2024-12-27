import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

const categories = [
  { value: "Health", label: "Santé" },
  { value: "Wellness", label: "Bien-être" },
  { value: "Learning", label: "Apprentissage" },
  { value: "Productivity", label: "Productivité" },
];

export const AddHabitDialog = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const habit = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      category: formData.get("category") as string,
      experience_points: parseInt(formData.get("experience_points") as string) || 10,
      user_id: (await supabase.auth.getUser()).data.user?.id
    };

    try {
      const { error } = await supabase.from("habits").insert([habit]);
      
      if (error) throw error;

      toast({
        title: "Succès !",
        description: "Nouvelle habitude créée avec succès.",
      });
      
      queryClient.invalidateQueries({ queryKey: ["habits"] });
      setOpen(false);
    } catch (error) {
      console.error("Error creating habit:", error);
      toast({
        title: "Erreur",
        description: "Impossible de créer l'habitude. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 bg-habit-warning/20 hover:bg-habit-warning/30 border-0">
          <Plus className="w-4 h-4" />
          Nouvelle Habitude
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Créer une nouvelle habitude</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titre</Label>
            <Input id="title" name="title" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Catégorie</Label>
            <Select name="category" required>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une catégorie" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="experience_points">Points d'expérience</Label>
            <Input 
              id="experience_points" 
              name="experience_points" 
              type="number" 
              defaultValue="10"
              min="1"
              required 
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Création..." : "Créer l'habitude"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};