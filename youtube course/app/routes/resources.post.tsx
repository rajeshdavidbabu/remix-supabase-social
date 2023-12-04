import type { ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { getSupabaseWithSessionAndHeaders } from "~/lib/supabase.server";
import { createPost } from "~/lib/database.server";

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
  const userId = formData.get("userId")?.toString();

  // Check if userId and tweetId are present
  if (!userId || !title) {
    return json(
      { error: "Post/user information missing" },
      { status: 400, headers }
    );
  }

  const { error } = await createPost({ dbClient: supabase, userId, title });

  if (error) {
    console.log("Error occured ", error);

    return json({ error: "Failed to post" }, { status: 500, headers });
  }

  return json({ ok: true, error: null }, { headers });
}
