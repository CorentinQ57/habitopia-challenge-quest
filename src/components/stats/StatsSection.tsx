import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Award, Target, Zap } from "lucide-react";

export const StatsSection = () => {
  const { data: weeklyStats } = useQuery({
    queryKey: ["weeklyStats"],
    queryFn: async () => {
      const today = new Date();
      const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const { data, error } = await supabase
        .from("habit_logs")
        .select("completed_at, experience_gained")
        .gte("completed_at", lastWeek.toISOString())
        .order("completed_at");
      
      if (error) throw error;

      const dailyStats = data.reduce((acc: any, log) => {
        const date = new Date(log.completed_at).toLocaleDateString('fr-FR', { weekday: 'short' });
        if (!acc[date]) {
          acc[date] = {
            day: date,
            xp: 0,
            count: 0
          };
        }
        acc[date].xp += log.experience_gained;
        acc[date].count += 1;
        return acc;
      }, {});

      return Object.values(dailyStats);
    },
  });

  const { data: totalStats } = useQuery({
    queryKey: ["totalStats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("habit_logs")
        .select("*");
      
      if (error) throw error;
      
      return {
        totalHabits: data.length,
        totalXP: data.reduce((sum, log) => sum + log.experience_gained, 0),
        streak: Math.floor(data.length / 3), // Simulation d'une série
        completion: ((data.length / (7 * 3)) * 100).toFixed(1) // Taux sur la semaine
      };
    },
  });

  const chartConfig = {
    xp: {
      color: "#9b87f5",
      label: "XP gagnés"
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <h2 className="text-2xl font-bold">Statistiques</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Zap className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total XP</p>
                <p className="text-2xl font-bold">{totalStats?.totalXP || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Activity className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Habitudes Complétées</p>
                <p className="text-2xl font-bold">{totalStats?.totalHabits || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-amber-500/20 rounded-lg">
                <Award className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Série Actuelle</p>
                <p className="text-2xl font-bold">{totalStats?.streak || 0} jours</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <Target className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Taux de Complétion</p>
                <p className="text-2xl font-bold">{totalStats?.completion || 0}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Progression Hebdomadaire</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyStats} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">
                                XP
                              </span>
                              <span className="font-bold text-muted-foreground">
                                {payload[0].value}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">
                                Habitudes
                              </span>
                              <span className="font-bold text-muted-foreground">
                                {payload[0].payload.count}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="xp"
                  fill={chartConfig.xp.color}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};