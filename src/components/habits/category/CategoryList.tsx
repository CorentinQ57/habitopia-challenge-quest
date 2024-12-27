import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Category {
  id: string;
  name: string;
  color: string;
  is_default: boolean;
}

interface CategoryListProps {
  categories: Category[] | undefined;
  onUpdate: () => void;
}

export const CategoryList = ({ categories, onUpdate }: CategoryListProps) => {
  const { toast } = useToast();

  const handleColorChange = async (id: string, newColor: string) => {
    if (!id) return;
    
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
      
      onUpdate();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la couleur.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!id) return;
    
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
      
      onUpdate();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la catégorie.",
        variant: "destructive",
      });
    }
  };

  return (
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
                onClick={() => handleDelete(category.id)}
                className="relative transition-all duration-300 hover:bg-white hover:shadow-[0_4px_0_rgb(63,43,150)] active:shadow-none active:translate-y-1 group"
              >
                <span className="relative z-10 group-hover:bg-gradient-to-r group-hover:from-[#a8c0ff] group-hover:to-[#3f2b96] group-hover:bg-clip-text group-hover:text-transparent">
                  Supprimer
                </span>
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};