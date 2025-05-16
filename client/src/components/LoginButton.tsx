
import { Button } from "@/components/ui/button";
import { LogIn, LogOut, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function LoginButton() {
  const { user, isAuthenticated, isLoading } = useAuth();

  const handleLogin = () => {
    const h = 500;
    const w = 350;
    const left = window.screen.width / 2 - w / 2;
    const top = window.screen.height / 2 - h / 2;

    const authWindow = window.open(
      "https://replit.com/auth_with_repl_site?domain=" + window.location.host,
      "_blank",
      `modal=yes,toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=no,resizable=no,copyhistory=no,width=${w},height=${h},top=${top},left=${left}`
    );

    window.addEventListener("message", function authComplete(e) {
      if (e.data !== "auth_complete") return;
      window.removeEventListener("message", authComplete);
      authWindow?.close();
      window.location.reload();
    });
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
