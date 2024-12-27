import { cn } from "@/lib/utils";

interface CategoryBadgeProps {
  category: string;
}

export const CategoryBadge = ({ category }: CategoryBadgeProps) => {
  const translateCategory = (category: string) => {
    const translations: { [key: string]: string } = {
      "Health": "Santé",
      "Wellness": "Bien-être",
      "Learning": "Apprentissage",
      "Productivity": "Productivité"
    };
    return translations[category] || category;
  };

  const getCategoryColor = (category: string): string => {
    const colors: { [key: string]: string } = {
      "Health": "text-stella-royal bg-stella-royal/10",
      "Wellness": "text-stella-purple bg-stella-purple/10",
      "Learning": "text-stella-royal bg-stella-royal/10",
      "Productivity": "text-stella-purple bg-stella-purple/10"
    };
    return colors[category] || "text-gray-600 bg-gray-50";
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