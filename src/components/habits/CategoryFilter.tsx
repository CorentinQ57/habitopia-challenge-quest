
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CategoryFilterProps {
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}

interface Category {
  name: string;
  color: string;
}

export const CategoryFilter = ({ selectedCategory, onCategoryChange }: CategoryFilterProps) => {
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from("habit_categories")
        .select("name, color")
        .or(`user_id.eq.${user?.id},is_default.eq.true`)
        .order("is_default", { ascending: false })
        .order("name");
      
      if (error) throw error;
      return data as Category[];
    },
  });

  if (!categories) return null;

  return (
    <Select value={selectedCategory || "all"} onValueChange={(value) => onCategoryChange(value === "all" ? null : value)}>
      <SelectTrigger className="w-[180px] bg-white/50 backdrop-blur-sm">
        <SelectValue placeholder="Toutes les catégories" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Toutes les catégories</SelectItem>
        {categories.map((category) => (
          <SelectItem
            key={category.name}
            value={category.name}
            className="flex items-center gap-2"
          >
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: category.color }}
              />
              {category.name}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
