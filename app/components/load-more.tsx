import { useEffect, useRef, useState } from "react";
import { PostList } from "./post-list";
import type { CombinedPostsWithAuthorAndLikes } from "~/lib/utils";
import { useFetcher, useLocation } from "@remix-run/react";
import type { loader } from "~/routes/_home.gitposts";
import { PostSkeleton } from "./post";

export function LoadMore({
  sessionUserId,
  totalPages,
  isSearching,
}: {
  sessionUserId: string;
  totalPages: number;
  isSearching: boolean;
}) {
  const [posts, setPosts] = useState<CombinedPostsWithAuthorAndLikes>([]);
  const fetcher = useFetcher<typeof loader>();
  const [currentPage, setCurrentPage] = useState(1);
  const loaderRef = useRef(null);
  const location = useLocation();

  const hasMorePages = currentPage < totalPages;
  const shouldResetPagesOnSearch =
    isSearching && currentPage > 1 && posts.length > 0;

  // If user searches for something then clear the old paginated pages
  // And start from beginning and show the results for current query.
  // And when the user scrolls further down then we show the results for
  // current query.
  if (shouldResetPagesOnSearch) {
    setCurrentPage(1);
    setPosts([]);
  }

  useEffect(() => {
    const observerOptions = {
      threshold: 1.0, // Observer triggers when 100% of the target is visible
    };
    const observer = new IntersectionObserver((entries) => {
      const firstEntry = entries[0];

      if (firstEntry.isIntersecting) {
        if (currentPage < totalPages && fetcher.state === "idle") {
          // Construct the URL with query parameters
          let fullSearchQueryParams = "";
          if (location.search) {
            fullSearchQueryParams = `${location.search}&page=${
              currentPage + 1
            }`;
          } else {
            fullSearchQueryParams = `?page=${currentPage + 1}`;
          }
          fetcher.load(`${location.pathname}/${fullSearchQueryParams}`);
        }
      }
    }, observerOptions);

    const currentLoaderRef = loaderRef.current;
    if (currentLoaderRef) {
      observer.observe(currentLoaderRef);
    }

    return () => {
      if (currentLoaderRef) {
        observer.unobserve(currentLoaderRef);
      }
    };
  }, [currentPage, fetcher, totalPages, location]);

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
    <>
      <PostList sessionUserId={sessionUserId} posts={posts} />
      {hasMorePages && (
        <div ref={loaderRef}>
          <PostSkeleton />
        </div>
      )}
    </>
  );
}
