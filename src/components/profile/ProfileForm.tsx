import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface ProfileFormProps {
  username: string;
  email: string;
  onUsernameChange: (username: string) => void;
  onSave: () => Promise<void>;
  loading: boolean;
}

export const ProfileForm = ({ 
  username, 
  email, 
  onUsernameChange, 
  onSave, 
  loading 
}: ProfileFormProps) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-muted-foreground">
          Email
        </label>
        <Input
          id="email"
          type="email"
          value={email}
          disabled
          className="bg-muted/50"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="username" className="text-sm font-medium text-muted-foreground">
          Nom d'utilisateur
        </label>
        <Input
          id="username"
          value={username}
          onChange={(e) => onUsernameChange(e.target.value)}
          placeholder="Entrez votre nom d'utilisateur"
          className="border-primary/20 focus-visible:ring-primary"
        />
      </div>

      <Button
        onClick={onSave}
        disabled={loading}
        className="w-full bg-primary hover:bg-primary/90"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
        Enregistrer les modifications
      </Button>
    </div>
  );
};