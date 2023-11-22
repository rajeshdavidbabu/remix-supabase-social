import { json, redirect } from "@remix-run/node";
import { type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { useState } from "react";
import { Post } from "~/components/post";
import { Card, CardTitle } from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
} from "~/components/ui/dialog";
import { Textarea } from "~/components/ui/textarea";
import { ViewComments } from "~/routes/components/view-comments";
import { getPostWithDetailsById } from "~/lib/database.server";

import { getSupabaseWithSessionHeaders } from "~/lib/supabase.server";
import {
  combinePostsWithLikes,
  formatToTwitterDate,
  getUserDataFromSession,
} from "~/lib/utils";
import { Like } from "~/routes/gitposts+/like";
import ReactMarkdown from "react-markdown";

export let loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { postId } = params;
  console.log("Incoming params ", params);
  const { supabase, headers, session } = await getSupabaseWithSessionHeaders({
    request,
  });

  if (!session) {
    return redirect("/login", { headers });
  }

  if (!postId) {
    return redirect("/404", { headers });
  }

  const { data } = await getPostWithDetailsById({
    dbClient: supabase,
    postId,
  });

  const { userId: sessionUserId } = getUserDataFromSession(session);

  const posts = combinePostsWithLikes(data, sessionUserId);

  return json(
    {
      post: posts[0],
      sessionUserId,
    },
    { headers }
  );
};

export default function CurrentPost() {
  const { post, sessionUserId } = useLoaderData<typeof loader>();
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        navigate(-1);
        setOpen(open);
      }}
    >
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogDescription>
            <Post
              avatarUrl={post.author.avatar_url}
              id={post.id}
              name={post.author.name}
              username={post.author.username}
              dateTimeString={formatToTwitterDate(post.created_at)}
              title={post.title}
              userId={post.user_id}
              key={post.id}
            >
              <div className="flex items-center justify-between w-24 md:w-32">
                <div className="flex items-center w-1/2">
                  <Like
                    likedByUser={post.isLikedByUser}
                    likes={post.likes}
                    sessionUserId={sessionUserId}
                    postId={post.id}
                  />
                </div>
                <div className="flex items-center w-1/2">
                  <ViewComments
                    number={post.comments.length}
                    pathname={`/gitposts/${post.id}`}
                    readonly={true}
                  />
                </div>
              </div>
            </Post>
            {post.comments.length ? (
              <Card className="my-2 min-h-24 max-h-48 overflow-y-scroll p-4">
                <CardTitle>Comments</CardTitle>
                {post.comments.map((comment, index) => (
                  <div key={index} className="text-sm prose p-4">
                    <ReactMarkdown>{comment.title}</ReactMarkdown>
                  </div>
                ))}
              </Card>
            ) : (
              <></>
            )}
            <Textarea></Textarea>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
