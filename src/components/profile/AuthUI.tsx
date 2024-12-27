import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authTranslations } from "./AuthTranslations";

export const AuthUI = () => {
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