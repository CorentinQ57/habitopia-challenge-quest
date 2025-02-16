
import { useToast } from './use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";

export const useAssistantActions = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSuccessfulAction = () => {
    // Invalider les requêtes de manière asynchrone
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ["habits"] }),
      queryClient.invalidateQueries({ queryKey: ["dailyNotes"] }),
      queryClient.invalidateQueries({ queryKey: ["habitLogs"] }),
      queryClient.invalidateQueries({ queryKey: ["userStreak"] }),
      queryClient.invalidateQueries({ queryKey: ["weeklyStats"] }),
      queryClient.invalidateQueries({ queryKey: ["categoryStats"] }),
      queryClient.invalidateQueries({ queryKey: ["hourlyStats"] })
    ]);
  };

  const executeActions = async (actions: any[]) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour effectuer cette action",
        variant: "destructive"
      });
      return;
    }

    for (const action of actions) {
      try {
        switch (action.action) {
          case 'create_habit': {
            const { error } = await supabase.from('habits').insert({
              ...action.data,
              user_id: user.id
            });
            if (error) throw error;
            await handleSuccessfulAction();
            toast({
              description: `✨ Nouvelle habitude créée : ${action.data.title}`
            });
            break;
          }

          case 'delete_habit': {
            if (action.data.title === 'ALL') {
              const { error } = await supabase.from('habits')
                .delete()
                .eq('user_id', user.id);
              if (error) throw error;
              await handleSuccessfulAction();
              toast({
                description: "🗑️ Toutes les habitudes ont été supprimées"
              });
            } else {
              const { error } = await supabase.from('habits')
                .delete()
                .eq('title', action.data.title)
                .eq('user_id', user.id);
              if (error) throw error;
              await handleSuccessfulAction();
              toast({
                description: `🗑️ Habitude supprimée : ${action.data.title}`
              });
            }
            break;
          }

          case 'update_note': {
            const date = action.data.date || new Date().toISOString().split('T')[0];
            const { data: existingNote } = await supabase
              .from('daily_notes')
              .select('*')
              .eq('user_id', user.id)
              .eq('date', date)
              .maybeSingle();

            if (existingNote) {
              const { error: updateError } = await supabase.from('daily_notes')
                .update({ content: action.data.content })
                .eq('id', existingNote.id);
              if (updateError) throw updateError;
            } else {
              const { error: insertError } = await supabase.from('daily_notes').insert({
                content: action.data.content,
                user_id: user.id,
                date: date
              });
              if (insertError) throw insertError;
            }
            await handleSuccessfulAction();
            toast({
              description: `📝 Note ${existingNote ? 'mise à jour' : 'créée'} pour le ${new Date(date).toLocaleDateString('fr-FR')}`
            });
            break;
          }
        }
      } catch (error) {
        console.error('Erreur lors de l\'exécution de l\'action:', error);
        toast({
          title: "Erreur",
          description: `Impossible d'exécuter l'action: ${error.message}`,
          variant: "destructive"
        });
      }
    }
  };

  return { executeActions };
};
