import { Avatar, AvatarImage } from "~/components/ui/avatar";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Link,
  Outlet,
  ShouldRevalidateFunctionArgs,
  useLoaderData,
} from "@remix-run/react";
import { InfiniteVirtualList } from "~/components/infinite-virtual-list";
import { Separator } from "~/components/ui/separator";
import { getPostsForUser, getProfileForUsername } from "~/lib/database.server";
import { getSupabaseWithSessionAndHeaders } from "~/lib/supabase.server";
import { getUserDataFromSession, combinePostsWithLikes } from "~/lib/utils";

export let loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { username } = params;
  const { supabase, headers, serverSession } =
    await getSupabaseWithSessionAndHeaders({
      request,
    });

  if (!serverSession) {
    return redirect("/login", { headers });
  }

  // Redirect to 404 page if username is invalid
  if (!username) {
    return redirect("/404", { headers });
  }

  const url = new URL(request.url);
  const searchParams = url.searchParams;
  const page = Number(searchParams.get("page")) || 1;

  const { data: profile } = await getProfileForUsername({
    dbClient: supabase,
    username,
  });

  // User not found
  if (!profile) {
    return redirect("/404", { headers });
  }

  const { data: rawPosts, totalPages } = await getPostsForUser({
    dbClient: supabase,
    page: isNaN(page) ? 1 : page,
    userId: profile.id,
  });

  const {
    userId: sessionUserId,
    // username,
    // userAvatarUrl,
  } = getUserDataFromSession(serverSession);

  const posts = combinePostsWithLikes(rawPosts, sessionUserId);

  return json(
    { posts, totalPages, profile, userDetails: { sessionUserId } },
    { headers }
  );
};

export default function Profile() {
  const {
    profile: { avatar_url, name, username },
    posts,
    totalPages,
  } = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-col w-full max-w-xl px-4 my-2">
      <Outlet />
      <div className="flex flex-col justify-center items-center m-4">
        <Avatar className="w-24 h-24 mb-4">
          <AvatarImage alt="User avatar" src={avatar_url}></AvatarImage>
        </Avatar>
        <h1 className="text-2xl font-bold">{name}</h1>
        <Link to={`https://github.com/${username}`}>
          <p className="text-zinc-500">@{username}</p>
        </Link>
      </div>
      <br />
      <Separator />
      <br />
      <h1 className="text-xl font-heading font-bold">{"User posts"}</h1>
      <br />
      <InfiniteVirtualList
        incomingPosts={posts}
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
    actionResult?.skipRevalidation?.includes("profile.$username");

  if (skipRevalidation) {
    return false;
  }

  return defaultShouldRevalidate;
}
