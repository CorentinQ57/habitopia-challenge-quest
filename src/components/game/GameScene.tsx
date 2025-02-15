
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

interface Cloud {
  x: number;
  y: number;
  width: number;
  speed: number;
}

export const GameScene = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [backgroundOffset, setBackgroundOffset] = useState(0);
  const [currentMonster, setCurrentMonster] = useState<Monster | null>(null);
  const [isInCombat, setIsInCombat] = useState(false);
  const [playerHealth, setPlayerHealth] = useState(100);
  const [monstersDefeated, setMonstersDefeated] = useState(0);
  const [clouds, setClouds] = useState<Cloud[]>([]);
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
  const baseSpeed = 1;
  const playerSpeed = baseSpeed * (1 + (level - 1) * 0.1);
  const maxPlayerHealth = 100 + (level - 1) * 20;
  const playerBaseDamage = 20; // Dommages de base fixes
  const playerDamage = playerBaseDamage + (level - 1) * 10; // Augmente de 10 par niveau

  // Réinitialiser le jeu
  const resetGame = () => {
    setPlayerHealth(maxPlayerHealth);
    setCurrentMonster(null);
    setIsInCombat(false);
    setMonstersDefeated(0);
  };

  // Générer un nouveau nuage
  const createCloud = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const newCloud: Cloud = {
      x: canvas.width,
      y: Math.random() * 100, // Position verticale aléatoire dans le ciel
      width: 30 + Math.random() * 50, // Largeur aléatoire entre 30 et 80
      speed: 0.5 + Math.random() * 0.5, // Vitesse aléatoire
    };
    setClouds(prev => [...prev, newCloud]);
  };

  // Combat avec le monstre
  const fightMonster = () => {
    if (!currentMonster || !isInCombat) return;

    // Le joueur inflige des dégâts fixes basés sur son niveau
    const newMonsterHealth = currentMonster.health - playerDamage;

    // Le monstre inflige des dégâts basés sur sa puissance
    const monsterDamage = Math.floor(currentMonster.power * 0.8);
    const newPlayerHealth = Math.max(0, playerHealth - monsterDamage);
    setPlayerHealth(newPlayerHealth);

    if (newPlayerHealth <= 0) {
      // Mort du joueur
      resetGame();
      return;
    }

    if (newMonsterHealth <= 0) {
      // Monstre vaincu
      setCurrentMonster(null);
      setIsInCombat(false);
      setMonstersDefeated(prev => prev + 1);
    } else {
      setCurrentMonster(prev => prev ? { ...prev, health: newMonsterHealth } : null);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = canvas.parentElement?.clientWidth || 800;
      canvas.height = 200;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Générer un nouveau monstre
    const spawnMonster = () => {
      if (!currentMonster && !isInCombat) {
        const monsterLevel = monstersDefeated + 1;
        
        // Ne génère le monstre que si le joueur a le niveau requis
        if (level >= monsterLevel) {
          const newMonster: Monster = {
            power: 20 + (monsterLevel - 1) * 15, // Puissance basée sur le niveau du monstre
            position: canvas.width,
            health: 100 + (monsterLevel - 1) * 50, // Points de vie basés sur le niveau du monstre
          };
          setCurrentMonster(newMonster);
        }
      }
    };

    // Dessiner un nuage
    const drawCloud = (cloud: Cloud) => {
      ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
      ctx.beginPath();
      ctx.arc(cloud.x, cloud.y, cloud.width * 0.3, 0, Math.PI * 2);
      ctx.arc(cloud.x + cloud.width * 0.2, cloud.y - cloud.width * 0.1, cloud.width * 0.25, 0, Math.PI * 2);
      ctx.arc(cloud.x + cloud.width * 0.4, cloud.y, cloud.width * 0.35, 0, Math.PI * 2);
      ctx.fill();
    };

    // Animation principale
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Animer les nuages
      setClouds(prevClouds => {
        const updatedClouds = prevClouds
          .map(cloud => ({
            ...cloud,
            x: cloud.x - cloud.speed - (playerSpeed * 0.5),
          }))
          .filter(cloud => cloud.x + cloud.width > 0);
        
        prevClouds.forEach(cloud => drawCloud(cloud));
        return updatedClouds;
      });
      
      // Dessiner le fond qui défile
      const groundPattern = ctx.createLinearGradient(0, 180, canvas.width, 180);
      groundPattern.addColorStop(0, '#2a2a2a');
      groundPattern.addColorStop(0.5, '#3a3a3a');
      groundPattern.addColorStop(1, '#2a2a2a');
      
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
          currentMonster.position -= 2;
          if (currentMonster.position <= playerX + 60) {
            setIsInCombat(true);
          }
        }
        
        // La couleur du monstre reflète son niveau plutôt que sa puissance
        const monsterLevel = monstersDefeated + 1;
        ctx.fillStyle = `hsl(${280 + monsterLevel * 20}, 70%, 50%)`;
        ctx.fillRect(currentMonster.position, 130, 40, 50);

        // Barre de vie du monstre
        const monsterMaxHealth = 100 + (monsterLevel - 1) * 50;
        const monsterHealthPercent = (currentMonster.health / monsterMaxHealth) * 100;
        ctx.fillStyle = "#ef4444";
        ctx.fillRect(currentMonster.position, 120, 40 * (monsterHealthPercent / 100), 4);
      }

      if (!isInCombat && !currentMonster) {
        setBackgroundOffset(prev => (prev + playerSpeed) % canvas.width);
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();
    
    const monsterInterval = setInterval(spawnMonster, 2000);
    const cloudInterval = setInterval(createCloud, 3000);
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
      clearInterval(cloudInterval);
      clearInterval(combatInterval);
    };
  }, [level, currentMonster, isInCombat, playerSpeed, monstersDefeated, playerHealth]);

  const monsterLevel = monstersDefeated + 1;
  const canFightNextMonster = level >= monsterLevel;

  return (
    <Card className="p-4">
      <div className="mb-4 flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Niveau {level}</span>
          <span className="text-sm text-muted-foreground">
            Dégâts: {playerDamage}
          </span>
        </div>
        <Progress value={(playerHealth / maxPlayerHealth) * 100} className="h-2" />
        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <span>{playerHealth}/{maxPlayerHealth} PV</span>
          <span>
            {canFightNextMonster 
              ? `Monstres vaincus: ${monstersDefeated}`
              : `Niveau ${monsterLevel} requis pour le prochain monstre`
            }
          </span>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        className="w-full rounded-lg bg-gradient-to-r from-slate-900 to-slate-800"
      />
    </Card>
  );
};
