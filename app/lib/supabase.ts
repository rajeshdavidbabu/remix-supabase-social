import { createBrowserClient } from '@supabase/ssr';
import type { Session, SupabaseClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import type { Database } from 'database.types';
import { useRevalidator } from '@remix-run/react';

export type TypedSupabaseClient = SupabaseClient<Database>;

export type SupabaseOutletContext = {
  supabase: TypedSupabaseClient;
  domainUrl: string;
};

type SupabaseEnv = {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
};

type UseSupabase = {
  env: SupabaseEnv;
  session: Session | null;
};

export const useSupabase = ({ env, session }: UseSupabase) => {
  // Singleton
  const [supabase] = useState(() =>
    createBrowserClient<Database>(env.SUPABASE_URL!, env.SUPABASE_ANON_KEY!)
  );
  const revalidator = useRevalidator();

  const serverAccessToken = session?.access_token;

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth event happened: ', event, session);

      if (session?.access_token !== serverAccessToken) {
        // call loaders
        revalidator.revalidate();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, serverAccessToken, revalidator]);

  return { supabase };
};

export function getRealTimeSubscription(
  supabase: TypedSupabaseClient,
  callback: () => void
) {
  return supabase
    .channel('realtime posts and likes')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'posts',
      },
      () => {
        callback();
      }
    )
    .subscribe();
}
