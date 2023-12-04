import { useEffect, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { useFetcher } from "@remix-run/react";
import { UpdateIcon } from "@radix-ui/react-icons";

type WritePostProps = {
  sessionUserId: string;
  postId?: string;
};

export function WritePost({ sessionUserId, postId }: WritePostProps) {
  const [title, setTitle] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fetcher = useFetcher();
  const isPosting = fetcher.state !== "idle";
  const isDisabled = isPosting || !title;
  const isComment = Boolean(postId);

  const postActionUrl = isComment ? "/resources/comment" : "/resources/post";

  const postTitle = () => {
    const formData = {
      title,
      userId: sessionUserId,
      ...(isComment ? { postId } : {}),
    };

    fetcher.submit(formData, { method: "POST", action: postActionUrl });
    setTitle("");
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "inherit";
      const computed = window.getComputedStyle(textareaRef.current);
      const height =
        textareaRef.current.scrollHeight +
        parseInt(computed.getPropertyValue("border-top-width")) +
        parseInt(computed.getPropertyValue("border-bottom-width"));
      textareaRef.current.style.height = height + "px";
    }
  }, [title]);

  if (isComment) {
    return (
      <Card className="mb-4">
        <CardContent className="p-4 text-right">
          <Textarea
            ref={textareaRef}
            placeholder="Type your comment here !!!"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mb-2"
          />
          <Button onClick={postTitle} disabled={isDisabled}>
            {isPosting && <UpdateIcon className="mr-2 h-4 w-4 animate-spin" />}
            {isPosting ? "Commenting" : "Comment"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Write Post</CardTitle>
        <CardDescription>You can write your post in Md</CardDescription>
      </CardHeader>
      <CardContent>
        <Textarea
          ref={textareaRef}
          placeholder="Type your gitpost here !!!"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mb-2"
        />
      </CardContent>
      <CardFooter>
        <Button onClick={postTitle} disabled={isDisabled}>
          {isPosting && <UpdateIcon className="mr-2 h-4 w-4 animate-spin" />}
          {isPosting ? "Posting" : "Post"}
        </Button>
      </CardFooter>
    </Card>
  );
}
