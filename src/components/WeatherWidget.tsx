import { Cloud, Umbrella, Wind } from "lucide-react";

export const WeatherWidget = () => {
  return (
    <div className="habit-card bg-gradient-to-br from-habit-warning/30 to-habit-info/20 animate-fade-in backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-blue-700">Météo</h3>
          <div className="flex gap-8">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Vent</p>
              <div className="flex items-center gap-1">
                <Wind className="w-4 h-4 text-blue-500" />
                <span>2-4 km/h</span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Pression</p>
              <div className="flex items-center gap-1">
                <Cloud className="w-4 h-4 text-blue-500" />
                <span>102m</span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Humidité</p>
              <div className="flex items-center gap-1">
                <Umbrella className="w-4 h-4 text-blue-500" />
                <span>42%</span>
              </div>
            </div>
          </div>
        </div>
        <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-blue-500 to-blue-700">
          12°C
        </div>
      </div>
    </div>
  );
};