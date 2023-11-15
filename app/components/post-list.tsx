import { formatToTwitterDate } from "~/lib/utils";
import { Post } from "./post";
import { Like } from "~/routes/gitposts.like";
import type { CombinedPostsWithAuthorAndLikes } from "~/lib/utils";

export function PostList({
  sessionUserId,
  posts,
}: {
  sessionUserId: string;
  posts: CombinedPostsWithAuthorAndLikes;
}) {
  return (
    <>
      {posts?.map((post) => (
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
          <Like
            likedByUser={post.isLikedByUser}
            likes={post.likes}
            sessionUserId={sessionUserId}
            postId={post.id}
          />
        </Post>
      ))}
    </>
  );
}
