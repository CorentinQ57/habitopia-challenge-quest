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

  const getCategoryColor = (categoryName: string): { text: string, background: string } => {
    const categoryData = categories?.find(c => c.name === categoryName);
    if (categoryData) {
      return {
        text: categoryData.color,
        background: `${categoryData.color}20` // Ajoute une transparence de 20%
      };
    }
    
    // Couleurs par défaut si la catégorie n'est pas trouvée
    const defaultColors: { [key: string]: { text: string, background: string } } = {
      "Health": { text: "#10B981", background: "#ECFDF5" },
      "Wellness": { text: "#3B82F6", background: "#EFF6FF" },
      "Learning": { text: "#8B5CF6", background: "#F5F3FF" },
      "Productivity": { text: "#F97316", background: "#FFF7ED" }
    };
    return defaultColors[categoryName] || { text: "#6B7280", background: "#F9FAFB" };
  };

  const colors = getCategoryColor(category);

  return (
    <span 
      className="px-3 py-1.5 rounded-full font-medium text-sm truncate max-w-[150px]"
      style={{
        color: colors.text,
        backgroundColor: colors.background
      }}
      title={translateCategory(category)}
    >
      {translateCategory(category)}
    </span>
  );
};