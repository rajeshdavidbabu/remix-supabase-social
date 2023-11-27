import { Link } from "@remix-run/react";
import ReactMarkdown from "react-markdown";

type CommentProps = {
  avatarUrl: string;
  username: string;
  title: string;
};

export const Comment = ({ avatarUrl, username, title }: CommentProps) => {
  return (
    <div className="flex flex-col items-start">
      <div className="flex items-center">
        <img
          alt="User Avatar"
          className="rounded-full"
          height="30" // Adjust the size as needed
          src={avatarUrl}
          style={{
            aspectRatio: "1 / 1",
            objectFit: "cover",
          }}
          width="30"
        />
        <div className="ml-2">
          <Link prefetch="intent" replace to={`/profile/${username}`}>
            <div className="text-sm font-semibold">{username}</div>
          </Link>
        </div>
      </div>
      <div className="text-sm prose py-4">
        <ReactMarkdown>{title}</ReactMarkdown>
      </div>
    </div>
  );
};
