
import { useToast } from '@/hooks/use-toast';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { AssistantIcon } from './ui/assistant-icon';
import { useVoiceRecording } from '@/hooks/use-voice-recording';
import { useAssistantActions } from '@/hooks/use-assistant-actions';

export function AIAssistantButton() {
  const { toast } = useToast();
  const { executeActions } = useAssistantActions();
  
  const handleAssistantResponse = async (data: any) => {
    try {
      if (data.actions && Array.isArray(data.actions)) {
        await executeActions(data.actions);
      }

      if (data.message) {
        toast({
          description: data.message
        });
      }
    } catch (error) {
      console.error('Erreur lors du traitement de la réponse:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du traitement de la réponse",
        variant: "destructive"
      });
    }
  };

  const {
    isListening,
    isGenerating,
    startRecording,
    stopRecording
  } = useVoiceRecording(handleAssistantResponse);

  const handleClick = async () => {
    try {
      if (isListening) {
        await stopRecording();
      } else {
        await startRecording();
      }
    } catch (error) {
      console.error('Erreur lors de la gestion du microphone:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue avec le microphone",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className={`mb-4 overflow-hidden transition-all duration-300 ${
      isGenerating ? 'animate-pulse' : ''
    }`}>
      <Button
        onClick={handleClick}
        variant="ghost"
        className={`w-full h-full px-6 py-8 relative group ${
          isListening ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' : 'hover:bg-gray-100'
        }`}
      >
        <div className="flex items-center gap-4">
          <div className="relative">
            <AssistantIcon isGenerating={isGenerating} isListening={isListening} />
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
