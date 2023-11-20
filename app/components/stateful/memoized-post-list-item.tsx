import { memo } from "react";
import type { CombinedPostWithAuthorAndLikes } from "~/lib/utils";
import { formatToTwitterDate } from "~/lib/utils";
import { Like } from "~/routes/gitposts.like";
import { Post } from "../post";
import { ViewComments } from "./view-comments";

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
  }
);
MemoizedPostListItem.displayName = "MemoizedPostListItem";
