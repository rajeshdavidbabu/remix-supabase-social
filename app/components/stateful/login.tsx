import type { SupabaseOutletContext } from "~/lib/supabase";
import { Button } from "../ui/button";
import { Github } from "lucide-react";
import { useOutletContext } from "@remix-run/react";

export function Login() {
  const { supabase } = useOutletContext<SupabaseOutletContext>();

  const handleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `http://localhost:3000/auth/callback`,
      },
    });
    if (error) {
      console.log("Sign in ", error);
    }
  };

  return (
    <Button onClick={handleSignIn}>
      <Github className="mr-2 h-4 w-4" />
      Login with Github
    </Button>
  );
}
