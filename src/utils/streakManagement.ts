import { supabase } from "@/integrations/supabase/client";

export const updateUserStreak = async (tasksCompletedToday: number) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const today = new Date().toISOString().split('T')[0];
  
  const { data: existingStreak } = await supabase
    .from("user_streaks")
    .select("*")
    .eq('user_id', user.id)
    .maybeSingle();

  if (!existingStreak) {
    await supabase
      .from("user_streaks")
      .insert([{
        user_id: user.id,
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
    // Si c'est un nouveau jour, on met à jour la série normalement
    if (existingStreak.tasks_completed_today >= 3) {
      if (tasksCompletedToday >= 3) {
        newCurrentStreak += 1;
        newLongestStreak = Math.max(newCurrentStreak, existingStreak.longest_streak);
      }
    } else {
      newCurrentStreak = tasksCompletedToday >= 3 ? 1 : 0;
    }
  } else {
    // Si c'est le même jour, on vérifie si on n'a pas déjà validé la série
    const previouslyCompletedToday = existingStreak.tasks_completed_today >= 3;
    const nowCompleted = tasksCompletedToday >= 3;

    // On incrémente la série uniquement si on passe de non-complété à complété
    if (!previouslyCompletedToday && nowCompleted) {
      newCurrentStreak = existingStreak.current_streak + 1;
      newLongestStreak = Math.max(newCurrentStreak, existingStreak.longest_streak);
    }
    // Si on passe de complété à non-complété, on décrémente la série
    else if (previouslyCompletedToday && !nowCompleted) {
      newCurrentStreak = Math.max(0, existingStreak.current_streak - 1);
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
    .eq('id', existingStreak.id)
    .eq('user_id', user.id);
};