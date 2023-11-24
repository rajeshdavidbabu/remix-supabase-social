import { UpdateIcon } from "@radix-ui/react-icons";
import { useFetcher } from "@remix-run/react";
import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "./ui/card";
import { Textarea } from "./ui/textarea";

type WritePostProps = {
  sessionUserId: string;
  postId?: string;
  isComment?: boolean;
};

export function WritePost({
  sessionUserId,
  isComment,
  postId,
}: WritePostProps) {
  const fetcher = useFetcher();
  const [title, setTitle] = useState("");
  const isPosting = fetcher.state !== "idle";
  const isDisabled = isPosting || !title;

  const postActionUrl = isComment ? "/resources/comment" : "/resources/post";

  const formData = {
    title,
    userId: sessionUserId,
    ...(isComment ? { postId } : {}),
  };

  const postItem = async () => {
    fetcher.submit(formData, { method: "POST", action: postActionUrl });
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

  if (isComment) {
    return (
      <Card className="mb-4">
        <CardContent className="p-4 text-right">
          <Textarea
            placeholder="Type your comment here (markdown supported)!!"
            value={title}
            ref={textareaRef}
            onChange={(e) => setTitle(e.target.value)}
            className="mb-2"
          />
          <Button disabled={isDisabled} onClick={postItem}>
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
        <Button disabled={isDisabled} onClick={postItem}>
          {isPosting && <UpdateIcon className="mr-2 h-4 w-4 animate-spin" />}
          {isPosting ? "Posting" : "Post"}
        </Button>
      </CardFooter>
    </Card>
  );
}
