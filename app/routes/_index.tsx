import { redirect, type LoaderFunctionArgs, json } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { Card, CardContent, CardFooter, CardTitle } from "~/components/ui/card";
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
    <section className="w-full py-12 md:py-24 lg:py-32 bg-white min-h-screen">
      <div className="container px-4 md:px-6 max-w-2xl">
        <div className="flex flex-col items-center space-y-4 text-center max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
            Welcome to our{" "}
            <span className="font-extrabold bg-gradient-to-r from-orange-700 via-blue-500 to-green-400 text-transparent bg-clip-text bg-clip-text-webkit bg-300% animate-gradient">
              Community Driven
            </span>{" "}
            Social Media Platform for Coders
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          <Card className="max-w-sm relative group overflow-hidden rounded-lg">
            <CardContent className="p-1">
              <img
                alt="Write Posts"
                className="w-full object-contain h-48 hover:scale-125 transition-all duration-500"
                height={200}
                src={"assets/images/write-post.png"}
                width={400}
              />
            </CardContent>
            <CardFooter>
              <CardTitle>Write Posts</CardTitle>
            </CardFooter>
          </Card>
          <Card className="max-w-sm relative group overflow-hidden rounded-lg">
            <CardContent className="p-1">
              <img
                alt="Like Posts"
                className="w-full object-contain h-48 hover:scale-125 transition-all duration-500"
                height={200}
                src={"assets/images/like-posts.png"}
                width={400}
              />
            </CardContent>
            <CardFooter>
              <CardTitle>Like Posts</CardTitle>
            </CardFooter>
          </Card>
          <Card className="max-w-sm relative group overflow-hidden rounded-lg">
            <CardContent className="p-1">
              <img
                alt="Search Posts"
                className="w-full object-contain h-48 hover:scale-125 transition-all duration-500"
                height={200}
                src={"assets/images/search-posts.png"}
                width={400}
              />
            </CardContent>
            <CardFooter>
              <CardTitle>Search Posts</CardTitle>
            </CardFooter>
          </Card>
          <Card className="max-w-sm relative group overflow-hidden rounded-lg">
            <CardContent className="p-1">
              <img
                alt="View Profiles"
                className="w-full object-contain h-48 hover:scale-125 transition-all duration-500"
                height={200}
                src={"assets/images/view-profiles.png"}
                width={400}
              />
            </CardContent>
            <CardFooter>
              <CardTitle>View Profiles</CardTitle>
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  );
}
