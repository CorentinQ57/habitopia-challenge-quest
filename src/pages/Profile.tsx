
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { AuthUI } from "@/components/profile/AuthUI";
import { LogOut, KeyRound, Mail, User } from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [showResetPassword, setShowResetPassword] = useState(false);

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
          description: "Un email de réinitialisation vous a été envoyé."
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

  const handleResetPassword = async () => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(session.user.email, {
        redirectTo: `${window.location.origin}/profil`,
      });

      if (error) throw error;

      toast({
        title: "Email envoyé",
        description: "Vérifiez votre boîte mail pour réinitialiser votre mot de passe.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer l'email de réinitialisation.",
        variant: "destructive",
      });
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
      navigate("/profil");
    }
  };

  if (!session) {
    return <AuthUI />;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Mon Profil</h1>
        <p className="text-muted-foreground">
          Gérez vos informations personnelles et vos préférences
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations du compte</CardTitle>
          <CardDescription>
            Modifiez vos informations de profil ci-dessous
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={session.user.email}
                disabled
                className="bg-muted/50"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <User className="w-4 h-4" />
                Nom d'utilisateur
              </label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Entrez votre nom d'utilisateur"
                className="border-primary/20 focus-visible:ring-primary"
              />
            </div>

            <Button
              onClick={updateProfile}
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90"
            >
              {loading ? "Enregistrement..." : "Enregistrer les modifications"}
            </Button>
          </div>

          <div className="pt-4 space-y-4 border-t border-border/50">
            <Button
              variant="outline"
              onClick={handleResetPassword}
              className="w-full"
            >
              <KeyRound className="w-4 h-4 mr-2" />
              Changer mon mot de passe
            </Button>

            <Button
              variant="outline"
              onClick={handleSignOut}
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
