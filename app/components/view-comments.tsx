import { Link } from "@remix-run/react";
import { MessageCircle } from "lucide-react";

type ViewCommentsProps = {
  number: number;
  pathname: string;
  readonly?: boolean;
};

export function ViewComments({
  number,
  pathname,
  readonly,
}: ViewCommentsProps) {
  return (
    <>
      {readonly ? (
        <div className="flex justify-center items-center group">
          <MessageCircle className="h-4 w-4 text-gray-500" />
          <span className="ml-2 text-sm text-gray-500">{number}</span>
        </div>
      ) : (
        <Link
          to={pathname}
          preventScrollReset={true}
          className="flex justify-center items-center group"
        >
          <MessageCircle className="h-4 w-4 text-gray-500 group-hover:text-green-400" />

          <span className="ml-2 text-sm text-gray-500 group-hover:text-green-400">
            {number}
          </span>
        </Link>
      )}
    </>
  );
}
