import { useFetcher, useLocation, useRouteLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import type { CombinedPostsWithAuthorAndLikes } from "~/lib/types";
import type { loader as postsLoader } from "~/routes/_home.gitposts";
import type { loader as postLoader } from "~/routes/_home.gitposts.$postId";

type UseInfinitePosts = {
  incomingPosts: CombinedPostsWithAuthorAndLikes;
  totalPages: number;
  postRouteId: string;
};

export const useInfinitePosts = ({
  incomingPosts,
  totalPages,
  postRouteId,
}: UseInfinitePosts) => {
  const [posts, setPosts] =
    useState<CombinedPostsWithAuthorAndLikes>(incomingPosts);
  const fetcher = useFetcher<typeof postsLoader>();
  const [currentPage, setCurrentPage] = useState(1);
  const location = useLocation();
  const data = useRouteLoaderData<typeof postLoader>(postRouteId);

  useEffect(() => {
    const updatedPost = data?.post;

    if (updatedPost) {
      setPosts((posts) =>
        posts.map((post) =>
          post.id === updatedPost.id ? { ...updatedPost } : post
        )
      );
    }
  }, [data]);

  const hasMorePages = currentPage < totalPages;

  const [prevPosts, setPrevPosts] = useState(incomingPosts);
  if (incomingPosts !== prevPosts) {
    setPrevPosts(incomingPosts);
    setPosts(incomingPosts);
    setCurrentPage(1);
  }

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
      setPosts((prevPosts) => [...prevPosts, ...(fetcher.data?.posts || [])]);
      setCurrentPage((currentPage) => currentPage + 1);
    }
  }, [fetcher.data]);

  return { posts, loadMore, hasMorePages };
};
