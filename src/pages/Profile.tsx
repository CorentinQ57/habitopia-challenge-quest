import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { AuthUI } from "@/components/profile/AuthUI";
import { LogOut } from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      
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
      <div className="space-y-2">
        <h1>Mon Profil</h1>
        <p className="text-muted-foreground">
          Gérez vos informations personnelles et vos préférences
        </p>
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle>Informations du compte</CardTitle>
          <CardDescription>
            Modifiez vos informations de profil ci-dessous
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <ProfileForm
            username={username}
            email={session.user.email}
            onUsernameChange={setUsername}
            onSave={updateProfile}
            loading={loading}
          />

          <div className="pt-4 border-t border-border/50">
            <Button
              variant="outline"
              onClick={handleSignOut}
              disabled={loading}
              className="w-full text-destructive hover:text-destructive-foreground hover:bg-destructive/90"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;