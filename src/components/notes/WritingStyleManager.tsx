
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle } from "lucide-react";

interface WritingStyle {
  id: string;
  title: string;
  prompt: string;
  is_default: boolean;
}

interface WritingStyleManagerProps {
  selectedStyle: string | null;
  onStyleChange: (styleId: string | null) => void;
}

export const WritingStyleManager = ({ selectedStyle, onStyleChange }: WritingStyleManagerProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [newStyle, setNewStyle] = useState({ title: "", prompt: "" });

  const { data: styles } = useQuery({
    queryKey: ["writing-styles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("writing_styles")
        .select("*")
        .order("is_default", { ascending: false })
        .order("title");

      if (error) throw error;
      return data as WritingStyle[];
    },
  });

  const createStyleMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      const { error } = await supabase
        .from("writing_styles")
        .insert({
          title: newStyle.title,
          prompt: newStyle.prompt,
          user_id: user.id,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["writing-styles"] });
      setIsOpen(false);
      setNewStyle({ title: "", prompt: "" });
      toast({
        title: "Style créé",
        description: "Votre style d'écriture a été créé avec succès.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de créer le style d'écriture.",
        variant: "destructive",
      });
      console.error("Erreur lors de la création du style:", error);
    },
  });

  return (
    <div className="flex items-center gap-2">
      <Select value={selectedStyle || ""} onValueChange={onStyleChange}>
        <SelectTrigger className="w-[200px] bg-white/50 backdrop-blur-sm">
          <SelectValue placeholder="Style d'écriture" />
        </SelectTrigger>
        <SelectContent>
          {styles?.map((style) => (
            <SelectItem key={style.id} value={style.id}>
              {style.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon">
            <PlusCircle className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer un style d'écriture</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Titre
              </label>
              <Input
                id="title"
                value={newStyle.title}
                onChange={(e) => setNewStyle(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ex: Humoristique"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="prompt" className="text-sm font-medium">
                Instructions pour l'IA
              </label>
              <Textarea
                id="prompt"
                value={newStyle.prompt}
                onChange={(e) => setNewStyle(prev => ({ ...prev, prompt: e.target.value }))}
                placeholder="Ex: Tu es un assistant humoristique qui utilise un ton léger et des jeux de mots..."
                className="min-h-[100px]"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Annuler
              </Button>
              <Button
                onClick={() => createStyleMutation.mutate()}
                disabled={!newStyle.title || !newStyle.prompt || createStyleMutation.isPending}
              >
                Créer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
