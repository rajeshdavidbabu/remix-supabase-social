import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect, json } from "@remix-run/node";
import { insertComment } from "~/lib/database.server";
import { getSupabaseWithSessionAndHeaders } from "~/lib/supabase.server";

export async function action({ request }: ActionFunctionArgs) {
  const { supabase, headers, serverSession } =
    await getSupabaseWithSessionAndHeaders({
      request,
    });

  if (!serverSession) {
    return redirect("/login", { headers });
  }

  const formData = await request.formData();
  const title = formData.get("title")?.toString();
  const postId = formData.get("postId")?.toString();
  const userId = formData.get("userId")?.toString();

  const skipRevalidation = ["gitposts", "profile.$username"];

  // Check if userId and tweetId are present
  if (!userId || !title || !postId) {
    return json(
      { error: "Post/user information missing" },
      { status: 400, headers }
    );
  }

  const { error } = await insertComment({
    dbClient: supabase,
    userId,
    postId,
    title,
  });

  if (error) {
    return json(
      { error: "Failed to comment", skipRevalidation },
      { status: 500, headers }
    );
  }

  return json({ ok: true, error: null, skipRevalidation }, { headers });
}
