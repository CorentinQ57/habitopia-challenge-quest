import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const categories = [
  { value: "Health", label: "Santé" },
  { value: "Wellness", label: "Bien-être" },
  { value: "Learning", label: "Apprentissage" },
  { value: "Productivity", label: "Productivité" },
];

interface CategoryFilterProps {
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}

export const CategoryFilter = ({ selectedCategory, onCategoryChange }: CategoryFilterProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="bg-white/50 backdrop-blur-sm border-gray-200/50 hover:bg-white/60"
        >
          {selectedCategory ? categories.find(c => c.value === selectedCategory)?.label : "Toutes les catégories"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Filtrer par catégorie</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={!selectedCategory}
          onCheckedChange={() => onCategoryChange(null)}
        >
          Toutes les catégories
        </DropdownMenuCheckboxItem>
        {categories.map((category) => (
          <DropdownMenuCheckboxItem
            key={category.value}
            checked={selectedCategory === category.value}
            onCheckedChange={() => onCategoryChange(category.value)}
          >
            {category.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};