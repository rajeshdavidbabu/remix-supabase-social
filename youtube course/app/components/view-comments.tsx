import { Link } from "@remix-run/react";
import { MessageCircle } from "lucide-react";

type ViewCommentsProps = {
  comments: number;
  pathname: string;
  readonly?: boolean;
};

export const ViewComments = ({
  comments,
  pathname,
  readonly,
}: ViewCommentsProps) => {
  return (
    <>
      {readonly ? (
        <div className="flex justify-center items-center group">
          <MessageCircle className="h-4 w-4 text-gray-500" />
          <span className="ml-2 text-sm text-gray-500">{comments}</span>
        </div>
      ) : (
        <Link to={pathname} className="flex justify-center items-center group">
          <MessageCircle className="h-4 w-4 text-gray-500 group-hover:text-green-400" />
          <span
            className={`ml-2 text-sm  text-gray-500 group-hover:text-green-400`}
          >
            {comments}
          </span>
        </Link>
      )}
    </>
  );
};
