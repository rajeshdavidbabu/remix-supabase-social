import { redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "~/lib/supabase.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/";

  if (code) {
    const { headers, supabase } = getSupabaseWithHeaders({
      request,
    });

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return redirect(next, { headers });
    }
  }

  // return the user to an error page with instructions
  return redirect("/login");
}
