import { useFetcher, useLocation, useRouteLoaderData } from "@remix-run/react";
import { useState, useEffect } from "react";
import type { CombinedPostsWithAuthorAndLikes } from "~/lib/types";
import type { loader as postsLoader } from "../_home.gitposts";
import type { loader as postLoader } from "../_home.gitposts.$postId";

type UseInfinitePosts = {
  incomingPosts: CombinedPostsWithAuthorAndLikes;
  postRouteId: string; // Will be used to fetch updated post
  totalPages: number;
};

export const useInfinitePosts = ({
  incomingPosts,
  postRouteId,
  totalPages,
}: UseInfinitePosts) => {
  const [posts, setPosts] =
    useState<CombinedPostsWithAuthorAndLikes>(incomingPosts);
  const fetcher = useFetcher<typeof postsLoader>();
  const [currentPage, setCurrentPage] = useState(1);
  const location = useLocation();

  // Use this route-data to update the list
  const data = useRouteLoaderData<typeof postLoader>(postRouteId);

  // Since this list if read-only and doesn't revalidate
  // when there is an update on an individual post we update
  // the individual posts with new updated values.
  useEffect(() => {
    const updatedPost = data?.post;

    if (updatedPost) {
      const updatedComments = updatedPost.comments.map(
        ({ author, ...comment }) => comment
      );

      setPosts((posts) =>
        posts.map((post) =>
          post.id === updatedPost.id
            ? { ...updatedPost, comments: updatedComments }
            : post
        )
      );
    }
  }, [data]);

  // When user is searching then clear the list and only load
  // posts that are relevant to the searchQuery.
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
        // // Check if any of the new posts already exist in the current posts
        // // Assumes all posts have a unique uuid
        // const hasDuplicates =
        //   fetcher.data &&
        //   fetcher.data.posts.some((newPost) =>
        //     prevPosts.some((existingPost) => existingPost.id === newPost.id)
        //   );

        // // If duplicates are found, return the current posts without change
        // if (hasDuplicates) {
        //   return prevPosts;
        // }

        // If no duplicates, concatenate the new posts
        return [...prevPosts, ...(fetcher.data?.posts || [])];
      });
      setCurrentPage((currentPage) => currentPage + 1);
    }
  }, [fetcher.data]);

  return { posts, loadMore, hasMorePages };
};
