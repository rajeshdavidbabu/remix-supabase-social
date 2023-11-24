import { redirect, type LoaderFunctionArgs, json } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { AppLogo } from "~/components/app-logo";
import { Card, CardContent } from "~/components/ui/card";
import { getSupabaseWithSessionHeaders } from "~/lib/supabase.server";

export let loader = async ({ request }: LoaderFunctionArgs) => {
  const { headers, session } = await getSupabaseWithSessionHeaders({
    request,
  });

  if (session) {
    return redirect("/gitposts", { headers });
  }

  return json({ ok: true }, { headers });
};

export default function Index() {
  return (
    <section className="w-full bg-white min-h-screen flex flex-col">
      <nav className="bg-white flex items-center space-x-2 w-full p-4">
        <AppLogo className="h-8 w-8 md:h-10 md:w-10" />
        <h1 className="text-xl font-semibold text-zinc-900 ">Gitposter</h1>
      </nav>
      <div className="container flex-1 md:flex justify-center items-center px-4 md:px-6">
        <div className="flex flex-col items-center space-y-4 text-center p-4 md:w-1/2">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
            A{" "}
            <span className="font-extrabold bg-gradient-to-r from-orange-700 via-blue-500 to-green-400 text-transparent bg-clip-text bg-clip-text-webkit bg-300% animate-gradient">
              Community-Driven
            </span>{" "}
            Minimalist Social Platform for Coders
          </h1>
          <p className="text-gray-500 mt-2">
            Powered by{" "}
            <span className="text-blue-700 font-bold mt-2">Remix</span> and{" "}
            <span className="text-green-700 font-bold mt-2">Supabase</span>
          </p>

          <Link
            to="/login"
            className="inline-flex h-9 items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-50 shadow transition-colors hover:bg-zinc-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:pointer-events-none disabled:opacity-50"
          >
            Join our Community
          </Link>
        </div>

        <Card className="relative group overflow-hidden rounded-lg md:w-1/2">
          <CardContent className="p-1">
            <video className="h-full w-full rounded-lg" autoPlay loop muted>
              <source src="assets/videos/demo.mp4" type="video/mp4" />
            </video>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
