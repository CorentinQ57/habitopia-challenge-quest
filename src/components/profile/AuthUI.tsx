
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authTranslations } from "./AuthTranslations";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export const AuthUI = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<'sign_in' | 'update_password'>('sign_in');

  useEffect(() => {
    // Vérifie le type d'action dans l'URL
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const type = hashParams.get('type');

    if (type === 'recovery' && accessToken) {
      setView('update_password');
      // Met à jour la session avec le token de récupération
      supabase.auth.getSession().then(async ({ data: { session } }) => {
        if (!session) {
          // Si pas de session, on utilise le token pour en créer une
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: '',
          });
        }
      });
    }

    // Vérifie si l'utilisateur est déjà connecté au chargement
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && view === 'sign_in') {
        navigate('/');
      }
    });

    // Écoute les changements d'état d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' && view === 'sign_in') {
        navigate('/');
      } else if (event === 'USER_UPDATED' && view === 'update_password') {
        // L'utilisateur a mis à jour son mot de passe avec succès
        navigate('/profil');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, view]);

  return (
    <div className="relative max-w-2xl mx-auto w-full px-4">
      <div className="animated-background absolute inset-0 opacity-30" />
      <Card className="relative bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl">
            {view === 'update_password' ? 'Changer votre mot de passe' : 'Connexion'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Auth
            supabaseClient={supabase}
            view={view}
            appearance={{ 
              theme: ThemeSupa,
              style: {
                button: {
                  borderRadius: '8px',
                  height: '44px',
                  background: 'linear-gradient(135deg, #a8c0ff, #3f2b96)',
                  transform: 'translateY(0)',
                  transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  boxShadow: '0 4px 0 rgb(63 43 150 / 0.5)',
                },
                input: {
                  borderRadius: '8px',
                  height: '44px',
                },
                message: {
                  borderRadius: '8px',
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
                    brand: '#3f2b96',
                    brandAccent: '#a8c0ff',
                    messageText: 'rgb(var(--destructive))',
                    messageBackground: 'rgb(var(--destructive) / 0.1)',
                  },
                },
              },
            }}
            localization={{
              variables: authTranslations
            }}
            theme="light"
            providers={[]}
          />
        </CardContent>
      </Card>
    </div>
  );
};
