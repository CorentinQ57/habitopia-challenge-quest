import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Trophy, Target, Calendar, Award, Star } from "lucide-react";

const Profile = () => {
  const { data: totalXP } = useQuery({
    queryKey: ["totalXP"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("habit_logs")
        .select("experience_gained");
      
      if (error) throw error;
      return data.reduce((sum, log) => sum + log.experience_gained, 0);
    },
  });

  const { data: habitsCompleted } = useQuery({
    queryKey: ["habitsCompleted"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("habit_logs")
        .select("*");
      
      if (error) throw error;
      return data.length;
    },
  });

  const { data: userStreak } = useQuery({
    queryKey: ["userStreak"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_streaks")
        .select("*")
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-8">
      <h1>Mon Profil</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="col-span-full bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-lg border border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-primary" />
              Statistiques Globales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon={<Star className="w-5 h-5 text-yellow-500" />}
                title="XP Total"
                value={totalXP || 0}
                subtitle="points d'expérience"
              />
              <StatCard
                icon={<Target className="w-5 h-5 text-emerald-500" />}
                title="Habitudes Complétées"
                value={habitsCompleted || 0}
                subtitle="au total"
              />
              <StatCard
                icon={<Calendar className="w-5 h-5 text-blue-500" />}
                title="Série Actuelle"
                value={userStreak?.current_streak || 0}
                subtitle="jours consécutifs"
              />
              <StatCard
                icon={<Award className="w-5 h-5 text-purple-500" />}
                title="Meilleure Série"
                value={userStreak?.longest_streak || 0}
                subtitle="jours consécutifs"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-lg border border-white/20">
          <CardHeader>
            <CardTitle>Progression</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Niveau</span>
                  <span className="text-sm font-medium">{Math.floor((totalXP || 0) / 100) + 1}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out"
                    style={{ width: `${((totalXP || 0) % 100)}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-muted-foreground">
                    {(totalXP || 0) % 100}/100 XP
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Prochain niveau
                  </span>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="font-medium">Objectifs</h4>
                <p className="text-sm text-muted-foreground">
                  Complétez des habitudes pour gagner de l'expérience et débloquer de nouveaux niveaux !
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-lg border border-white/20">
          <CardHeader>
            <CardTitle>Récompenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Gagnez des points d'expérience pour débloquer de nouveaux skins et personnaliser votre personnage !
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-white/5 backdrop-blur-sm">
                  <h4 className="font-medium mb-1">Skins Débloqués</h4>
                  <p className="text-2xl font-bold text-primary">3</p>
                </div>
                <div className="p-4 rounded-lg bg-white/5 backdrop-blur-sm">
                  <h4 className="font-medium mb-1">Prochain Skin</h4>
                  <p className="text-2xl font-bold text-primary">500 XP</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const StatCard = ({ 
  icon, 
  title, 
  value, 
  subtitle 
}: { 
  icon: React.ReactNode;
  title: string;
  value: number;
  subtitle: string;
}) => (
  <div className="p-4 rounded-lg bg-white/5 backdrop-blur-sm space-y-2">
    <div className="flex items-center gap-2">
      {icon}
      <h4 className="font-medium text-sm">{title}</h4>
    </div>
    <div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{subtitle}</p>
    </div>
  </div>
);

export default Profile;