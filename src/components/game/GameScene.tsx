
import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Monster {
  power: number;
  position: number;
}

export const GameScene = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [playerPosition, setPlayerPosition] = useState(50);
  const [monsters, setMonsters] = useState<Monster[]>([]);
  const animationFrameRef = useRef<number>();

  // Récupérer le niveau du joueur
  const { data: totalXP } = useQuery({
    queryKey: ["totalXP"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;

      const { data, error } = await supabase
        .from("habit_logs")
        .select("experience_gained")
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data.reduce((sum, log) => sum + log.experience_gained, 0);
    },
  });

  const level = Math.floor((totalXP || 0) / 100) + 1;
  const baseSpeed = 0.5; // Vitesse de base du personnage
  const playerSpeed = baseSpeed * (1 + (level - 1) * 0.1); // Augmente de 10% par niveau

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Ajuster la taille du canvas
    const resizeCanvas = () => {
      canvas.width = canvas.parentElement?.clientWidth || 800;
      canvas.height = 200;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Générer des monstres aléatoirement
    const spawnMonster = () => {
      if (monsters.length < 5) {
        const newMonster: Monster = {
          power: Math.ceil(level * (0.8 + Math.random() * 0.4)), // Puissance basée sur le niveau
          position: canvas.width - 50,
        };
        setMonsters(prev => [...prev, newMonster]);
      }
    };

    // Animation principale
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Dessiner le sol
      ctx.fillStyle = "#2a2a2a";
      ctx.fillRect(0, 180, canvas.width, 20);
      
      // Dessiner le personnage
      ctx.fillStyle = "#8B5CF6";
      ctx.fillRect(playerPosition, 130, 40, 50);
      
      // Dessiner et animer les monstres
      setMonsters(prevMonsters => 
        prevMonsters.map(monster => ({
          ...monster,
          position: monster.position - 1
        })).filter(monster => monster.position > -50)
      );

      monsters.forEach(monster => {
        ctx.fillStyle = `hsl(${280 + monster.power * 10}, 70%, 50%)`;
        ctx.fillRect(monster.position, 130, 40, 50);
      });

      // Avancer le personnage en fonction de son niveau
      setPlayerPosition(prev => Math.min(prev + playerSpeed, canvas.width - 100));

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // Démarrer l'animation
    animate();
    
    // Générer des monstres périodiquement
    const monsterInterval = setInterval(spawnMonster, 3000);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      clearInterval(monsterInterval);
    };
  }, [level, monsters, playerPosition, playerSpeed]);

  return (
    <Card className="p-4">
      <canvas
        ref={canvasRef}
        className="w-full rounded-lg bg-gradient-to-r from-slate-900 to-slate-800"
      />
      <div className="mt-4 text-sm text-muted-foreground">
        Niveau {level} • Vitesse: {playerSpeed.toFixed(1)}x
      </div>
    </Card>
  );
};
