
import { Bot, Wand2 } from 'lucide-react';

interface AssistantIconProps {
  isGenerating: boolean;
  isListening: boolean;
}

export function AssistantIcon({ isGenerating, isListening }: AssistantIconProps) {
  if (isGenerating) {
    return (
      <div className="relative">
        <Wand2 className="w-6 h-6 animate-[spin_3s_linear_infinite]" />
        <div className="absolute inset-0 bg-gradient-to-r from-stella-royal to-stella-purple opacity-50 blur-sm animate-pulse"></div>
      </div>
    );
  }

  return (
    <Bot
      className={`w-6 h-6 transition-transform duration-300 group-hover:scale-110 ${
        isListening ? 'animate-pulse text-red-500' : ''
      }`}
    />
  );
}
