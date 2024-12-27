interface StreakStatsProps {
  currentStreak: number;
  longestStreak: number;
  tasksCompletedToday: number;
}

export const StreakStats = ({ currentStreak, longestStreak, tasksCompletedToday }: StreakStatsProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
        <p className="text-sm text-muted-foreground mb-1">Série actuelle</p>
        <p className="text-2xl font-bold">{currentStreak} jours</p>
      </div>
      <div className="p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
        <p className="text-sm text-muted-foreground mb-1">Record</p>
        <p className="text-2xl font-bold">{longestStreak} jours</p>
      </div>
      <div className="col-span-2 p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
        <p className="text-sm text-muted-foreground mb-1">Aujourd'hui</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((tasksCompletedToday / 3) * 100, 100)}%` }}
            />
          </div>
          <span className="text-sm font-medium">
            {tasksCompletedToday}/3
          </span>
        </div>
      </div>
    </div>
  );
};