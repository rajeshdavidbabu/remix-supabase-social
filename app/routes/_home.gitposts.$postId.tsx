import { json, redirect } from "@remix-run/node";
import { type LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData, useNavigate } from "@remix-run/react";
import { useState } from "react";
import { Post } from "~/components/post";
import { Card } from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
} from "~/components/ui/dialog";
import { WritePost } from "~/components/write-post";
import { ViewComments } from "~/components/view-comments";
import { getPostWithDetailsById } from "~/lib/database.server";

import { getSupabaseWithSessionHeaders } from "~/lib/supabase.server";
import {
  combinePostsWithLikesAndComments,
  getUserDataFromSession,
  formatToTwitterDate,
} from "~/lib/utils";
import { Like } from "~/routes/resources.like";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm"
import { AppLogo } from "~/components/app-logo";
import { Avatar, AvatarImage } from "@radix-ui/react-avatar";

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
      <DialogContent className="max-w-xl h-[90vh] overflow-y-scroll">
        <DialogHeader>
          <DialogDescription className="my-2 text-left">
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
                    pathname={`/`}
                    readonly={true}
                  />
                </div>
              </div>
            </Post>
            <WritePost
              sessionUserId={sessionUserId}
              isComment={true}
              postId={post.id}
            />
            {post.comments.length ? (
              <div>
                {post.comments.map(({ title, author }, index) => (
                  <Card key={index} className="my-2 min-h-24 p-4">
                    <Comment
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

type CommentProps = {
  avatarUrl: string;
  username: string;
  title: string;
};

const Comment = ({ avatarUrl, username, title }: CommentProps) => {
  return (
    <div className="flex flex-col items-start">
      <div className="flex items-center">
        <Avatar className="w-8 h-8">
          <AvatarImage
            className="rounded-full"
            alt="User avatar"
            src={avatarUrl}
          ></AvatarImage>
        </Avatar>
        <div className="ml-2">
          <Link prefetch="intent" replace to={`/profile/${username}`}>
            <div className="text-sm font-semibold">{username}</div>
          </Link>
        </div>
      </div>
      <div className="text-sm prose py-4 dark:prose-invert prose-pre:border w-full">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{title}</ReactMarkdown>
      </div>
    </div>
  );
};
