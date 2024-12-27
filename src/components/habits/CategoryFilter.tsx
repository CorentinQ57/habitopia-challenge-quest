import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const categories = [
  { value: "all", label: "Toutes", color: "bg-gray-100 hover:bg-gray-200 text-gray-700" },
  { value: "Health", label: "Santé", color: "text-stella-royal bg-stella-royal/10 hover:bg-stella-royal/20" },
  { value: "Wellness", label: "Bien-être", color: "text-stella-purple bg-stella-purple/10 hover:bg-stella-purple/20" },
  { value: "Learning", label: "Apprentissage", color: "text-stella-royal bg-stella-royal/10 hover:bg-stella-royal/20" },
  { value: "Productivity", label: "Productivité", color: "text-stella-purple bg-stella-purple/10 hover:bg-stella-purple/20" },
];

interface CategoryFilterProps {
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}

export const CategoryFilter = ({ selectedCategory, onCategoryChange }: CategoryFilterProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <Button
          key={category.value}
          variant="outline"
          onClick={() => onCategoryChange(category.value === "all" ? null : category.value)}
          className={cn(
            "backdrop-blur-sm border-gray-200/50",
            category.color,
            selectedCategory === category.value || (category.value === "all" && !selectedCategory)
              ? "ring-2 ring-offset-2 ring-stella-royal/20"
              : ""
          )}
        >
          {category.label}
        </Button>
      ))}
    </div>
  );
};