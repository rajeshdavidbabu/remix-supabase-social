import { redirect, type LoaderFunctionArgs } from '@remix-run/node';
import { EmailOtpType } from '@supabase/supabase-js';
import { getSupabaseWithHeaders } from '~/lib/supabase.server';

export async function loader({ request }: LoaderFunctionArgs) {
  const requestUrl = new URL(request.url);
  const token_hash = requestUrl.searchParams.get('token_hash');
  const type = requestUrl.searchParams.get('type') as EmailOtpType | null;
  const next = requestUrl.searchParams.get('next') || '/';
  const headers = new Headers();

  if (token_hash && type) {
    const { headers, supabase } = getSupabaseWithHeaders({
      request,
    });

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    console.log('Error: auth confirm email ', error);

    if (!error) {
      return redirect(next, { headers });
    }
  }

  // return the user to an error page with instructions
  return redirect('/login');
}
