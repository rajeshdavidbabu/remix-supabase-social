import { useEffect, useState } from "react";
import { type CombinedPostsWithAuthorAndLikes } from "~/lib/utils";
import { useFetcher, useLocation } from "@remix-run/react";

import { PostSkeleton } from "../../components/post";
import { Virtuoso, LogLevel } from "react-virtuoso";
import { MemoizedPostListItem } from "../../components/memoized-post-list-item";
import type { loader } from "../_home+/gitposts";

export function InfiniteVirtualList({
  sessionUserId,
  totalPages,
  posts: incomingPosts,
}: {
  sessionUserId: string;
  totalPages: number;
  posts: CombinedPostsWithAuthorAndLikes;
}) {
  const [posts, setPosts] =
    useState<CombinedPostsWithAuthorAndLikes>(incomingPosts);
  const fetcher = useFetcher<typeof loader>();
  const [currentPage, setCurrentPage] = useState(1);
  const location = useLocation();

  console.log("Incoming current page ", currentPage);

  // Update the old posts when user is searching for new
  const [prevPosts, setPrevPosts] = useState(incomingPosts);
  if (incomingPosts !== prevPosts) {
    setPrevPosts(incomingPosts);
    setPosts(incomingPosts);
    setCurrentPage(1);
  }

  const hasMorePages = currentPage < totalPages;

  const loadMore = () => {
    if (hasMorePages && fetcher.state === "idle") {
      let fullSearchQueryParams = "";
      if (location.search) {
        fullSearchQueryParams = `${location.search}&page=${currentPage + 1}`;
      } else {
        fullSearchQueryParams = `?page=${currentPage + 1}`;
      }
      fetcher.load(`${location.pathname}/${fullSearchQueryParams}`);
    }
  };

  useEffect(() => {
    if (fetcher.data?.posts) {
      setPosts((prevPosts) => {
        // Check if any of the new posts already exist in the current posts
        // Assumes all posts have a unique uuid
        const hasDuplicates =
          fetcher.data &&
          fetcher.data.posts.some((newPost) =>
            prevPosts.some((existingPost) => existingPost.id === newPost.id)
          );

        // If duplicates are found, return the current posts without change
        if (hasDuplicates) {
          return prevPosts;
        }

        // If no duplicates, concatenate the new posts
        return [...prevPosts, ...(fetcher.data?.posts || [])];
      });
      setCurrentPage((currentPage) => currentPage + 1);
    }
  }, [fetcher.data]);

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
