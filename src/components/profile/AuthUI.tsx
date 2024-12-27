import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authTranslations } from "./AuthTranslations";

export const AuthUI = () => {
  return (
    <div className="relative max-w-md mx-auto">
      <div className="animated-background absolute inset-0 opacity-30" />
      <Card className="relative bg-white/80 backdrop-blur-sm">
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
                  borderRadius: '8px',
                  height: '44px',
                  background: 'linear-gradient(135deg, #a8c0ff, #3f2b96)',
                  transform: 'translateY(0)',
                  transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  boxShadow: '0 4px 0 rgb(63 43 150 / 0.5)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 0 rgb(63 43 150 / 0.5)',
                  },
                  '&:active': {
                    transform: 'translateY(2px)',
                    boxShadow: '0 2px 0 rgb(63 43 150 / 0.5)',
                  },
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