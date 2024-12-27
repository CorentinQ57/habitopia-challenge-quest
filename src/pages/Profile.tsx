import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload } from "lucide-react";

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
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const { data: profile, refetch: refetchProfile } = useQuery({
    queryKey: ["profile", session?.user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session?.user?.id)
        .single();

      if (error) throw error;
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
    } finally {
      setLoading(false);
    }
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setLoading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      const fileExt = file.name.split(".").pop();
      const filePath = `${session?.user?.id}/${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
      toast({
        title: "Avatar téléchargé",
        description: "Votre avatar a été mis à jour avec succès.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de télécharger l'avatar.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
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
              appearance={{ theme: ThemeSupa }}
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
          <div className="flex flex-col items-center gap-4">
            <Avatar className="w-24 h-24">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback>
                {username?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept="image/*"
                onChange={uploadAvatar}
                className="hidden"
                id="avatar-upload"
                disabled={loading}
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById("avatar-upload")?.click()}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                Changer l'avatar
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={session.user.email}
                disabled
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">
                Nom d'utilisateur
              </label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Entrez votre nom d'utilisateur"
              />
            </div>

            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={handleSignOut}
                disabled={loading}
              >
                Déconnexion
              </Button>
              <Button
                onClick={updateProfile}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Enregistrer
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;