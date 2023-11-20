import { redirect } from "@remix-run/node";
import { type LoaderFunctionArgs, json } from "@remix-run/node";
import {
  Outlet,
  useLoaderData,
  useNavigation,
  useOutletContext,
  useRevalidator,
} from "@remix-run/react";
import { WritePost } from "~/routes/gitposts+/post";
import { getSupabaseWithSessionHeaders } from "~/lib/supabase.server";
import {
  type SupabaseOutletContext,
  getRealTimeSubscription,
} from "~/lib/supabase";
import { useEffect } from "react";
import { Separator } from "~/components/ui/separator";
import { PostSearch } from "~/routes/components/post-search";
import { getAllPostsWithDetails } from "~/lib/database.server";
import { combinePostsWithLikes, getUserDataFromSession } from "~/lib/utils";
import { InfiniteVirtualList } from "~/routes/components/infinite-virtual-list";

export let loader = async ({ request }: LoaderFunctionArgs) => {
  const { supabase, headers, session } = await getSupabaseWithSessionHeaders({
    request,
  });

  if (!session) {
    return redirect("/login", { headers });
  }

  const url = new URL(request.url);
  const searchParams = url.searchParams;
  const query = searchParams.get("query");
  const page = Number(searchParams.get("page")) || 1;

  const { data, totalPages, limit } = await getAllPostsWithDetails({
    dbClient: supabase,
    query,
    page: isNaN(page) ? 1 : page,
  });

  const {
    userId: sessionUserId,
    userAvatarUrl,
    userName,
  } = getUserDataFromSession(session);

  const posts = combinePostsWithLikes(data, sessionUserId);

  return json(
    {
      posts,
      userDetails: { sessionUserId, userAvatarUrl, userName },
      query,
      totalPages,
      limit,
    },
    { headers }
  );
};

export default function GitPosts() {
  const {
    posts,
    userDetails: { sessionUserId },
    query,
    totalPages,
  } = useLoaderData<typeof loader>();
  const { supabase } = useOutletContext<SupabaseOutletContext>();
  const revalidator = useRevalidator();
  const navigation = useNavigation();

  useEffect(() => {
    const subscriptionCallback = () => {
      if (revalidator.state === "idle") {
        revalidator.revalidate();
      }
    };

    const subscription = getRealTimeSubscription(
      supabase,
      subscriptionCallback
    );

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [revalidator, supabase]);

  // When nothing is happening, navigation.location will be undefined,
  // but when the user navigates it will be populated with the next
  // location while data loads. Then we check if they're searching with
  // location.search.
  const isSearching = Boolean(
    navigation.location &&
      new URLSearchParams(navigation.location.search).has("query")
  );

  return (
    <div className="w-full max-w-xl px-4 flex flex-col">
      <Outlet />
      <WritePost sessionUserId={sessionUserId} />
      <Separator />
      <PostSearch searchQuery={query} isSearching={isSearching} />
      <InfiniteVirtualList
        sessionUserId={sessionUserId}
        posts={posts}
        totalPages={totalPages}
      />
    </div>
  );
}
