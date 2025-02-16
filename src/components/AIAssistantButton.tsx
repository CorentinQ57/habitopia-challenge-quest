
import { useState, useRef, useEffect } from 'react';
import { Bot } from 'lucide-react';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';

const WS_URL = 'wss://haodastqykbgflafrlfn.functions.supabase.co/realtime-chat';

export function AIAssistantButton() {
  const { toast } = useToast();
  const [isListening, setIsListening] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  useEffect(() => {
    return () => {
      wsRef.current?.close();
      stopRecording();
    };
  }, []);

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
        
        reader.onloadend = () => {
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
              type: 'audio',
              data: reader.result
            }));
          }
        };
        
        reader.readAsDataURL(audioBlob);
      };

      mediaRecorderRef.current.start();
      setIsListening(true);
      
      wsRef.current = new WebSocket(WS_URL);
      
      wsRef.current.onopen = () => {
        setIsConnected(true);
        toast({
          title: "Assistant connecté",
          description: "Vous pouvez parler à l'assistant"
        });
      };
      
      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'assistant_message') {
          toast({
            description: data.content
          });
        } else if (data.type === 'error') {
          toast({
            title: "Erreur",
            description: data.content,
            variant: "destructive"
          });
        }
      };
      
      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        toast({
          title: "Erreur de connexion",
          description: "Impossible de se connecter à l'assistant",
          variant: "destructive"
        });
      };

    } catch (error) {
      console.error('Error accessing microphone:', error);
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
    wsRef.current?.close();
    setIsConnected(false);
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
