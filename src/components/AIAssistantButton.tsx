
import { useState, useRef } from 'react';
import { Bot, Wand2 } from 'lucide-react';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from '@tanstack/react-query';

export function AIAssistantButton() {
  const { toast } = useToast();
  const [isListening, setIsListening] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const queryClient = useQueryClient();

  const handleSuccessfulAction = () => {
    // Actualiser toutes les requêtes pertinentes
    queryClient.invalidateQueries({ queryKey: ["habits"] });
    queryClient.invalidateQueries({ queryKey: ["dailyNotes"] });
    queryClient.invalidateQueries({ queryKey: ["habitLogs"] });
    queryClient.invalidateQueries({ queryKey: ["userStreak"] });
    queryClient.invalidateQueries({ queryKey: ["weeklyStats"] });
    queryClient.invalidateQueries({ queryKey: ["categoryStats"] });
    queryClient.invalidateQueries({ queryKey: ["hourlyStats"] });
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

            setIsGenerating(false);

            if (error) {
              console.error("Erreur lors de l'appel à la fonction:", error);
              toast({
                title: "Erreur",
                description: error.message,
                variant: "destructive"
              });
              return;
            }

            console.log("Réponse reçue:", data);
            
            if (data.type === 'assistant_message') {
              toast({
                description: data.content
              });
              
              // Actualiser les données après une action réussie
              handleSuccessfulAction();
            }
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
        title: "Assistant prêt",
        description: "Vous pouvez parler à l'assistant"
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
    <Button
      onClick={toggleRecording}
      variant="ghost"
      className={`w-full justify-start gap-3 px-4 py-6 relative overflow-hidden ${
        isListening ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' : ''
      }`}
    >
      <div className="relative">
        {isGenerating ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Wand2 className="w-5 h-5 animate-pulse" />
          </div>
        ) : (
          <Bot className={`w-5 h-5 ${isListening ? 'animate-pulse text-red-500' : ''}`} />
        )}
      </div>
      <span className={`${isListening ? 'text-red-500' : ''}`}>
        {isGenerating ? 'En cours de génération...' : isListening ? 'En écoute...' : 'Assistant IA'}
      </span>
      {isGenerating && (
        <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-primary to-stella-purple animate-pulse w-full" />
      )}
    </Button>
  );
}
