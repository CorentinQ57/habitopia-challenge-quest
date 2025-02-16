
import { useState, useRef } from 'react';
import { Bot, Wand2 } from 'lucide-react';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from '@tanstack/react-query';
import { Card } from './ui/card';

export function AIAssistantButton() {
  const { toast } = useToast();
  const [isListening, setIsListening] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const queryClient = useQueryClient();

  const handleSuccessfulAction = () => {
    // Invalidate all relevant queries to trigger immediate updates
    queryClient.invalidateQueries({ queryKey: ["habits"] });
    queryClient.invalidateQueries({ queryKey: ["dailyNotes"] });
    queryClient.invalidateQueries({ queryKey: ["habitLogs"] });
    queryClient.invalidateQueries({ queryKey: ["userStreak"] });
    queryClient.invalidateQueries({ queryKey: ["weeklyStats"] });
    queryClient.invalidateQueries({ queryKey: ["categoryStats"] });
    queryClient.invalidateQueries({ queryKey: ["hourlyStats"] });
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

    let actionSuccessful = false;

    for (const action of actions) {
      try {
        switch (action.action) {
          case 'create_habit':
            await supabase.from('habits').insert({
              ...action.data,
              user_id: user.id
            });
            actionSuccessful = true;
            toast({
              description: `✨ Nouvelle habitude créée : ${action.data.title}`
            });
            break;

          case 'delete_habit':
            if (action.data.title === 'ALL') {
              await supabase.from('habits')
                .delete()
                .eq('user_id', user.id);
              actionSuccessful = true;
              toast({
                description: "🗑️ Toutes les habitudes ont été supprimées"
              });
            } else {
              await supabase.from('habits')
                .delete()
                .eq('title', action.data.title)
                .eq('user_id', user.id);
              actionSuccessful = true;
              toast({
                description: `🗑️ Habitude supprimée : ${action.data.title}`
              });
            }
            break;

          case 'update_note': {
            const date = action.data.date || new Date().toISOString().split('T')[0];
            const { data: existingNote } = await supabase
              .from('daily_notes')
              .select('*')
              .eq('user_id', user.id)
              .eq('date', date)
              .maybeSingle();

            if (existingNote) {
              await supabase.from('daily_notes')
                .update({ content: action.data.content })
                .eq('id', existingNote.id);
            } else {
              await supabase.from('daily_notes').insert({
                content: action.data.content,
                user_id: user.id,
                date: date
              });
            }
            actionSuccessful = true;
            toast({
              description: `📝 Note mise à jour pour le ${new Date(date).toLocaleDateString('fr-FR')}`
            });
            break;
          }
        }

        // Actualiser les données immédiatement après chaque action réussie
        if (actionSuccessful) {
          handleSuccessfulAction();
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

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      const audioChunks: BlobPart[] = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const reader = new FileReader();
        
        reader.onloadend = async () => {
          try {
            console.log("Envoi de la requête à la fonction Supabase");
            setIsGenerating(true);
            
            const { data, error } = await supabase.functions.invoke('realtime-chat', {
              body: {
                type: 'audio',
                data: reader.result
              }
            });

            if (error) {
              console.error("Erreur lors de l'appel à la fonction:", error);
              toast({
                title: "Erreur",
                description: error.message,
                variant: "destructive"
              });
              setIsGenerating(false);
              return;
            }

            console.log("Réponse reçue:", data);
            
            // Exécute les actions avant d'afficher le message de confirmation
            if (data.actions && Array.isArray(data.actions)) {
              await executeActions(data.actions);
            }

            // Affiche toujours le message de réponse
            if (data.message) {
              toast({
                description: data.message
              });
            }

            setIsGenerating(false);
            
          } catch (error) {
            console.error("Erreur lors du traitement de la réponse:", error);
            toast({
              title: "Erreur",
              description: "Impossible de traiter la réponse de l'assistant",
              variant: "destructive"
            });
            setIsGenerating(false);
          }
        };
        
        reader.readAsDataURL(audioBlob);
      };

      mediaRecorderRef.current.start();
      setIsListening(true);
      
      toast({
        description: "🎙️ Vous pouvez parler à l'assistant"
      });

    } catch (error) {
      console.error('Erreur d\'accès au microphone:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'accéder au microphone",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isListening) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsListening(false);
    }
  };

  const toggleRecording = () => {
    if (isListening) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <Card className={`mb-4 overflow-hidden transition-all duration-300 ${
      isGenerating ? 'animate-pulse' : ''
    }`}>
      <Button
        onClick={toggleRecording}
        variant="ghost"
        className={`w-full h-full px-6 py-8 relative group ${
          isListening ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' : 'hover:bg-gray-100'
        }`}
      >
        <div className="flex items-center gap-4">
          <div className="relative">
            {isGenerating ? (
              <div className="relative">
                <Wand2 className="w-6 h-6 animate-[spin_3s_linear_infinite]" />
                <div className="absolute inset-0 bg-gradient-to-r from-stella-royal to-stella-purple opacity-50 blur-sm animate-pulse"></div>
              </div>
            ) : (
              <Bot className={`w-6 h-6 transition-transform duration-300 group-hover:scale-110 ${
                isListening ? 'animate-pulse text-red-500' : ''
              }`} />
            )}
          </div>
          <div className="flex flex-col items-start">
            <span className="font-medium">
              {isGenerating ? 'Je réfléchis...' : isListening ? 'Je vous écoute...' : 'Comment je peux aider ?'}
            </span>
            <span className="text-sm text-gray-500">
              {isGenerating ? 'Merci de patienter' : isListening ? 'Cliquez pour arrêter' : 'Cliquez pour parler'}
            </span>
          </div>
        </div>
        {isGenerating && (
          <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-stella-royal to-stella-purple animate-[shimmer_2s_infinite]"></div>
        )}
      </Button>
    </Card>
  );
}
