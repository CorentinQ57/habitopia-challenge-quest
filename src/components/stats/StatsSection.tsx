import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Activity, Award, Target, Zap, Clock } from "lucide-react";

const COLORS = ['#9b87f5', '#87d4f5', '#f587b3', '#87f5b7'];

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

  const { data: categoryStats } = useQuery({
    queryKey: ["categoryStats"],
    queryFn: async () => {
      const { data: logs, error } = await supabase
        .from("habit_logs")
        .select(`
          habits (
            category
          )
        `);
      
      if (error) throw error;

      const categories = logs.reduce((acc: any, log) => {
        const category = log.habits?.category || 'Non catégorisé';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(categories).map(([name, value]) => ({
        name,
        value
      }));
    },
  });

  const { data: hourlyStats } = useQuery({
    queryKey: ["hourlyStats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("habit_logs")
        .select("completed_at");
      
      if (error) throw error;

      const hourly = Array(24).fill(0).map((_, i) => ({
        hour: i,
        count: 0
      }));

      data.forEach(log => {
        const hour = new Date(log.completed_at).getHours();
        hourly[hour].count++;
      });

      return hourly;
    },
  });

  const { data: streak } = useQuery({
    queryKey: ["userStreak"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("user_streaks")
        .select("*")
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
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
                <Award className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Série Actuelle</p>
                <p className="text-2xl font-bold">{streak?.current_streak || 0}</p>
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
                <p className="text-sm text-muted-foreground">Record de Série</p>
                <p className="text-2xl font-bold">{streak?.longest_streak || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-amber-500/20 rounded-lg">
                <Target className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tâches Aujourd'hui</p>
                <p className="text-2xl font-bold">{streak?.tasks_completed_today || 0}/3</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <Clock className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Dernière Activité</p>
                <p className="text-2xl font-bold">
                  {streak?.last_activity_date ? new Date(streak.last_activity_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : '-'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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

        <Card className="backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Distribution par Catégorie</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryStats?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-sm lg:col-span-2">
          <CardHeader>
            <CardTitle>Activité par Heure</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={hourlyStats}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="hour" 
                    tickFormatter={(hour) => `${hour}h`}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`${value} habitudes`, 'Complétées']}
                    labelFormatter={(hour) => `${hour}h00`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#9b87f5" 
                    strokeWidth={2}
                    dot={{ fill: '#9b87f5' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};