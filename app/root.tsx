import {
  json,
  type LinksFunction,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import styles from "~/tailwind.css";
import {
  getSupabaseEnv,
  getSupabaseWithSessionHeaders,
} from "./lib/supabase.server";
import { useSupabase } from "./lib/supabase";
import { Toaster } from "./components/ui/toaster";

export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session, headers } = await getSupabaseWithSessionHeaders({
    request,
  });
  const domainUrl = process.env.DOMAIN_URL!;

  return json({ env: getSupabaseEnv(), session, domainUrl }, { headers });
};

export default function App() {
  const { env, session, domainUrl } = useLoaderData<typeof loader>();

  const { supabase } = useSupabase({ env, session });

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="overscroll-none">
        <Toaster />
        <Outlet context={{ supabase, domainUrl }} />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
