import { Button } from "@/components/ui/button";
import { LogIn, LogOut, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function LoginButton() {
  const { user, isAuthenticated, isLoading } = useAuth();

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  if (isLoading) {
    return (
      <Button disabled variant="outline" size="sm" className="h-9">
        <User className="mr-2 h-4 w-4" />
        Loading...
      </Button>
    );
  }

  if (isAuthenticated) {
    return (
      <Button onClick={handleLogout} variant="ghost" size="sm" className="h-9">
        <LogOut className="mr-2 h-4 w-4" />
        Logout
      </Button>
    );
  }

  return (
    <Button onClick={handleLogin} variant="default" size="sm" className="h-9">
      <LogIn className="mr-2 h-4 w-4" />
      Login with Replit
    </Button>
  );
}