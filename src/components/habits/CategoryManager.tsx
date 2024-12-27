import { useState } from "react";
import { Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CategoryForm } from "./category/CategoryForm";
import { CategoryList } from "./category/CategoryList";

export const CategoryManager = () => {
  const [open, setOpen] = useState(false);
  
  const { data: categories, refetch } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("habit_categories")
        .select("*")
        .or(`user_id.eq.${user.id},is_default.eq.true`)
        .order("is_default", { ascending: false })
        .order("name");
      
      if (error) throw error;
      return data;
    },
  });

  const handleSuccess = () => {
    refetch();
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
            <CategoryForm 
              onSuccess={handleSuccess} 
              onClose={() => setOpen(false)} 
            />
          </DialogContent>
        </Dialog>
      </div>

      <CategoryList 
        categories={categories} 
        onUpdate={handleSuccess}
      />
    </div>
  );
};