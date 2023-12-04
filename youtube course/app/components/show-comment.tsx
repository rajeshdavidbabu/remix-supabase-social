import { Link } from "@remix-run/react";
import { Avatar, AvatarImage } from "./ui/avatar";
import ReactMarkdown from "react-markdown";

type CommentProps = {
  avatarUrl: string;
  username: string;
  title: string;
};

export const ShowComment = ({ avatarUrl, username, title }: CommentProps) => {
  return (
    <div className="flex flex-col items-start">
      <div className="flex items-center">
        <Avatar className="w-8 h-8">
          <AvatarImage src={avatarUrl} />
        </Avatar>
        <div className="ml-2">
          <Link to={`/profile/${username}`}>
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
