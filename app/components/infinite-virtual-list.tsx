import { useEffect, useRef, useState } from "react";
import { PostList } from "./post-list";
import {
  formatToTwitterDate,
  type CombinedPostsWithAuthorAndLikes,
} from "~/lib/utils";
import { useFetcher, useLocation } from "@remix-run/react";
import type { loader } from "~/routes/_home.gitposts";
import { Post, PostSkeleton } from "./post";
import { Virtuoso } from "react-virtuoso";
import { Like } from "~/routes/gitposts.like";
import { ViewComments } from "./view-comments";

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
        // Intersection observer rarely fires twice and might
        // result in duplicate values being pushed. We need to
        // avoid that.

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
      endReached={loadMore}
      itemContent={(index, post) => {
        return (
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
                />
              </div>
            </div>
          </Post>
        );
      }}
      components={{
        Footer: () => {
          console.log("hasMorePages ", hasMorePages);
          if (!hasMorePages) {
            return null;
          }

          return <PostSkeleton />;
        },
      }}
    />
  );
}
