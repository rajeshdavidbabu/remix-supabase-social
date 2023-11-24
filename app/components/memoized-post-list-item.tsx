import { memo } from "react";
import type { CombinedPostWithAuthorAndLikes } from "~/lib/types";
import { formatToTwitterDate } from "~/lib/utils";
import { Post } from "~/components/post";
import { ViewComments } from "./view-comments";
import { ViewLikes } from "./view-likes";
import { useLocation } from "@remix-run/react";

export const MemoizedPostListItem = memo(
  ({
    post,
    index,
    sessionUserId,
  }: {
    post: CombinedPostWithAuthorAndLikes;
    sessionUserId: string;
    index: number;
  }) => {
    const location = useLocation();
    let pathnameWithSearchQuery = "";

    if (location.search) {
      pathnameWithSearchQuery = `${location.pathname}/${post.id}${location.search}`;
    } else {
      pathnameWithSearchQuery = `${location.pathname}/${post.id}`;
    }

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
            <ViewLikes
              likedByUser={post.isLikedByUser}
              likes={post.likes}
              pathname={pathnameWithSearchQuery}
            />
          </div>
          <div className="flex items-center w-1/2">
            <ViewComments
              number={post.comments.length}
              pathname={pathnameWithSearchQuery}
            />
          </div>
        </div>
      </Post>
    );
  }
);
MemoizedPostListItem.displayName = "MemoizedPostListItem";
