import { Snowflake } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FreezeButtonProps {
  freezeTokens: number;
  onUseFreeze: () => void;
}

export const FreezeButton = ({ freezeTokens, onUseFreeze }: FreezeButtonProps) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onClick={onUseFreeze}
          disabled={freezeTokens <= 0}
        >
          <Snowflake className="w-5 h-5 text-blue-500" />
          {freezeTokens > 0 && (
            <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {freezeTokens}
            </span>
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Geler votre série ({freezeTokens} disponible{freezeTokens !== 1 ? 's' : ''})</p>
      </TooltipContent>
    </Tooltip>
  );
};