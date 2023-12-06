import { HamburgerMenuIcon, Cross2Icon } from "@radix-ui/react-icons";
import { redirect } from "@remix-run/node";
import { type LoaderFunctionArgs, json } from "@remix-run/node";
import {
  useLoaderData,
  Outlet,
  useOutletContext,
  Link,
} from "@remix-run/react";
import { Logout } from "~/routes/stateful/logout";
import type { SupabaseOutletContext } from "~/lib/supabase";
import { getSupabaseWithSessionHeaders } from "~/lib/supabase.server";
import { getUserDataFromSession } from "~/lib/utils";
import { useState } from "react";
import { AppLogo } from "~/components/app-logo";
import { ThemeToggle } from "./resources.theme-toggle";
import { Avatar, AvatarImage } from "@radix-ui/react-avatar";

export let loader = async ({ request }: LoaderFunctionArgs) => {
  const { headers, session } = await getSupabaseWithSessionHeaders({
    request,
  });

  if (!session) {
    return redirect("/login", { headers });
  }

  const { userId, userAvatarUrl, username } = getUserDataFromSession(session);

  return json(
    { userDetails: { userId, userAvatarUrl, username } },
    { headers }
  );
};

export default function Index() {
  const {
    userDetails: { userAvatarUrl, username },
  } = useLoaderData<typeof loader>();
  const { supabase } = useOutletContext<SupabaseOutletContext>();
  const [isNavOpen, setNavOpen] = useState(false);

  return (
    <div className="flex items-center flex-col min-h-screen">
      <nav className="sticky top-0 z-50 backdrop-blur-[100px] flex w-full items-center justify-between p-4 border-b flex-wrap md:flex-nowrap">
        <Link to="/" className="flex items-center space-x-2">
          <AppLogo className="h-8 w-8 md:h-10 md:w-10" />
          <h1 className="text-xl font-semibold">Gitposter</h1>
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
          <Link prefetch="intent" to={`/profile/${username}`}>
            @{username}
          </Link>
          <Avatar className="w-12 h-12">
            <AvatarImage
              className="rounded-full"
              alt="User avatar"
              src={userAvatarUrl}
            ></AvatarImage>
          </Avatar>
          <ThemeToggle />
          <Logout />
        </div>
      </nav>
      <Outlet context={{ supabase }} />
    </div>
  );
}
