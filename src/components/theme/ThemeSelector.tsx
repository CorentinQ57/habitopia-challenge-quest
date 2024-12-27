import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { Json } from "@/integrations/supabase/types";

interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
}

interface Theme {
  id: string;
  title: string;
  type: string;
  theme_colors: ThemeColors;
}

interface UserSkin {
  id: string;
  skin_id: string;
  is_active: boolean;
  skin: Theme;
}

interface RawUserSkin {
  id: string;
  skin_id: string;
  is_active: boolean;
  skin: {
    id: string;
    title: string;
    type: string;
    theme_colors: Json;
  };
}

export const ThemeSelector = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: activeTheme } = useQuery({
    queryKey: ["activeTheme"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_skins")
        .select(`
          id,
          is_active,
          skin_id,
          skin:skins (
            id,
            title,
            type,
            theme_colors
          )
        `)
        .eq("is_active", true)
        .eq("skin.type", "theme")
        .maybeSingle();
      
      if (error) throw error;
      
      if (!data) return null;
      
      // Convert the raw data to our expected type
      const rawSkin = data as RawUserSkin;
      const themeColors = rawSkin.skin.theme_colors as ThemeColors;
      
      return {
        ...rawSkin,
        skin: {
          ...rawSkin.skin,
          theme_colors: themeColors
        }
      } as UserSkin;
    },
  });

  const { data: purchasedThemes } = useQuery({
    queryKey: ["purchasedThemes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_skins")
        .select(`
          id,
          skin_id,
          is_active,
          skin:skins (
            id,
            title,
            type,
            theme_colors
          )
        `)
        .eq("skin.type", "theme");
      
      if (error) throw error;
      
      // Convert the raw data to our expected type
      return (data?.filter(item => item.skin) || []).map(rawSkin => ({
        ...rawSkin,
        skin: {
          ...rawSkin.skin,
          theme_colors: rawSkin.skin.theme_colors as ThemeColors
        }
      })) as UserSkin[];
    },
  });

  const updateThemeMutation = useMutation({
    mutationFn: async (skinId: string) => {
      // First, deactivate all themes
      const { error: deactivateError } = await supabase
        .from("user_skins")
        .update({ is_active: false })
        .eq("skin.type", "theme");

      if (deactivateError) throw deactivateError;

      // Then activate the selected theme
      const { error: activateError } = await supabase
        .from("user_skins")
        .update({ is_active: true })
        .eq("skin_id", skinId);

      if (activateError) throw activateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activeTheme"] });
      toast({
        title: "Thème appliqué",
        description: "Le thème a été changé avec succès.",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de changer le thème.",
        variant: "destructive",
      });
    },
  });

  const defaultTheme: Theme = {
    id: "default",
    title: "Thème par défaut",
    type: "theme",
    theme_colors: {
      primary: "hsl(var(--primary))",
      secondary: "hsl(var(--secondary))",
      accent: "hsl(var(--accent))",
      background: "linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%)"
    },
  };

  useEffect(() => {
    const theme = activeTheme?.skin?.theme_colors;
    if (theme) {
      document.documentElement.style.setProperty('--theme-primary', theme.primary);
      document.documentElement.style.setProperty('--theme-secondary', theme.secondary);
      document.documentElement.style.setProperty('--theme-accent', theme.accent);
      document.body.dataset.themeBackground = theme.background;
      document.body.style.backgroundImage = theme.background;
    } else {
      // Reset to default theme
      const defaultColors = defaultTheme.theme_colors;
      document.documentElement.style.setProperty('--theme-primary', defaultColors.primary);
      document.documentElement.style.setProperty('--theme-secondary', defaultColors.secondary);
      document.documentElement.style.setProperty('--theme-accent', defaultColors.accent);
      document.body.style.backgroundImage = defaultColors.background;
      delete document.body.dataset.themeBackground;
    }
  }, [activeTheme]);

  const handleThemeChange = (value: string) => {
    updateThemeMutation.mutate(value);
  };

  const availableThemes = [
    defaultTheme,
    ...(purchasedThemes?.map(({ skin }) => skin) || []),
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Thème actif</h3>
      
      <RadioGroup
        value={activeTheme?.skin_id || "default"}
        onValueChange={handleThemeChange}
        className="grid grid-cols-2 gap-4"
      >
        {availableThemes.map((theme) => {
          const colors = theme.theme_colors;
          
          return (
            <div key={theme.id} className="relative">
              <RadioGroupItem
                value={theme.id}
                id={theme.id}
                className="peer sr-only"
              />
              <Label
                htmlFor={theme.id}
                className="flex flex-col gap-2 rounded-lg border-2 border-muted p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all duration-300 card-themed"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{theme.title}</span>
                  <Check className="w-4 h-4 opacity-0 peer-data-[state=checked]:opacity-100 transition-opacity" />
                </div>
                
                <div className="flex gap-2">
                  {Object.entries(colors).map(([key, color]) => (
                    key !== 'background' && (
                      <div
                        key={key}
                        className="h-6 w-6 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                    )
                  ))}
                </div>
              </Label>
            </div>
          );
        })}
      </RadioGroup>
    </div>
  );
};