import { json, redirect } from "@remix-run/node";
import { type LoaderFunctionArgs } from "@remix-run/node";
import type { ShouldRevalidateFunctionArgs } from "@remix-run/react";
import { Link, Outlet, useLoaderData } from "@remix-run/react";

import { InfiniteVirtualList } from "~/routes/stateful/infinite-virtual-list";

import { Avatar, AvatarImage } from "~/components/ui/avatar";
import { Separator } from "~/components/ui/separator";
import { getPostsForUser, getProfileForUsername } from "~/lib/database.server";
import { getSupabaseWithSessionHeaders } from "~/lib/supabase.server";
import { combinePostsWithLikes } from "~/lib/utils";

export let loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { username } = params;
  const { supabase, headers, session } = await getSupabaseWithSessionHeaders({
    request,
  });

  if (!session) {
    return redirect("/login", { headers });
  }

  // Redirect to 404 page if username is invalid
  if (!username) {
    return redirect("/404", { headers });
  }

  const url = new URL(request.url);
  const searchParams = url.searchParams;
  const page = Number(searchParams.get("page")) || 1;

  const { data: profiles } = await getProfileForUsername({
    dbClient: supabase,
    username,
  });

  const profile = profiles ? profiles[0] : null;

  // User not found
  if (!profile) {
    return redirect("/404", { headers });
  }

  const {
    data: rawPosts,
    limit,
    totalPages,
  } = await getPostsForUser({
    dbClient: supabase,
    userId: profile.id,
    page,
  });

  const sessionUserId = session.user.id;
  const posts = combinePostsWithLikes(rawPosts, sessionUserId);

  return json(
    {
      profile,
      sessionUserId: session.user.id,
      posts,
      limit,
      totalPages,
    },
    { headers }
  );
};

export default function Profile() {
  const {
    profile: { avatar_url, name, username },
    sessionUserId,
    posts,
    totalPages,
  } = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-col w-full max-w-xl px-4 my-2">
      <Outlet />
      <div className="flex flex-col justify-center items-center m-4">
        <Avatar className="h-24 w-24 mb-4">
          <AvatarImage alt="User avatar" src={avatar_url} />
        </Avatar>
        <h1 className="text-2xl font-bold">{name}</h1>
        <Link to={`https://github.com/${username}`}>
          <p className="text-zinc-500">@{username}</p>
        </Link>
      </div>
      <br />
      <Separator />
      <br />
      <h2 className="text-xl font-heading font-semibold">{"User posts"}</h2>
      <br />
      <InfiniteVirtualList
        sessionUserId={sessionUserId}
        posts={posts}
        totalPages={totalPages}
        isProfile={true}
      />
    </div>
  );
}

export function shouldRevalidate({
  actionResult,
  defaultShouldRevalidate,
}: ShouldRevalidateFunctionArgs) {
  const skipRevalidation =
    actionResult?.skipRevalidation &&
    actionResult?.skipRevalidation?.includes("/profile.$username");

  if (skipRevalidation) {
    return false;
  }

  return defaultShouldRevalidate;
}
