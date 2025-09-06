import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { clientData } from "@/modules/clientData";

interface LoginDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onLogin: (token: string) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

export function LoginDialog({
  isOpen,
  onOpenChange,
  onLogin,
  isLoading,
  error
}: LoginDialogProps) {
  const [token, setToken] = useState("");
  const authUrl = `https://anilist.co/api/v2/oauth/authorize?client_id=${clientData.clientId}&redirect_uri=${clientData.redirectUri}&response_type=code`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (token.trim()) {
      const success = await onLogin(token);
      if (success) {
        setToken("");
        onOpenChange(false);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Login to AniList</DialogTitle>
          <DialogDescription>
            Connect your AniList account to sync your watchlist and track your progress.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <Input
            placeholder="Paste your token here..."
            value={token}
            onChange={(e) => setToken(e.target.value)}
            disabled={isLoading}
            aria-label="AniList Token"
          />
          {error && (
            <p className="text-sm text-red-500" role="alert">{error}</p>
          )}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => window.open(authUrl, '_blank')}
              disabled={isLoading}
            >
              Get Token
            </Button>
            <Button 
              type="submit"
              disabled={isLoading || !token.trim()}
              className="flex-1"
            >
              {isLoading ? "Logging in..." : "Submit"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}