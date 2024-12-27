import { Check, Coffee, Home, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface Todo {
  id: number;
  title: string;
  time: string;
  location: string;
  icon: any;
  done: boolean;
  experiencePoints: number;
}

export const TodoList = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [todos, setTodos] = useState<Todo[]>([
    { 
      id: 1,
      title: "Étudier",
      time: "10:00",
      location: "K-Cafe",
      icon: Coffee,
      done: false,
      experiencePoints: 10
    },
    {
      id: 2,
      title: "Courses",
      time: "14:00",
      location: "Hayday Market",
      icon: ShoppingCart,
      done: false,
      experiencePoints: 15
    },
    {
      id: 3,
      title: "Manger sainement",
      time: "08:30",
      location: "Maison",
      icon: Home,
      done: false,
      experiencePoints: 20
    }
  ]);

  const handleComplete = async (todoId: number) => {
    try {
      const todo = todos.find(t => t.id === todoId);
      if (!todo || todo.done) return;

      // Ajouter l'expérience dans la base de données
      const { error } = await supabase
        .from("habit_logs")
        .insert([{ 
          experience_gained: todo.experiencePoints,
          notes: `Tâche complétée: ${todo.title}`
        }]);

      if (error) throw error;

      // Mettre à jour l'état local
      setTodos(todos.map(t => 
        t.id === todoId ? { ...t, done: true } : t
      ));

      // Invalider les queries pour rafraîchir l'XP
      queryClient.invalidateQueries({ queryKey: ["todayXP"] });
      queryClient.invalidateQueries({ queryKey: ["totalXP"] });

      // Afficher une notification
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

  return (
    <div className="habit-card animate-fade-in backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-blue-700">
          Tâches du jour
        </h3>
        <button className="text-sm text-muted-foreground hover:text-blue-500 transition-colors">
          Voir détails
        </button>
      </div>
      <div className="space-y-4">
        {todos.map((todo) => (
          <div 
            key={todo.id}
            className={`flex items-center justify-between p-4 rounded-xl transition-all duration-300 backdrop-blur-sm
              ${todo.done ? 'bg-habit-success/20' : 'bg-muted hover:bg-muted/80'}`}
            style={{
              boxShadow: todo.done ? '0 0 15px rgba(167, 243, 208, 0.3)' : 'none'
            }}
          >
            <div className="flex items-center gap-4">
              <div className={`habit-icon ${todo.done ? 'bg-habit-success' : 'bg-white'}`}>
                <todo.icon className="w-5 h-5" />
              </div>
              <div>
                <h4 className={`font-medium ${todo.done ? 'line-through text-muted-foreground' : ''}`}>
                  {todo.title}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {todo.time} • {todo.location}
                </p>
              </div>
            </div>
            <button
              onClick={() => handleComplete(todo.id)}
              disabled={todo.done}
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300
                ${todo.done ? 'bg-habit-success border-habit-success cursor-default' : 'border-muted-foreground hover:border-habit-success hover:bg-habit-success/10 cursor-pointer'}`}
              style={{
                boxShadow: todo.done ? '0 0 10px rgba(167, 243, 208, 0.5)' : 'none'
              }}
            >
              {todo.done && <Check className="w-4 h-4 text-white" />}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};