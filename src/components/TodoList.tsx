import { Check, Coffee, Home, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Todo {
  id: number;
  title: string;
  time: string;
  location: string;
  icon: any;
  done: boolean;
  experiencePoints: number;
  description?: string;
  category: string;
}

export const TodoList = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [todos, setTodos] = useState<Todo[]>([
    { 
      id: 1,
      title: "Étudier",
      description: "Réviser les cours de la semaine",
      time: "10:00",
      location: "K-Cafe",
      icon: Coffee,
      done: false,
      experiencePoints: 10,
      category: "Learning"
    },
    {
      id: 2,
      title: "Courses",
      description: "Acheter les provisions de la semaine",
      time: "14:00",
      location: "Hayday Market",
      icon: ShoppingCart,
      done: false,
      experiencePoints: 15,
      category: "Productivity"
    },
    {
      id: 3,
      title: "Manger sainement",
      description: "Préparer un repas équilibré",
      time: "08:30",
      location: "Maison",
      icon: Home,
      done: false,
      experiencePoints: 20,
      category: "Health"
    }
  ]);

  const handleComplete = async (todoId: number) => {
    try {
      const todo = todos.find(t => t.id === todoId);
      if (!todo || todo.done) return;

      const { error } = await supabase
        .from("habit_logs")
        .insert([{ 
          experience_gained: todo.experiencePoints,
          notes: `Tâche complétée: ${todo.title}`
        }]);

      if (error) throw error;

      setTodos(todos.map(t => 
        t.id === todoId ? { ...t, done: true } : t
      ));

      queryClient.invalidateQueries({ queryKey: ["todayXP"] });
      queryClient.invalidateQueries({ queryKey: ["totalXP"] });

      toast({
        title: "Bravo !",
        description: `+${todo.experiencePoints} points d'expérience gagnés !`,
      });

    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de valider la tâche.",
        variant: "destructive",
      });
    }
  };

  const getCategoryColor = (category: string): string => {
    const colors: { [key: string]: string } = {
      "Health": "text-emerald-600 bg-emerald-50",
      "Wellness": "text-blue-600 bg-blue-50",
      "Learning": "text-purple-600 bg-purple-50",
      "Productivity": "text-orange-600 bg-orange-50"
    };
    return colors[category] || "text-gray-600 bg-gray-50";
  };

  return (
    <div className="space-y-4">
      {todos.map((todo) => (
        <Card 
          key={todo.id}
          className={`transition-all duration-300 animate-fade-in backdrop-blur-sm bg-white/90
            ${todo.done ? 'bg-habit-success/20' : ''}`}
          style={{
            boxShadow: todo.done 
              ? "0 8px 32px 0 rgba(167, 243, 208, 0.2)"
              : "0 8px 32px 0 rgba(31, 38, 135, 0.07)",
          }}
        >
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <CardTitle className={`flex items-center gap-2 text-xl mb-1 ${todo.done ? 'line-through text-muted-foreground' : ''}`}>
                  {todo.title}
                </CardTitle>
                <p className={`text-sm ${todo.done ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                  {todo.description}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {todo.time} • {todo.location}
                </p>
              </div>
              <button
                onClick={() => handleComplete(todo.id)}
                disabled={todo.done}
                className={`shrink-0 p-2 rounded-full transition-all duration-300
                  ${todo.done 
                    ? 'bg-habit-success cursor-default' 
                    : 'bg-white hover:bg-habit-success hover:text-white'}`}
                style={{
                  boxShadow: todo.done ? '0 0 15px rgba(167, 243, 208, 0.5)' : 'none',
                }}
              >
                <Check className={`w-5 h-5 ${todo.done ? 'text-white' : 'text-habit-success'}`} />
              </button>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="flex items-center justify-between text-sm">
              <span className={`px-3 py-1 rounded-full ${getCategoryColor(todo.category)}`}>
                {todo.category}
              </span>
              <div className="flex items-center gap-1.5 text-amber-500">
                <span className="font-medium">
                  {todo.experiencePoints} XP
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};