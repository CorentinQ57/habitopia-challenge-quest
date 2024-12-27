import { Header } from "@/components/Header";
import { TodoList } from "@/components/TodoList";
import { WeatherWidget } from "@/components/WeatherWidget";

const Index = () => {
  return (
    <div className="min-h-screen p-8 bg-background">
      <div className="max-w-6xl mx-auto">
        <Header />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <WeatherWidget />
          <TodoList />
        </div>
      </div>
    </div>
  );
};

export default Index;