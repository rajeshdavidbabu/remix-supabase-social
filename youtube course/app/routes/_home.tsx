import { Cross2Icon, HamburgerMenuIcon } from "@radix-ui/react-icons";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Link,
  Outlet,
  useLoaderData,
  useOutletContext,
} from "@remix-run/react";
import { useState } from "react";
import { AppLogo } from "~/components/app-logo";
import { Button } from "~/components/ui/button";
import type { SupabaseOutletContext } from "~/lib/supabase";
import { getSupabaseWithSessionAndHeaders } from "~/lib/supabase.server";
import { getUserDataFromSession } from "~/lib/utils";

export let loader = async ({ request }: LoaderFunctionArgs) => {
  const { headers, serverSession } = await getSupabaseWithSessionAndHeaders({
    request,
  });

  if (!serverSession) {
    return redirect("/login", { headers });
  }

  const { userId, userAvatarUrl, username } =
    getUserDataFromSession(serverSession);

  return json(
    { userDetails: { userId, userAvatarUrl, username } },
    { headers }
  );
};

export default function Home() {
  const {
    userDetails: { username, userAvatarUrl },
  } = useLoaderData<typeof loader>();

  const [isNavOpen, setNavOpen] = useState(false);
  const { supabase } = useOutletContext<SupabaseOutletContext>();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <section className="w-full bg-white min-h-screen flex flex-col items-center">
      <nav className="sticky top-0 bg-white z-50 flex w-full items-center justify-between p-4 border-b border-zinc-200 flex-wrap md:flex-nowrap">
        <Link to="/" className="flex items-center space-x-2">
          <AppLogo className="h-8 w-8 md:h-10 md:w-10" />
          <h1 className="text-xl font-semibold text-zinc-900 ">Gitposter</h1>
        </Link>
        <button onClick={() => setNavOpen(!isNavOpen)} className="md:hidden">
          {isNavOpen ? <Cross2Icon /> : <HamburgerMenuIcon />}
        </button>
        <div
          className={`flex md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4 ${
            isNavOpen
              ? "flex-col order-last w-full md:w-auto"
              : "hidden md:flex"
          }`}
        >
          <Link to={`/profile/${username}`}>@{username}</Link>
          <img
            alt="Profile"
            className="rounded-full"
            height="40"
            src={userAvatarUrl}
            style={{
              aspectRatio: "40/40",
              objectFit: "cover",
            }}
            width="40"
          />
          <Button onClick={handleSignOut}>Logout</Button>
        </div>
      </nav>
      <Outlet />
    </section>
  );
}
