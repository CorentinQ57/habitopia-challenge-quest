
import { useState, useRef } from 'react';
import { useToast } from './use-toast';
import { supabase } from "@/integrations/supabase/client";

export const useVoiceRecording = (onResponse: (data: any) => Promise<void>) => {
  const { toast } = useToast();
  const [isListening, setIsListening] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);

  const startRecording = async () => {
    try {
      // Nettoyage des chunks précédents
      audioChunksRef.current = [];
      
      // Arrêter l'enregistrement précédent s'il existe
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        try {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
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
              
              // S'assurer que onResponse est appelé avec les données
              if (data) {
                await onResponse(data);
              }

            } catch (error) {
              console.error("Erreur lors du traitement de la réponse:", error);
              toast({
                title: "Erreur",
                description: "Impossible de traiter la réponse de l'assistant",
                variant: "destructive"
              });
            } finally {
              setIsGenerating(false);
            }
          };
          
          reader.readAsDataURL(audioBlob);
          
        } catch (error) {
          console.error("Erreur lors du traitement de l'audio:", error);
          setIsGenerating(false);
        }
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
      setIsListening(false);
      setIsGenerating(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        setIsListening(false);
        toast({
          description: "🎤 Enregistrement terminé, traitement en cours..."
        });
      } catch (error) {
        console.error('Erreur lors de l\'arrêt de l\'enregistrement:', error);
        setIsListening(false);
        setIsGenerating(false);
      }
    }
  };

  return {
    isListening,
    isGenerating,
    startRecording,
    stopRecording
  };
};
