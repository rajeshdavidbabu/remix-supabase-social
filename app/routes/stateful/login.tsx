import type { SupabaseOutletContext } from "~/lib/supabase";
import { Button } from "../../components/ui/button";
import { Github, Loader2 } from "lucide-react";
import { useOutletContext } from "@remix-run/react";
import { useState } from "react";
import { useToast } from "~/components/ui/use-toast";

export function Login() {
  const { supabase, domainUrl } = useOutletContext<SupabaseOutletContext>();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSignIn = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${domainUrl}/resources/auth/callback`,
      },
    });

    if (error) {
      console.log("Sign in ", error);
      toast({
        variant: "destructive",
        description: `Error occured: ${error}`,
      });
      // If there is no-error assume that login had navigated
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleSignIn}>
      {!isLoading && <Github className="mr-2 h-4 w-4" />}
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Login with Github
    </Button>
  );
}
