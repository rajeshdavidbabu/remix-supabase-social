import { type CombinedPostsWithAuthorAndLikes } from "~/lib/types";
import { PostSkeleton } from "../../components/post";
import { Virtuoso, LogLevel } from "react-virtuoso";
import { MemoizedPostListItem } from "../../components/memoized-post-list-item";
import { useInfinitePosts } from "./use-infinite-posts";
import { AppLogo } from "~/components/app-logo";

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
  const postRouteId = isProfile
    ? "routes/_home.profile.$username.$postId"
    : "routes/_home.gitposts.$postId";
  const { posts, loadMore, hasMorePages } = useInfinitePosts({
    incomingPosts,
    totalPages,
    postRouteId,
  });

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
  );
}
