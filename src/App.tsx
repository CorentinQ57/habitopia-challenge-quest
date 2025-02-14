
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import Dashboard from "./pages/Dashboard";
import Habits from "./pages/Habits";
import Statistics from "./pages/Statistics";
import Character from "./pages/Character";
import Profile from "./pages/Profile";
import { useEffect, useState } from "react";
import { supabase } from "./integrations/supabase/client";

const queryClient = new QueryClient();

const App = () => {
  const [session, setSession] = useState(null);

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

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SidebarProvider>
            <div className="min-h-screen flex w-full">
              <AppSidebar />
              <main className="flex-1">
                <div className="container mx-auto p-8">
                  <SidebarTrigger className="mb-4" />
                  <Routes>
                    <Route
                      path="/"
                      element={session ? <Dashboard /> : <Navigate to="/profil" />}
                    />
                    <Route
                      path="/habitudes"
                      element={session ? <Habits /> : <Navigate to="/profil" />}
                    />
                    <Route
                      path="/statistiques"
                      element={session ? <Statistics /> : <Navigate to="/profil" />}
                    />
                    <Route
                      path="/personnage"
                      element={session ? <Character /> : <Navigate to="/profil" />}
                    />
                    <Route
                      path="/profil"
                      element={<Profile />}
                    />
                  </Routes>
                </div>
              </main>
            </div>
          </SidebarProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
