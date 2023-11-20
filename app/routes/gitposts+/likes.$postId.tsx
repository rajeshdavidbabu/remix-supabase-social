import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect, json } from "@remix-run/node";
import { getSupabaseWithSessionHeaders } from "~/lib/supabase.server";

export let loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { postId } = params;
  const { supabase, headers, session } = await getSupabaseWithSessionHeaders({
    request,
  });

  if (!session) {
    return redirect("/login", { headers });
  }

  if (!postId) {
    return json({ error: "PostId is missing" }, { status: 400, headers });
  }

  const { count, error: countError } = await supabase
    .from("likes")
    .select("*", { count: "exact" })
    .eq("post_id", postId);

  if (countError) {
    return json(
      { error: "Failed to get recent likes" },
      { status: 500, headers }
    );
  }

  return json({ ok: true, error: null, count }, { headers });
};
