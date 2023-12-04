import type { Database } from "database.types";
import type { combinePostsWithLikes } from "./utils";

type Post = Database["public"]["Tables"]["posts"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Comment = Database["public"]["Tables"]["comments"]["Row"];

type Like = {
  user_id: string;
};

type CommentWithAuthor = Comment & {
  author: {
    avatar_url: string;
    username: string;
  } | null;
};

export type PostWithDetails = Post & {
  author: Profile | null;
  likes: Like[];
  comments: Comment[];
};

export type PostWithCommentDetails = Omit<PostWithDetails, "comments"> & {
  comments: CommentWithAuthor[];
};

export type CombinedPostsWithAuthorAndLikes = ReturnType<
  typeof combinePostsWithLikes
>;

export type CombinedPostWithAuthorAndLikes =
  CombinedPostsWithAuthorAndLikes[number];
