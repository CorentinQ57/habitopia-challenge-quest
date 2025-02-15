
import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Monster {
  power: number;
  position: number;
  health: number;
}

export const GameScene = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [backgroundOffset, setBackgroundOffset] = useState(0);
  const [currentMonster, setCurrentMonster] = useState<Monster | null>(null);
  const [isInCombat, setIsInCombat] = useState(false);
  const [playerHealth, setPlayerHealth] = useState(100);
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
  const baseSpeed = 1; // Vitesse de base du scrolling
  const playerSpeed = baseSpeed * (1 + (level - 1) * 0.1); // Augmente de 10% par niveau
  const maxPlayerHealth = 100 + (level - 1) * 20; // Augmente de 20 PV par niveau

  // Combat avec le monstre
  const fightMonster = () => {
    if (!currentMonster || !isInCombat) return;

    // Le joueur attaque le monstre
    const playerDamage = 10 + Math.floor(level * 1.5);
    const newMonsterHealth = currentMonster.health - playerDamage;

    // Le monstre contre-attaque
    const monsterDamage = Math.max(5, Math.floor(currentMonster.power * 0.8));
    setPlayerHealth(prev => Math.max(0, prev - monsterDamage));

    if (newMonsterHealth <= 0) {
      // Monstre vaincu
      setCurrentMonster(null);
      setIsInCombat(false);
      // Régénération partielle de la vie
      setPlayerHealth(prev => Math.min(maxPlayerHealth, prev + 20));
    } else {
      setCurrentMonster(prev => prev ? { ...prev, health: newMonsterHealth } : null);
    }
  };

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

    // Générer un nouveau monstre
    const spawnMonster = () => {
      if (!currentMonster && !isInCombat) {
        const newMonster: Monster = {
          power: Math.ceil(level * (0.8 + Math.random() * 0.4)),
          position: canvas.width,
          health: 50 + level * 10,
        };
        setCurrentMonster(newMonster);
      }
    };

    // Animation principale
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Dessiner le fond qui défile
      const groundPattern = ctx.createLinearGradient(0, 180, canvas.width, 180);
      groundPattern.addColorStop(0, '#2a2a2a');
      groundPattern.addColorStop(0.5, '#3a3a3a');
      groundPattern.addColorStop(1, '#2a2a2a');
      
      // Dessiner les lignes de fond qui défilent
      ctx.fillStyle = groundPattern;
      ctx.fillRect(0, 180, canvas.width, 20);
      
      for (let i = 0; i < 5; i++) {
        const x = ((backgroundOffset + i * 200) % canvas.width) - 100;
        ctx.fillStyle = '#333';
        ctx.fillRect(x, 185, 50, 2);
      }

      // Dessiner le personnage (fixe au centre)
      const playerX = canvas.width / 3;
      ctx.fillStyle = "#8B5CF6";
      ctx.fillRect(playerX, 130, 40, 50);
      
      // Dessiner le monstre actuel
      if (currentMonster) {
        if (!isInCombat) {
          // Le monstre s'approche
          currentMonster.position -= 2;
          if (currentMonster.position <= playerX + 60) {
            setIsInCombat(true);
          }
        }
        
        ctx.fillStyle = `hsl(${280 + currentMonster.power * 10}, 70%, 50%)`;
        ctx.fillRect(currentMonster.position, 130, 40, 50);

        // Barre de vie du monstre
        const monsterHealthPercent = (currentMonster.health / (50 + level * 10)) * 100;
        ctx.fillStyle = "#ef4444";
        ctx.fillRect(currentMonster.position, 120, 40 * (monsterHealthPercent / 100), 4);
      }

      // Faire défiler le fond si pas en combat
      if (!isInCombat && !currentMonster) {
        setBackgroundOffset(prev => (prev + playerSpeed) % canvas.width);
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // Démarrer l'animation
    animate();
    
    // Générer des monstres périodiquement
    const monsterInterval = setInterval(spawnMonster, 2000);

    // Combat automatique
    const combatInterval = setInterval(() => {
      if (isInCombat && currentMonster) {
        fightMonster();
      }
    }, 1000);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      clearInterval(monsterInterval);
      clearInterval(combatInterval);
    };
  }, [level, currentMonster, isInCombat, playerSpeed]);

  return (
    <Card className="p-4">
      <div className="mb-4 flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Niveau {level}</span>
          <span className="text-sm text-muted-foreground">
            Vitesse: {playerSpeed.toFixed(1)}x
          </span>
        </div>
        <Progress value={(playerHealth / maxPlayerHealth) * 100} className="h-2" />
        <span className="text-sm text-muted-foreground">
          {playerHealth}/{maxPlayerHealth} PV
        </span>
      </div>
      <canvas
        ref={canvasRef}
        className="w-full rounded-lg bg-gradient-to-r from-slate-900 to-slate-800"
      />
    </Card>
  );
};
