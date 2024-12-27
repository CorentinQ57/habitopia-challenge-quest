import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export const ThemeSelector = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: userSkins } = useQuery({
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
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
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
          skin:skins (
            id,
            title,
            type,
            theme_colors
          )
        `)
        .eq("skin.type", "theme");
      
      if (error) throw error;
      return data?.filter(item => item.skin) || [];
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

  const activeTheme = userSkins?.skin_id;

  const defaultTheme = {
    id: "default",
    title: "Thème par défaut",
    theme_colors: {
      primary: "hsl(var(--primary))",
      secondary: "hsl(var(--secondary))",
      accent: "hsl(var(--accent))",
    },
  };

  const handleThemeChange = (value: string) => {
    updateThemeMutation.mutate(value);
  };

  const availableThemes = [
    defaultTheme,
    ...(purchasedThemes?.map(({ skin }) => skin).filter(Boolean) || []),
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Thème actif</h3>
      
      <RadioGroup
        value={activeTheme || "default"}
        onValueChange={handleThemeChange}
        className="grid grid-cols-2 gap-4"
      >
        {availableThemes.map((theme) => {
          const colors = theme.theme_colors as { primary: string; secondary: string; accent: string };
          
          return (
            <div key={theme.id} className="relative">
              <RadioGroupItem
                value={theme.id}
                id={theme.id}
                className="peer sr-only"
              />
              <Label
                htmlFor={theme.id}
                className="flex flex-col gap-2 rounded-lg border-2 border-muted p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{theme.title}</span>
                  <Check className="h-4 w-4 opacity-0 peer-data-[state=checked]:opacity-100" />
                </div>
                
                <div className="flex gap-2">
                  {Object.values(colors).map((color, index) => (
                    <div
                      key={index}
                      className="h-6 w-6 rounded-full"
                      style={{ backgroundColor: color }}
                    />
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