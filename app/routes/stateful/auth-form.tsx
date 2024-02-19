import { useState } from 'react';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { toast } from 'sonner';
import { useOutletContext, useNavigate } from '@remix-run/react';
import { SupabaseOutletContext } from '~/lib/supabase';

export function AuthForm() {
  const { supabase, domainUrl } = useOutletContext<SupabaseOutletContext>();

  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [githubUsername, setGithubUsername] = useState('');

  const signInEmailPassword = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    console.log('Sign in ', data, error);

    if (error) {
      // Show error toast
      toast.error(error?.message || 'An unknown error occured during login');
    } else {
      // Navigate to /gitposts route
      navigate('/gitposts');
    }
  };

  const createAccount = async () => {
    // TODO: Add validation using some nice form library
    if (!name || !githubUsername || !email || !password) {
      toast.error('All fields are required');
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${domainUrl}/login`,
        data: {
          name,
          user_name: githubUsername,
          avatar_url: `https://github.com/${githubUsername}.png?size=500}`,
        },
      },
    });

    if (error) {
      // Show error toast
      toast.error(error?.message || 'An unknown error occured during sign up');
    } else if (
      data?.user &&
      data?.user?.identities &&
      data?.user?.identities?.length === 0
    ) {
      toast.error('User already exists, please login instead.');
    } else {
      // Email is has a link that takes you to login page
      toast.success('Check your email for a verification link');
    }
  };

  return (
    <Tabs defaultValue="login" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="login">Login</TabsTrigger>
        <TabsTrigger value="account">Create Account</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <Card>
          <CardHeader>
            <CardTitle>Create Account</CardTitle>
            <CardDescription>
              Enter your details to create an account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="name">Name</Label>
              <Input
                id="text"
                type="text"
                placeholder="Display Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="username">Github Username</Label>
              <Input
                id="text"
                type="text"
                placeholder="Github Username"
                value={githubUsername}
                onChange={(e) => setGithubUsername(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={createAccount}>Sign Up</Button>
          </CardFooter>
        </Card>
      </TabsContent>
      <TabsContent value="login">
        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>
              Already have an account? Login here.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="block">
            <Button onClick={signInEmailPassword}>Sign In</Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
