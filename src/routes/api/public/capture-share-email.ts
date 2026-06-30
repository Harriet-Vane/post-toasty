import { createFileRoute } from "@tanstack/react-router";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const Route = createFileRoute("/api/public/capture-share-email")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: {
          email?: unknown;
          bread_id?: unknown;
          recipe_name?: unknown;
          share_url?: unknown;
          topping_ids?: unknown;
          marketing_opt_in?: unknown;
        };
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "Invalid JSON" }, { status: 400 });
        }

        const email = typeof body.email === "string" ? body.email.trim() : "";
        if (!email || !EMAIL_RE.test(email)) {
          return Response.json({ error: "Invalid email" }, { status: 400 });
        }

        // Dynamically import the server-only client so the service role key
        // never leaks into the client bundle — see client.server.ts.
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        // hubspot_synced is left false; the actual HubSpot sync isn't wired up
        // yet, so these rows are the queue a future sync job would drain.
        const { error } = await supabaseAdmin.from("share_email_captures").insert({
          email,
          bread_id: typeof body.bread_id === "string" ? body.bread_id : null,
          recipe_name: typeof body.recipe_name === "string" ? body.recipe_name : null,
          share_url: typeof body.share_url === "string" ? body.share_url : null,
          topping_ids: Array.isArray(body.topping_ids)
            ? (body.topping_ids.filter((t) => typeof t === "string") as string[])
            : null,
          marketing_opt_in: body.marketing_opt_in === true,
          referrer: request.headers.get("referer"),
          user_agent: request.headers.get("user-agent"),
          hubspot_synced: false,
        });

        if (error) {
          return Response.json({ error: error.message }, { status: 500 });
        }

        return Response.json({ ok: true });
      },
    },
  },
});
