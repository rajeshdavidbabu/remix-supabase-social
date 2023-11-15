import {
  GitHubLogoIcon,
  HamburgerMenuIcon,
  Cross2Icon,
} from "@radix-ui/react-icons";
import { redirect } from "@remix-run/node";
import { type LoaderFunctionArgs, json } from "@remix-run/node";
import {
  useLoaderData,
  Outlet,
  useOutletContext,
  Link,
} from "@remix-run/react";
import { Logout } from "~/components/logout";
import type { SupabaseOutletContext } from "~/lib/supabase";
import { getSupabaseWithSessionHeaders } from "~/lib/supabase.server";
import { getUserDataFromSession } from "~/lib/utils";
import { useState } from "react";

export let loader = async ({ request }: LoaderFunctionArgs) => {
  const { headers, session } = await getSupabaseWithSessionHeaders({
    request,
  });

  if (!session) {
    return redirect("/login", { headers });
  }

  const { userId, userAvatarUrl, userName } = getUserDataFromSession(session);

  return json(
    { userDetails: { userId, userAvatarUrl, userName } },
    { headers }
  );
};

export default function Index() {
  const {
    userDetails: { userAvatarUrl, userName, userId },
  } = useLoaderData<typeof loader>();
  const { supabase } = useOutletContext<SupabaseOutletContext>();
  const [isNavOpen, setNavOpen] = useState(false);

  return (
    <div className="flex items-center flex-col min-h-screen">
      <nav className="sticky top-0 z-50 bg-white flex w-full items-center justify-between px-6 py-4 border-b border-zinc-200 flex-wrap md:flex-nowrap">
        <Link to="/" className="flex items-center space-x-4">
          <GitHubLogoIcon className="mr-1 h-8 w-8" />
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
          <Link prefetch="intent" to={`/profile/${userId}`}>
            @{userName}
          </Link>
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
          <Logout />
        </div>
      </nav>
      <Outlet context={{ supabase }} />
    </div>
  );
}
