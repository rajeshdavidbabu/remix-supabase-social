import type { SupabaseOutletContext } from '~/lib/supabase';
import { Button } from '../../components/ui/button';
import { Github, Loader2 } from 'lucide-react';
import { useOutletContext } from '@remix-run/react';
import { useToast } from '~/components/ui/use-toast';

export function Login() {
  const { supabase, domainUrl } = useOutletContext<SupabaseOutletContext>();
  const { toast } = useToast();

  const handleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${domainUrl}/resources/auth/callback`,
      },
    });

    if (error) {
      console.log('Sign in ', error);
      toast({
        variant: 'destructive',
        description: `Error occured: ${error}`,
      });
    }
  };

  return (
    <div className="p-1 rounded-md flex justify-center items-center bg-gradient-to-r from-orange-700 via-blue-500 to-green-400 bg-300% animate-gradient">
      <Button className="p-4 relative w-full" onClick={handleSignIn}>
        <Github className="h-4 w-4" /> Login with Github
      </Button>
    </div>
  );
}
