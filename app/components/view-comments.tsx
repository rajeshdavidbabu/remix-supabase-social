import { Link, useNavigation } from "@remix-run/react";
import { Loader2, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";

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
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (navigation.location?.pathname === pathname) {
      setIsLoading(navigation.state !== "idle");
    } else {
      setIsLoading(false);
    }
  }, [navigation, pathname]);

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
          <MessageCircle className="h-4 w-4 text-green-700 group-hover:text-green-400 group-hover:fill-green-400" />
          {isLoading ? (
            <Loader2 className="ml-2 h-4 w-4 animate-spin" />
          ) : (
            <span className="ml-2 text-sm text-green-700 group-hover:text-green-400">
              {number}
            </span>
          )}
        </Link>
      )}
    </>
  );
}
