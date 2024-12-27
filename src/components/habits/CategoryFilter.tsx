import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
      const { data, error } = await supabase
        .from("habit_categories")
        .select("*")
        .order("is_default", { ascending: false })
        .order("name");
      
      if (error) throw error;
      return data as Category[];
    },
  });

  if (!categories) return null;

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        onClick={() => onCategoryChange(null)}
        className={cn(
          "backdrop-blur-sm border-gray-200/50 bg-gray-100 hover:bg-gray-200 text-gray-700",
          !selectedCategory ? "ring-2 ring-offset-2 ring-stella-royal/20" : ""
        )}
      >
        Toutes
      </Button>

      {categories.map((category) => (
        <Button
          key={category.name}
          variant="outline"
          onClick={() => onCategoryChange(category.name)}
          className={cn(
            "backdrop-blur-sm border-gray-200/50",
            selectedCategory === category.name ? "ring-2 ring-offset-2 ring-stella-royal/20" : "",
            `text-[${category.color}] bg-[${category.color}]/10 hover:bg-[${category.color}]/20`
          )}
          style={{
            // Fallback inline styles in case Tailwind doesn't compile the dynamic colors
            color: category.color,
            backgroundColor: `${category.color}10`,
            ['--tw-hover-bg-opacity']: '0.2',
          }}
        >
          {category.name}
        </Button>
      ))}
    </div>
  );
};