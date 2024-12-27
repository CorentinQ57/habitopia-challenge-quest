import { Gem, ShoppingBag } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { RewardCard } from "./rewards/RewardCard";
import { useRewards } from "./rewards/use-rewards";

export const RewardShop = () => {
  const { rewards, totalXP, purchaseReward } = useRewards();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          className="group relative overflow-hidden shadow-lg transition-all duration-300 animate-bounce-scale border-b-4 border-[#3f2b96]/20 active:border-b-0 active:translate-y-1 w-full"
          size="lg"
          style={{
            background: 'linear-gradient(135deg, #a8c0ff, #3f2b96)',
            boxShadow: '0 4px 15px rgba(63, 43, 150, 0.3)'
          }}
        >
          <div className="absolute inset-0 bg-white/20 group-hover:bg-white/30 transition-colors" />
          <span className="relative flex items-center gap-2 text-stella-white">
            <ShoppingBag className="w-5 h-5" />
            Boutique
            <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full text-sm">
              <Gem className="w-4 h-4" />
              <span>{totalXP || 0}</span>
            </div>
          </span>
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto bg-gradient-to-br from-background/95 to-background/98 backdrop-blur-sm border-l-2 border-primary/20">
        <SheetHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-3 text-2xl">
              <ShoppingBag className="w-6 h-6 text-primary" />
              Boutique de Récompenses
            </SheetTitle>
            <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
              <Gem className="w-5 h-5 text-primary" />
              <span className="font-semibold">{totalXP || 0} XP</span>
            </div>
          </div>
        </SheetHeader>

        <div className="mt-8 space-y-4">
          {rewards?.map((reward) => (
            <RewardCard
              key={reward.id}
              reward={reward}
              totalXP={totalXP}
              onPurchase={purchaseReward}
            />
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
};