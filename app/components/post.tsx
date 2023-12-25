import { Link } from "@remix-run/react";
import { Card } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm"
import { AppLogo } from "./app-logo";
import { Avatar, AvatarImage } from "@radix-ui/react-avatar";

export type PostProps = {
  avatarUrl: string;
  name: string;
  id: string;
  username: string;
  title: string;
  dateTimeString: string;
  userId: string;
  children?: React.ReactNode;
};

export function PostSkeleton() {
  return (
    <div className="flex space-x-4 min-h-[12rem] my-3 p-8">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
  );
}

export function Post({
  avatarUrl,
  name,
  username,
  title,
  dateTimeString,
  id,
  userId,
  children,
}: PostProps) {
  return (
    // Using padding instead of margin on the card
    // https://virtuoso.dev/troubleshooting#list-does-not-scroll-to-the-bottom--items-jump-around
    <div className="py-2">
      <Card
        key={id}
        className="rounded-xl shadow-md overflow-hidden min-h-[12rem]"
      >
        <div className="flex">
          <div className="flex-shrink-0">
            <span className="object-cover md:w-48 rounded-md bg-muted" />
          </div>
          <div className="p-4 md:p-8 w-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Avatar className="w-12 h-12">
                  <AvatarImage
                    className="rounded-full"
                    alt="User avatar"
                    src={avatarUrl}
                  ></AvatarImage>
                </Avatar>
                <div className="ml-4">
                  <div className="text-sm md:text-lg font-semibold">
                    <Link prefetch="intent" to={`/profile/${username}`}>
                      {name}
                    </Link>
                  </div>
                  <div className="text-muted-foreground text-sm md:text-md">
                    <Link prefetch="intent" to={`/profile/${username}`}>
                      @{username}
                    </Link>
                  </div>
                </div>
              </div>
              <AppLogo className="h-8 w-8" />
            </div>
            <div className="mt-4 text-sm prose dark:prose-invert prose-pre:border max-w-full">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{title}</ReactMarkdown>
            </div>
            <div className="flex mt-6 justify-between items-center">
              <div className="flex space-x-4">{children}</div>
              <div className="text-muted-foreground text-sm">
                {dateTimeString}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
