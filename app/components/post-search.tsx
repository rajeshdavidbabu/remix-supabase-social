import { Form, useSubmit } from "@remix-run/react";
import { Input } from "./ui/input";
import { useState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";

export function PostSearch({
  searchQuery,
  isSearching,
}: {
  searchQuery: string | null;
  isSearching: boolean;
}) {
  const [query, setQuery] = useState(searchQuery || "");
  const submit = useSubmit();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    setQuery(query || "");
  }, [query]);

  useEffect(() => {
    // Only cleanup required for the timeout
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [timeoutRef]);

  return (
    <div className="flex justify-between items-center my-3">
      <h2 className="md:text-xl font-heading font-semibold w-7/12">
        {query ? `Results for "${query}"` : "All posts"}
      </h2>
      <div className="w-1/12 flex justify-center">
        {isSearching && <Loader2 className="h-4 w-4 animate-spin" />}
      </div>
      <Form
        role="search"
        ref={formRef}
        id="search-form"
        className="w-4/12 flex"
        onChange={() => {
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }

          timeoutRef.current = setTimeout(() => {
            if (formRef.current) {
              // This form submit updates the query information
              submit(formRef.current);
            } else {
              console.error("Your code sucks!!");
            }
          }, 300);
        }}
      >
        <Input
          type="search"
          // The form GET adds this information to query ?query="NAME"
          name="query"
          value={query}
          onChange={(event) => setQuery(event.currentTarget.value)}
          placeholder="Search posts..."
        />
      </Form>
    </div>
  );
}
