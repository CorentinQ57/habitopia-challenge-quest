
import { useState, useRef } from 'react';
import { useToast } from './use-toast';
import { supabase } from "@/integrations/supabase/client";

export const useVoiceRecording = (onResponse: (data: any) => Promise<void>) => {
  const { toast } = useToast();
  const [isListening, setIsListening] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
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
            
            await onResponse(data);

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

  return {
    isListening,
    isGenerating,
    startRecording,
    stopRecording
  };
};
