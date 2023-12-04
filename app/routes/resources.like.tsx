import type { ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useEffect } from "react";
import { useToast } from "~/components/ui/use-toast";
import { getSupabaseWithSessionHeaders } from "~/lib/supabase.server";
import { useFetcher } from "@remix-run/react";
import { Star } from "lucide-react";
// import { loader } from "../_home+/gitposts.$postId";

export async function action({ request }: ActionFunctionArgs) {
  const { supabase, headers, session } = await getSupabaseWithSessionHeaders({
    request,
  });

  if (!session) {
    return redirect("/login", { headers });
  }

  const formData = await request.formData();
  const action = formData.get("action");
  const postId = formData.get("postId")?.toString();
  const userId = formData.get("userId")?.toString();

  // A skipRevalidation of the routes you want during this action
  const skipRevalidation = ["/gitposts", "/profile.$username"];

  if (!userId || !postId) {
    return json(
      { error: "User or Tweet Id missing", skipRevalidation },
      { status: 400, headers }
    );
  }

  if (action === "like") {
    // Created CREATE UNIQUE INDEX post_user ON likes(tweet_id, user_id);
    const { error } = await supabase
      .from("likes")
      .insert({ user_id: userId, post_id: postId });

    if (error) {
      return json(
        { error: "Failed to like", skipRevalidation },
        { status: 500, headers }
      );
    }
  } else {
    const { error } = await supabase
      .from("likes")
      .delete()
      .match({ user_id: userId, post_id: postId });

    if (error) {
      return json(
        { error: "Failed to unlike", skipRevalidation },
        { status: 500, headers }
      );
    }
  }

  return json({ ok: true, error: null, skipRevalidation }, { headers });
}

type LikeProps = {
  likedByUser: boolean;
  likes: number;
  postId: string;
  sessionUserId: string;
};

export function Like({ likedByUser, likes, postId, sessionUserId }: LikeProps) {
  const { toast } = useToast();
  const fetcher = useFetcher<typeof action>();

  const inFlightAction = fetcher.formData?.get("action");
  const isLoading = fetcher.state !== "idle";

  const optimisticLikedByUser = inFlightAction
    ? inFlightAction === "like"
    : likedByUser;
  const optimisticLikes = inFlightAction
    ? inFlightAction === "like"
      ? likes + 1
      : likes - 1
    : likes;

  // Show toast in error scenarios
  useEffect(() => {
    if (fetcher.data?.error && !isLoading) {
      toast({
        variant: "destructive",
        description: `Error occured: ${fetcher.data?.error}`,
      });
    } else {
      console.log("Fetcher data returned ", fetcher.data);
    }
  }, [fetcher.data, isLoading, toast]);

  return (
    <fetcher.Form action={`/resources/like`} method="post">
      <input type="hidden" name="postId" value={postId} />
      <input type="hidden" name="userId" value={sessionUserId} />
      <input
        type="hidden"
        name="action"
        value={optimisticLikedByUser ? "unlike" : "like"}
      />
      <button
        className={`group flex items-center focus:outline-none`}
        disabled={isLoading}
      >
        {optimisticLikedByUser ? (
          <Star
            className={`w-4 h-4 fill-current ${
              isLoading
                ? "text-gray-500"
                : "text-blue-700 group-hover:text-blue-400"
            }`}
          />
        ) : (
          <Star
            className={`w-4 h-4 fill-current ${
              isLoading
                ? "text-gray-500"
                : "text-gray-500 group-hover:text-blue-400"
            }`}
          />
        )}
        <span
          className={`ml-2 text-sm ${
            isLoading ? "text-gray-500" : "group-hover:text-blue-400 "
          }${optimisticLikedByUser ? "text-blue-700" : "text-gray-500"}`}
        >
          {optimisticLikes}
        </span>
      </button>
    </fetcher.Form>
  );
}
