import { json, redirect } from "@remix-run/node";
import { type LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";

import { LoadMore } from "~/components/load-more";
import { PostList } from "~/components/post-list";

import { Avatar, AvatarImage } from "~/components/ui/avatar";
import { Separator } from "~/components/ui/separator";
import { getPostsForUser, getProfileForUsername } from "~/lib/database.server";
import { getSupabaseWithSessionHeaders } from "~/lib/supabase.server";
import { combinePostsWithLikes } from "~/lib/utils";

export let loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { userId } = params;
  const { supabase, headers, session } = await getSupabaseWithSessionHeaders({
    request,
  });

  if (!session) {
    return redirect("/login", { headers });
  }

  // Redirect to 404 page if username is invalid
  if (!userId) {
    return redirect("/404", { headers });
  }

  const url = new URL(request.url);
  const searchParams = url.searchParams;
  const page = Number(searchParams.get("page")) || 1;

  const [{ data: profile }, { data: rawPosts, limit, totalPages }] =
    await Promise.all([
      getProfileForUsername({
        dbClient: supabase,
        userId,
      }),
      getPostsForUser({
        dbClient: supabase,
        userId,
        page,
      }),
    ]);

  const sessionUserId = session.user.id;
  const posts = combinePostsWithLikes(rawPosts, sessionUserId);

  // Redirect to 404 page if profile not found
  if (!profile || !profile[0]) {
    return redirect("/404", { headers });
  }

  const userProfile = profile[0];

  return json(
    {
      profile: userProfile,
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
    limit,
    totalPages,
  } = useLoaderData<typeof loader>();

  const showLoadMore = posts.length >= limit;

  return (
    <div className="flex flex-col w-full max-w-xl px-4">
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
      <PostList posts={posts} sessionUserId={sessionUserId} />
      {showLoadMore && (
        <LoadMore
          sessionUserId={sessionUserId}
          totalPages={totalPages}
          isSearching={false}
        />
      )}
    </div>
  );
}
