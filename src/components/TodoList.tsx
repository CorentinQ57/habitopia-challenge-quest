import { Check, Coffee, Home, ShoppingCart } from "lucide-react";

export const TodoList = () => {
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
        {[
          { 
            title: "Étudier",
            time: "10:00",
            location: "K-Cafe",
            icon: Coffee,
            done: false
          },
          {
            title: "Courses",
            time: "14:00",
            location: "Hayday Market",
            icon: ShoppingCart,
            done: false
          },
          {
            title: "Manger sainement",
            time: "08:30",
            location: "Maison",
            icon: Home,
            done: true
          }
        ].map((todo, index) => (
          <div 
            key={index}
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
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300
              ${todo.done ? 'bg-habit-success border-habit-success' : 'border-muted-foreground'}`}
              style={{
                boxShadow: todo.done ? '0 0 10px rgba(167, 243, 208, 0.5)' : 'none'
              }}
            >
              {todo.done && <Check className="w-4 h-4 text-white" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};