import { Link } from '@remix-run/react';
import { AppLogo } from '~/components/app-logo';
import { Card, CardContent } from '~/components/ui/card';
import { getSupabaseWithSessionHeaders } from '~/lib/supabase.server';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Login as GithubLogin } from './stateful/oauth-login';
import { ThemeToggle } from './resources.theme-toggle';
import { Label } from '~/components/ui/label';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { AuthForm } from '~/routes/stateful/auth-form';

export let loader = async ({ request }: LoaderFunctionArgs) => {
  const { headers, session } = await getSupabaseWithSessionHeaders({
    request,
  });

  if (session) {
    return redirect('/gitposts', { headers });
  }

  return json({ success: true }, { headers });
};

export default function Login() {
  return (
    <section className="w-full min-h-screen flex flex-col">
      <nav className="flex items-center justify-between p-4 w-full">
        <Link to="/" className="flex items-center space-x-2">
          <AppLogo className="h-8 w-8 md:h-10 md:w-10" />
          <h1 className="text-xl font-semibold">Gitposter</h1>
        </Link>
        <ThemeToggle />
      </nav>

      <div className="flex items-center justify-center flex-1 w-full">
        <div className="h-full flex-col bg-muted rounded-md m-8 p-4 w-1/2 hidden md:flex max-w-sm">
          <div className="flex flex-col items-center space-y-4 text-center p-4">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tighter">
              <span className="px-1 font-extrabold bg-gradient-to-r from-orange-700 via-blue-500 to-green-400 text-transparent bg-clip-text bg-300% animate-gradient">
                Login
              </span>{' '}
              and discover more
            </h1>

            <p className="text-gray-500 mt-2">
              Our posts and comments are powered by Markdown
            </p>
          </div>
        </div>
        <div className="m-8 w-full md:w-1/2 p-4 grid gap-4 max-w-sm">
          <GithubLogin />
          <div className="grid gap-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>
            <AuthForm />
          </div>
        </div>
      </div>
    </section>
  );
}
