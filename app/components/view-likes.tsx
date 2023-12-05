import { Link } from "@remix-run/react";
import { Star } from "lucide-react";

type ViewLikesProps = {
  likes: number;
  likedByUser: boolean;
  pathname: string;
  readonly?: boolean;
};

export function ViewLikes({
  likes,
  likedByUser,
  pathname,
  readonly,
}: ViewLikesProps) {
  return (
    <>
      <Link
        to={pathname}
        preventScrollReset={true}
        className="flex justify-center items-center group"
      >
        {likedByUser ? (
          <Star className={`w-4 h-4 text-blue-700 group-hover:text-blue-400`} />
        ) : (
          <Star
            className={`w-4 h-4 text-muted-foreground group-hover:text-blue-400`}
          />
        )}
        <span
          className={`ml-2 text-sm group-hover:text-blue-400
          ${likedByUser ? "text-blue-700" : "text-muted-foreground"}`}
        >
          {likes}
        </span>
      </Link>
    </>
  );
}
