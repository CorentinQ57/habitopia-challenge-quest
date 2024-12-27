import { Card, CardContent } from "@/components/ui/card";
import { Activity, Award, Target, Clock } from "lucide-react";

interface StatsCardsProps {
  streak: {
    current_streak: number;
    longest_streak: number;
    tasks_completed_today: number;
    last_activity_date: string;
  } | null;
}

export const StatsCards = ({ streak }: StatsCardsProps) => {
  return (
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
  );
};