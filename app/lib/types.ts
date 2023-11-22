import type { Database } from "database.types";
import type { combinePostsWithLikes } from "./utils";

type Post = Database["public"]["Tables"]["posts"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Comment = Database["public"]["Tables"]["comments"]["Row"];

type CommentWithAuthor = Comment & {
  author: {
    avatar_url: string;
    username: string;
  } | null;
};

// Combine types to create PostWithAuthorAndLikes
export type PostWithDetails = Post & {
  author: Profile | null;
  likes: { user_id: string }[];
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
