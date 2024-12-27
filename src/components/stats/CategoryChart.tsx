import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const COLORS = {
  "Santé": "#9b87f5",      // Primary Purple
  "Bien-être": "#7E69AB",  // Secondary Purple
  "Apprentissage": "#FEC6A1", // Soft Orange
  "Productivité": "#D3E4FD", // Soft Blue
  "Non catégorisé": "#E5DEFF" // Soft Purple
};

const translateCategory = (category: string) => {
  const translations: { [key: string]: string } = {
    "Health": "Santé",
    "Wellness": "Bien-être",
    "Learning": "Apprentissage",
    "Productivity": "Productivité",
    "Non catégorisé": "Non catégorisé"
  };
  return translations[category] || "Non catégorisé";
};

interface CategoryChartProps {
  data: Array<{ name: string; value: number }>;
}

export const CategoryChart = ({ data }: CategoryChartProps) => {
  const translatedData = data.map(item => ({
    ...item,
    name: translateCategory(item.name)
  }));

  return (
    <Card className="backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Distribution par Catégorie</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={translatedData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {translatedData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[entry.name as keyof typeof COLORS] || COLORS["Non catégorisé"]}
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number, name: string) => [
                  `${value} habitudes`, 
                  name
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};