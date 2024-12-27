import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { AuthUI } from "@/components/profile/AuthUI";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      
      // Handle different auth events
      const events = {
        'SIGNED_IN': {
          title: "Connexion réussie",
          description: "Vous êtes maintenant connecté."
        },
        'SIGNED_OUT': {
          title: "Déconnexion",
          description: "Vous avez été déconnecté."
        },
        'USER_UPDATED': {
          title: "Profil mis à jour",
          description: "Vos informations ont été mises à jour."
        },
        'PASSWORD_RECOVERY': {
          title: "Réinitialisation du mot de passe",
          description: "Veuillez vérifier votre boîte mail."
        }
      };

      const event = events[_event];
      if (event) {
        toast(event);
      }
    });

    return () => subscription.unsubscribe();
  }, [toast]);

  const { refetch: refetchProfile } = useQuery({
    queryKey: ["profile", session?.user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session?.user?.id)
        .single();

      if (error) {
        toast({
          title: "Erreur",
          description: "Impossible de charger votre profil.",
          variant: "destructive",
        });
        throw error;
      }
      
      setUsername(data.username || "");
      setAvatarUrl(data.avatar_url || "");
      return data;
    },
    enabled: !!session?.user?.id,
  });

  const updateProfile = async () => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from("profiles")
        .update({
          username,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", session?.user?.id);

      if (error) throw error;
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été enregistrées avec succès.",
      });
      refetchProfile();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le profil.",
        variant: "destructive",
      });
      console.error("Erreur lors de la mise à jour du profil:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de vous déconnecter.",
        variant: "destructive",
      });
      console.error("Erreur lors de la déconnexion:", error);
    } else {
      navigate("/");
    }
  };

  if (!session) {
    return <AuthUI />;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Mon Profil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <ProfileAvatar
            username={username}
            avatarUrl={avatarUrl}
            onAvatarChange={setAvatarUrl}
          />

          <ProfileForm
            username={username}
            email={session.user.email}
            onUsernameChange={setUsername}
            onSave={updateProfile}
            loading={loading}
          />

          <div className="pt-4">
            <Button
              variant="outline"
              onClick={handleSignOut}
              disabled={loading}
              className="w-full"
            >
              Déconnexion
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;