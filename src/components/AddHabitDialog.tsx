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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient, useQuery } from "@tanstack/react-query";

interface AddHabitDialogProps {
  variant?: "button" | "card";
}

interface Category {
  id: string;
  name: string;
  color: string;
}

export const AddHabitDialog = ({ variant = "button" }: AddHabitDialogProps) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [experiencePoints, setExperiencePoints] = useState("10");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories } = useQuery({
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
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase.from("habits").insert([
        {
          title,
          description,
          category,
          experience_points: parseInt(experiencePoints),
          user_id: user?.id,
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
      setCategory("");
      setExperiencePoints("10");
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
          <Button 
            variant="outline" 
            className="group relative overflow-hidden shadow-lg transition-all duration-300 animate-bounce-scale border-b-4 border-[#3f2b96]/20 active:border-b-0 active:translate-y-1"
            style={{
              background: 'linear-gradient(135deg, #a8c0ff, #3f2b96)',
              boxShadow: '0 4px 15px rgba(63, 43, 150, 0.3)'
            }}
          >
            <div className="absolute inset-0 bg-white/20 group-hover:bg-white/30 transition-colors" />
            <span className="relative flex items-center gap-2 text-stella-white">
              <Plus className="w-4 h-4" />
              Nouvelle Habitude
            </span>
          </Button>
        ) : (
          <div className="h-[280px] rounded-lg border border-dashed border-gray-300 bg-gray-50/50 hover:bg-gray-50/80 transition-colors cursor-pointer flex items-center justify-center">
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
            <div className="grid gap-2">
              <Label htmlFor="category">Catégorie</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: cat.color }}
                        />
                        {cat.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="experiencePoints">Points d'expérience</Label>
              <Input
                id="experiencePoints"
                type="number"
                min="1"
                value={experiencePoints}
                onChange={(e) => setExperiencePoints(e.target.value)}
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