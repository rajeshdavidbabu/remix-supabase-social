import { json, redirect } from "@remix-run/node";
import { type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

import { getSupabaseWithSessionHeaders } from "~/lib/supabase.server";

export let loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { postId } = params;
  const { headers, session } = await getSupabaseWithSessionHeaders({
    request,
  });

  if (!session) {
    return redirect("/login", { headers });
  }

  return json(
    {
      postId,
    },
    { headers }
  );
};

export default function Profile() {
  const { postId } = useLoaderData<typeof loader>();
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        navigate(-1);
        setOpen(open);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{postId}</DialogTitle>
          <DialogDescription>
            I am going to show the post information here. With a lot of comments
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
