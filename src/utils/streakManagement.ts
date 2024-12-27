import { supabase } from "@/integrations/supabase/client";

export const updateUserStreak = async (tasksCompletedToday: number) => {
  const today = new Date().toISOString().split('T')[0];
  
  const { data: existingStreak } = await supabase
    .from("user_streaks")
    .select("*")
    .maybeSingle();

  if (!existingStreak) {
    await supabase
      .from("user_streaks")
      .insert([{
        tasks_completed_today: tasksCompletedToday,
        last_activity_date: today,
        current_streak: tasksCompletedToday >= 3 ? 1 : 0,
        longest_streak: tasksCompletedToday >= 3 ? 1 : 0
      }]);
    return;
  }

  const lastActivityDate = existingStreak.last_activity_date;
  const isNewDay = lastActivityDate !== today;
  
  let newCurrentStreak = existingStreak.current_streak;
  let newLongestStreak = existingStreak.longest_streak;

  if (isNewDay) {
    if (existingStreak.tasks_completed_today >= 3) {
      if (tasksCompletedToday >= 3) {
        newCurrentStreak += 1;
        newLongestStreak = Math.max(newCurrentStreak, existingStreak.longest_streak);
      }
    } else {
      newCurrentStreak = tasksCompletedToday >= 3 ? 1 : 0;
    }
  } else {
    if (tasksCompletedToday >= 3 && existingStreak.tasks_completed_today < 3) {
      newCurrentStreak = existingStreak.current_streak + 1;
      newLongestStreak = Math.max(newCurrentStreak, existingStreak.longest_streak);
    }
  }

  await supabase
    .from("user_streaks")
    .update({
      tasks_completed_today: tasksCompletedToday,
      last_activity_date: today,
      current_streak: newCurrentStreak,
      longest_streak: newLongestStreak
    })
    .eq('id', existingStreak.id);
};