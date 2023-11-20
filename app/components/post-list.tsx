import { formatToTwitterDate } from "~/lib/utils";
import { Post } from "./post";
import { Like } from "~/routes/gitposts.like";
import type { CombinedPostsWithAuthorAndLikes } from "~/lib/utils";
import { ViewComments } from "./stateful/view-comments";

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
      ))}
    </>
  );
}
