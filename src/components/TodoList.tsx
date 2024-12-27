import { Check, Coffee, Home, ShoppingCart } from "lucide-react";

export const TodoList = () => {
  return (
    <div className="habit-card animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold">Today's Todos</h3>
        <button className="text-sm text-muted-foreground">View Details</button>
      </div>
      <div className="space-y-4">
        {[
          { 
            title: "Study",
            time: "10:00 am",
            location: "K-Cafe",
            icon: Coffee,
            done: false
          },
          {
            title: "Groceries",
            time: "02:00 pm",
            location: "Hayday Market",
            icon: ShoppingCart,
            done: false
          },
          {
            title: "Eat Healthy Food",
            time: "08:30 am",
            location: "Home",
            icon: Home,
            done: true
          }
        ].map((todo, index) => (
          <div 
            key={index}
            className={`flex items-center justify-between p-4 rounded-xl transition-all duration-200
              ${todo.done ? 'bg-habit-success/20' : 'bg-muted hover:bg-muted/80'}`}
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
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center
              ${todo.done ? 'bg-habit-success border-habit-success' : 'border-muted-foreground'}`}
            >
              {todo.done && <Check className="w-4 h-4 text-white" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};