export interface Habit {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  is_popular: boolean;
  created_at: string;
  experience_points: number;
  habit_type: 'good' | 'bad';
  user_id?: string;
}