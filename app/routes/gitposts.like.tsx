import type { ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useToast } from "~/components/ui/use-toast";
import { getSupabaseWithSessionHeaders } from "~/lib/supabase.server";
import { Form } from "@remix-run/react";

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

  if (!userId || !postId) {
    return json(
      { error: "User or Tweet Id missing" },
      { status: 400, headers }
    );
  }

  if (action === "like") {
    // Created CREATE UNIQUE INDEX post_user ON likes(tweet_id, user_id);
    const { error } = await supabase
      .from("likes")
      .insert({ user_id: userId, post_id: postId });
    if (error) {
      console.log("Like error ", error);
      return json({ error: "Failed to like" }, { status: 500, headers });
    }
  } else {
    const { error } = await supabase
      .from("likes")
      .delete()
      .match({ user_id: userId, post_id: postId });
    console.log("unliked");
    if (error) {
      return json({ error: "Failed to unlike" }, { status: 500, headers });
    }
  }

  return json({ ok: true, error: null }, { headers });
}

type LikeProps = {
  likedByUser: boolean;
  likes: number;
  postId: string;
  sessionUserId: string;
};

export function Like({ likedByUser, likes, postId, sessionUserId }: LikeProps) {
  const { toast } = useToast();
  const [optimisticLikes, setOptimisticLikes] = useState(likes);
  const [optimisticLikedByUser, setOptimisticLikedByUser] =
    useState(likedByUser);

  const likeUnlikeAction = async (formData: FormData) => {
    const response = await fetch("/gitposts/like", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();

      throw new Error(error.error);
    }

    return response.json();
  };

  const fetchLikesCount = async (postId: string) => {
    const response = await fetch(`/gitposts/likes/${postId}`);
    if (!response.ok) {
      const error = await response.json();

      throw new Error(error.error);
    }

    return response.json();
  };

  const mutation = useMutation({
    mutationFn: likeUnlikeAction,
    onMutate: async (variables) => {
      const action = variables.get("action");

      // Optimistically update the UI
      setOptimisticLikes((likes) =>
        action === "like" ? likes + 1 : likes - 1
      );
      setOptimisticLikedByUser(action === "like");
    },
    onError: (error) => {
      // Rollback the optimistic update
      setOptimisticLikes(likes);
      setOptimisticLikedByUser(likedByUser);

      toast({
        variant: "destructive",
        title: "Oops",
        description: error.message,
      });
    },
    onSettled: (data, error, variables) => {
      // Sync with server likes
      const postId = variables.get("postId");

      if (!postId) {
        console.error("You should not see this error !!!");
        return;
      }

      fetchLikesCount(postId.toString())
        .then(({ count }) => {
          setOptimisticLikes(count);
        })
        .catch((error) => {
          toast({
            variant: "destructive",
            title: "Oops",
            description: error.message,
          });
        });
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    mutation.mutate(formData);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <input type="hidden" name="postId" value={postId} />
      <input type="hidden" name="userId" value={sessionUserId} />
      <input
        type="hidden"
        name="action"
        value={optimisticLikedByUser ? "unlike" : "like"}
      />
      <button
        className={`group flex items-center`}
        disabled={mutation.isPending}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`group-hover:fill-blue-300 group-hover:stroke-blue-300 ${
            optimisticLikedByUser
              ? "fill-blue-600 stroke-blue-600"
              : "fill-none stroke-gray-500"
          }`}
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
        <span
          className={`ml-2 text-sm group-hover:text-blue-600 ${
            optimisticLikedByUser ? "text-blue-600" : "text-gray-500"
          }`}
        >
          {optimisticLikes}
        </span>
      </button>
    </Form>
  );
}
