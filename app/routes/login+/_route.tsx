import { redirect, type LoaderFunctionArgs, json } from "@remix-run/node";
import { Login as GithubLogin } from "~/routes/stateful-components/login";
import { Card, CardContent } from "~/components/ui/card";

import { getSupabaseWithSessionHeaders } from "~/lib/supabase.server";

export let loader = async ({ request }: LoaderFunctionArgs) => {
  const { headers, session } = await getSupabaseWithSessionHeaders({
    request,
  });

  if (session) {
    return redirect("/gitposts", { headers });
  }

  return json({ success: true }, { headers });
};

export default function Login() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-white min-h-screen">
      <div className="container px-4 md:px-6 max-w-2xl">
        <div className="flex flex-col items-center space-y-4 text-center max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
            Login in using <br />
            <span className="px-1 font-extrabold bg-gradient-to-r from-orange-700 via-blue-500 to-green-400 text-transparent bg-clip-text bg-300% animate-gradient">
              Github
            </span>
            <br /> and discover more
          </h2>
          <p className="text-gray-500 mt-2">
            Our posts and comments are powered by Markdown
          </p>
        </div>
        <div className="flex flex-col items-center mt-8 w-full">
          <Card className="max-w-sm relative group overflow-hidden rounded-lg">
            <CardContent className="p-1 bg-gradient-to-r from-orange-700 via-blue-500 to-green-400 text-transparent bg-300% animate-gradient">
              <GithubLogin />
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
