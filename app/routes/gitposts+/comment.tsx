import type { ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { getSupabaseWithSessionHeaders } from "~/lib/supabase.server";

export async function action({ request }: ActionFunctionArgs) {
  const { supabase, headers, session } = await getSupabaseWithSessionHeaders({
    request,
  });

  if (!session) {
    return redirect("/login", { headers });
  }

  const formData = await request.formData();
  const title = formData.get("title")?.toString();
  const userId = formData.get("userId")?.toString();
  const postId = formData.get("postId")?.toString();

  // A skipRevalidation of the routes you want during this action
  const skipRevalidation = ["/gitposts", "/profile.$username"];

  // Check if userId and tweetId are present
  if (!userId || !title || !postId) {
    return json(
      { error: "Post/user information missing", skipRevalidation },
      { status: 400, headers }
    );
  }

  const { error } = await supabase
    .from("comments")
    .insert({ user_id: userId, title, post_id: postId });

  if (error) {
    console.log("Error occured ", error);
    return json(
      { error: "Failed to post", skipRevalidation },
      { status: 500, headers }
    );
  }

  return json({ ok: true, error: null, skipRevalidation }, { headers });
}
