import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface CategoryBadgeProps {
  category: string;
}

export const CategoryBadge = ({ category }: CategoryBadgeProps) => {
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("habit_categories")
        .select("*")
        .or(`user_id.is.null,user_id.eq.${(await supabase.auth.getUser()).data.user?.id}`);
      
      if (error) throw error;
      return data;
    },
  });

  const translateCategory = (category: string) => {
    const translations: { [key: string]: string } = {
      "Health": "Santé",
      "Wellness": "Bien-être",
      "Learning": "Apprentissage",
      "Productivity": "Productivité"
    };
    return translations[category] || category;
  };

  const getCategoryColor = (categoryName: string): string => {
    const categoryData = categories?.find(c => c.name === categoryName);
    if (categoryData) {
      return `text-[${categoryData.color}] bg-[${categoryData.color}]/10`;
    }
    
    // Couleurs par défaut si la catégorie n'est pas trouvée
    const defaultColors: { [key: string]: string } = {
      "Health": "text-emerald-500 bg-emerald-50",
      "Wellness": "text-blue-500 bg-blue-50",
      "Learning": "text-purple-500 bg-purple-50",
      "Productivity": "text-orange-500 bg-orange-50"
    };
    return defaultColors[categoryName] || "text-gray-600 bg-gray-50";
  };

  return (
    <span 
      className={cn(
        "px-3 py-1.5 rounded-full font-medium text-sm truncate max-w-[150px]",
        getCategoryColor(category)
      )}
      title={translateCategory(category)}
    >
      {translateCategory(category)}
    </span>
  );
};