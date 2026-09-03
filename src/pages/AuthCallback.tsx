import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const completeSignIn = async () => {
      const params = new URLSearchParams(window.location.search);
      const oauthError = params.get("error_description") ?? params.get("error");

      if (oauthError) {
        if (isMounted) {
          setErrorMessage(decodeURIComponent(oauthError.replace(/\+/g, " ")));
        }
        return;
      }

      const code = params.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          if (isMounted) setErrorMessage(error.message);
          return;
        }
      }

      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session) {
        if (isMounted) {
          setErrorMessage(error?.message ?? "We could not complete Google sign-in. Please try again.");
        }
        return;
      }

      if (isMounted) navigate("/dashboard", { replace: true });
    };

    void completeSignIn();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  if (errorMessage) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="w-full max-w-md space-y-4 text-center">
          <h1 className="text-2xl font-semibold text-foreground">Sign-in could not be completed</h1>
          <p className="text-muted-foreground">{errorMessage}</p>
          <Button onClick={() => navigate("/auth", { replace: true })}>Return to sign in</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
