import type { ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { getSupabaseWithSessionHeaders } from "~/lib/supabase.server";
import { useEffect, useRef, useState } from "react";
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";
import { UpdateIcon } from "@radix-ui/react-icons";
import { useFetcher } from "@remix-run/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

export async function action({ request }: ActionFunctionArgs) {
  const { supabase, headers, session } = await getSupabaseWithSessionHeaders({
    request,
  });

  if (!session) {
    return redirect("/login", { headers });
  }

  const formData = await request.formData();
  const title = formData.get("title")?.toString();
  const userId = formData.get("userId")?.toString();

  // Check if userId and tweetId are present
  if (!userId || !title) {
    return json(
      { error: "Post/user information missing" },
      { status: 400, headers }
    );
  }

  const { error } = await supabase
    .from("posts")
    .insert({ user_id: userId, title });

  if (error) {
    console.log("Error occured ", error);
    return json({ error: "Failed to post" }, { status: 500, headers });
  }

  return json({ ok: true, error: null }, { headers });
}

export function WritePost({ sessionUserId }: { sessionUserId: string }) {
  const fetcher = useFetcher();
  const [title, setTitle] = useState("");
  const isPosting = fetcher.state !== "idle";
  const postTweet = async () => {
    fetcher.submit(
      {
        title,
        userId: sessionUserId,
      },
      { method: "POST", action: "/gitposts/post" }
    );
    setTitle("");
  };

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "inherit"; // Reset height - important to shrink on delete
      const computed = window.getComputedStyle(textareaRef.current);
      const height =
        textareaRef.current.scrollHeight +
        parseInt(computed.getPropertyValue("border-top-width")) +
        parseInt(computed.getPropertyValue("border-bottom-width"));
      textareaRef.current.style.height = `${height}px`;
    }
  }, [title]);

  return (
    <Card className="my-3">
      <CardHeader>
        <CardTitle>Write Post</CardTitle>
        <CardDescription>You can write in Markdown</CardDescription>
      </CardHeader>
      <CardContent>
        <Textarea
          placeholder="Type your gitpost here!!"
          value={title}
          ref={textareaRef}
          onChange={(e) => setTitle(e.target.value)}
          className="mb-2"
        />
      </CardContent>
      <CardFooter>
        <Button disabled={isPosting ? true : false} onClick={postTweet}>
          {isPosting && <UpdateIcon className="mr-2 h-4 w-4 animate-spin" />}
          {isPosting ? "Posting" : "Post"}
        </Button>
      </CardFooter>
    </Card>
  );
}
