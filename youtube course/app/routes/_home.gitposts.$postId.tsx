import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { useState } from "react";
import { Post } from "~/components/post";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
} from "~/components/ui/dialog";
import { ViewComments } from "~/components/view-comments";
import { getPostWithDetailsById } from "~/lib/database.server";
import { getSupabaseWithSessionAndHeaders } from "~/lib/supabase.server";
import {
  combinePostsWithLikesAndComments,
  formatToTwitterDate,
  getUserDataFromSession,
} from "~/lib/utils";
import { Like } from "./resources.like";
import { WritePost } from "~/components/write-post";
import { AppLogo } from "~/components/app-logo";
import { ShowComment } from "~/components/show-comment";
import { Card } from "~/components/ui/card";

export let loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { postId } = params;

  const { supabase, headers, serverSession } =
    await getSupabaseWithSessionAndHeaders({
      request,
    });

  if (!serverSession) {
    return redirect("/login", { headers });
  }

  if (!postId) {
    return redirect("/404", { headers });
  }

  const { userId: sessionUserId } = getUserDataFromSession(serverSession);

  const { data } = await getPostWithDetailsById({ dbClient: supabase, postId });

  const posts = combinePostsWithLikesAndComments(data, sessionUserId);

  return json(
    {
      post: posts[0],
      sessionUserId,
    },
    { headers }
  );
};

export default function CurrentPost() {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  const { post, sessionUserId } = useLoaderData<typeof loader>();

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        navigate(-1);
        setOpen(open);
      }}
    >
      <DialogContent className="max-w-xl h-[90vh] overflow-y-scroll">
        <DialogHeader>
          <DialogDescription className="my-2 text-left">
            <Post
              avatarUrl={post.author.avatar_url}
              name={post.author.name}
              username={post.author.username}
              title={post.title}
              userId={post.author.id}
              id={post.id}
              dateTimeString={formatToTwitterDate(post.created_at)}
            >
              <Like
                likes={post.likes.length}
                likedByUser={post.isLikedByUser}
                sessionUserId={sessionUserId}
                postId={post.id}
              />
              <ViewComments
                comments={post.comments.length}
                pathname={`/`}
                readonly={true}
              />
            </Post>
            <WritePost sessionUserId={sessionUserId} postId={post.id} />
            {post.comments.length ? (
              <div>
                {post.comments.map(({ title, author }, index) => (
                  <Card key={index} className="my-2 min-h-24 p-4">
                    <ShowComment
                      title={title}
                      avatarUrl={author.avatarUrl}
                      username={author.username}
                    />
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex justify-center items-center h-full">
                <AppLogo className="h-10 w-10 opacity-60" />
                <h2 className="ml-2">No comments yet !!</h2>
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
