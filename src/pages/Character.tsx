
import { CharacterCard } from "@/components/CharacterCard";
import { SkinShop } from "@/components/skins/SkinShop";
import { GameScene } from "@/components/game/GameScene";

const Character = () => {
  return (
    <div className="space-y-8">
      <h1>Mon Personnage</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          <CharacterCard />
          <GameScene />
        </div>
        <SkinShop />
      </div>
    </div>
  );
};

export default Character;
