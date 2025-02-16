
import { useState, useRef } from 'react';
import { Bot } from 'lucide-react';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";

export function AIAssistantButton() {
  const { toast } = useToast();
  const [isListening, setIsListening] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

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
              return;
            }

            console.log("Réponse reçue:", data);
            
            if (data.type === 'assistant_message') {
              toast({
                description: data.content
              });
            }
          } catch (error) {
            console.error("Erreur lors du traitement de la réponse:", error);
            toast({
              title: "Erreur",
              description: "Impossible de traiter la réponse de l'assistant",
              variant: "destructive"
            });
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
      size="icon"
      className={`fixed bottom-8 right-8 rounded-full w-12 h-12 shadow-lg transition-colors ${
        isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary/90'
      }`}
      aria-label="Assistant IA"
    >
      <Bot className={`w-6 h-6 ${isListening ? 'animate-pulse' : ''}`} />
    </Button>
  );
}
