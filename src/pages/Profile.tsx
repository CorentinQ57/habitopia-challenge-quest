import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { ProfileForm } from "@/components/profile/ProfileForm";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (_event === 'SIGNED_IN') {
        toast({
          title: "Connexion réussie",
          description: "Vous êtes maintenant connecté.",
        });
      } else if (_event === 'SIGNED_OUT') {
        toast({
          title: "Déconnexion",
          description: "Vous avez été déconnecté.",
        });
      } else if (_event === 'USER_UPDATED') {
        toast({
          title: "Profil mis à jour",
          description: "Vos informations ont été mises à jour.",
        });
      } else if (_event === 'PASSWORD_RECOVERY') {
        toast({
          title: "Réinitialisation du mot de passe",
          description: "Veuillez vérifier votre boîte mail.",
        });
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
    return (
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Connexion</CardTitle>
          </CardHeader>
          <CardContent>
            <Auth
              supabaseClient={supabase}
              appearance={{ 
                theme: ThemeSupa,
                style: {
                  button: {
                    borderRadius: '6px',
                    height: '40px',
                  },
                  input: {
                    borderRadius: '6px',
                    height: '40px',
                  },
                  message: {
                    borderRadius: '6px',
                    padding: '12px',
                    marginBottom: '12px',
                    backgroundColor: 'rgb(var(--destructive) / 0.1)',
                    color: 'rgb(var(--destructive))',
                    border: '1px solid rgb(var(--destructive) / 0.2)',
                  },
                },
                variables: {
                  default: {
                    colors: {
                      brand: 'rgb(var(--primary))',
                      brandAccent: 'rgb(var(--primary))',
                      messageText: 'rgb(var(--destructive))',
                      messageBackground: 'rgb(var(--destructive) / 0.1)',
                    },
                  },
                },
              }}
              localization={{
                variables: {
                  sign_in: {
                    email_label: 'Email',
                    password_label: 'Mot de passe',
                    email_input_placeholder: 'Votre email',
                    password_input_placeholder: 'Votre mot de passe',
                    button_label: 'Se connecter',
                    loading_button_label: 'Connexion en cours ...',
                    social_provider_text: 'Se connecter avec {{provider}}',
                    link_text: "Vous n'avez pas de compte ? Inscrivez-vous",
                    email_input_error: 'Email invalide',
                    password_input_error: 'Mot de passe invalide',
                    invalid_credentials_error: 'Email ou mot de passe incorrect',
                  },
                  sign_up: {
                    email_label: 'Email',
                    password_label: 'Mot de passe',
                    email_input_placeholder: 'Votre email',
                    password_input_placeholder: 'Votre mot de passe (min. 6 caractères)',
                    button_label: "S'inscrire",
                    loading_button_label: 'Inscription en cours ...',
                    social_provider_text: "S'inscrire avec {{provider}}",
                    link_text: 'Déjà un compte ? Connectez-vous',
                    confirmation_text: 'Vérifiez votre boîte mail pour confirmer votre inscription',
                    password_input_error: 'Le mot de passe doit contenir au moins 6 caractères',
                    email_input_error: 'Email invalide',
                  },
                },
              }}
              theme="light"
              providers={[]}
            />
          </CardContent>
        </Card>
      </div>
    );
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