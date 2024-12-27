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
    <div className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <Input
          id="email"
          type="email"
          value={email}
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
          onChange={(e) => onUsernameChange(e.target.value)}
          placeholder="Entrez votre nom d'utilisateur"
        />
      </div>

      <Button
        onClick={onSave}
        disabled={loading}
        className="w-full"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
        Enregistrer
      </Button>
    </div>
  );
};