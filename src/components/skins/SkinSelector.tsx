import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

export const SkinSelector = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);

  const { data: userSkins } = useQuery({
    queryKey: ["userSkins"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_skins")
        .select(`
          *,
          skin:skins (
            id,
            title,
            preview_url,
            type
          )
        `);
      
      if (error) throw error;
      // Filter to only show character skins that have been purchased
      return data?.filter(userSkin => userSkin.skin.type === 'character') || [];
    },
  });

  const activateSkin = async (skinId: string) => {
    try {
      setIsUpdating(true);

      // Désactiver tous les skins sans condition
      const { error: deactivateError } = await supabase
        .from("user_skins")
        .update({ is_active: false })
        .not('id', 'is', null); // This ensures we update all rows

      if (deactivateError) throw deactivateError;

      // Activer le skin sélectionné
      const { error: activateError } = await supabase
        .from("user_skins")
        .update({ is_active: true })
        .eq("skin_id", skinId);

      if (activateError) throw activateError;

      // Rafraîchir les données
      await queryClient.invalidateQueries({ queryKey: ["userSkins"] });
      await queryClient.invalidateQueries({ queryKey: ["activeSkin"] });

      toast({
        title: "Skin activé !",
        description: "Votre personnage a été mis à jour.",
      });

      onClose();
    } catch (error) {
      console.error("Erreur lors de l'activation du skin:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'activer le skin.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Choisir un skin</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          {userSkins?.map((userSkin) => (
            <button
              key={userSkin.id}
              onClick={() => activateSkin(userSkin.skin.id)}
              disabled={isUpdating}
              className="relative overflow-hidden rounded-lg border bg-card hover:bg-accent transition-colors"
            >
              {userSkin.skin.preview_url && (
                <img
                  src={userSkin.skin.preview_url}
                  alt={userSkin.skin.title}
                  className="w-full aspect-square object-cover"
                />
              )}
              <div className="p-2 text-sm font-medium">{userSkin.skin.title}</div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};