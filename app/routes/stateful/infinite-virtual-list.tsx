import { type CombinedPostsWithAuthorAndLikes } from "~/lib/types";
import type { SupabaseOutletContext } from "~/lib/supabase";
import { useRevalidator, useOutletContext } from "@remix-run/react";
import { useEffect, useState } from "react";
import { PostSkeleton } from "../../components/post";
import { Virtuoso, LogLevel } from "react-virtuoso";
import { MemoizedPostListItem } from "../../components/memoized-post-list-item";
import { useInfinitePosts } from "./use-infinite-posts";
import { AppLogo } from "~/components/app-logo";
import { Button } from "~/components/ui/button";
import { BellPlus } from "lucide-react";

export function InfiniteVirtualList({
  sessionUserId,
  totalPages,
  posts: incomingPosts,
  isProfile,
}: {
  sessionUserId: string;
  totalPages: number;
  posts: CombinedPostsWithAuthorAndLikes;
  isProfile?: boolean;
}) {
  const { supabase } = useOutletContext<SupabaseOutletContext>();
  const [showNewPosts, setShowNewPosts] = useState(false);
  const revalidator = useRevalidator();
  const postRouteId = isProfile
    ? "routes/_home.profile.$username.$postId"
    : "routes/_home.gitposts.$postId";
  const { posts, loadMore, hasMorePages } = useInfinitePosts({
    incomingPosts,
    totalPages,
    postRouteId,
  });

  useEffect(() => {
    const channel = supabase
      .channel("posts")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "posts",
        },
        () => {
          setShowNewPosts(true);
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [supabase]);

  console.log("Posts ", posts);

  if (!posts.length) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <AppLogo className="h-10 w-10" />
        <h2 className="ml-2">No posts found !!</h2>
      </div>
    );
  }

  return (
    <div>
      {showNewPosts ? (
        <Button
          className="sticky top-24 left-1/2 transform -translate-x-1/2 z-10"
          onClick={() => {
            setShowNewPosts(false);
            document.body.scrollTop = 0;
            document.documentElement.scrollTop = 0;
            revalidator.revalidate();
          }}
        >
          <BellPlus size={24} className="mr-2" />
          New Posts
        </Button>
      ) : null}
      <Virtuoso
        data={posts}
        useWindowScroll
        initialTopMostItemIndex={0}
        endReached={loadMore}
        initialItemCount={5}
        logLevel={LogLevel.DEBUG}
        overscan={500} // pixels
        itemContent={(index, post) => {
          if (!post) {
            return <div></div>;
          }

          return (
            <MemoizedPostListItem
              post={post}
              index={index}
              sessionUserId={sessionUserId}
            />
          );
        }}
        components={{
          Footer: () => {
            if (!hasMorePages) {
              return null;
            }

            return <PostSkeleton />;
          },
        }}
      />
    </div>
  );
}
