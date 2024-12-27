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

  const getContrastColor = (hexColor: string) => {
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    return luminance > 0.5 ? "#000000" : "#FFFFFF";
  };

  const getCategoryStyles = (color: string) => {
    const textColor = getContrastColor(color);
    const baseColor = color + "40";
    const hoverColor = color + "60";
    const activeColor = color + "80";

    return {
      color: textColor,
      backgroundColor: baseColor,
      "--hover-bg": hoverColor,
      "--active-bg": activeColor,
    } as React.CSSProperties;
  };

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
            "backdrop-blur-sm border-gray-200/50 transition-colors",
            selectedCategory === category.name ? "ring-2 ring-offset-2 ring-stella-royal/20" : "",
            "hover:bg-[var(--hover-bg)]"
          )}
          style={getCategoryStyles(category.color)}
        >
          {category.name}
        </Button>
      ))}
    </div>
  );
};