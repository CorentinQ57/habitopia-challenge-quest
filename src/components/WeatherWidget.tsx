import { Cloud, Umbrella, Wind } from "lucide-react";

export const WeatherWidget = () => {
  return (
    <div className="habit-card bg-habit-warning/30 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold mb-4">Weather</h3>
          <div className="flex gap-8">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Wind</p>
              <div className="flex items-center gap-1">
                <Wind className="w-4 h-4" />
                <span>2-4 km/h</span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Pressure</p>
              <div className="flex items-center gap-1">
                <Cloud className="w-4 h-4" />
                <span>102m</span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Humidity</p>
              <div className="flex items-center gap-1">
                <Umbrella className="w-4 h-4" />
                <span>42%</span>
              </div>
            </div>
          </div>
        </div>
        <div className="text-4xl font-bold">12°C</div>
      </div>
    </div>
  );
};