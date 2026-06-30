import { createFileRoute } from "@tanstack/react-router";

// Accepts a PNG data URL from the client and stores it in the public
// `toast-cards` bucket at a deterministic path. Public route — anyone can
// upload, so we constrain the key shape, content type, and size.

const KEY_RE = /^[a-z0-9]{1,16}$/;
const MAX_BYTES = 2 * 1024 * 1024; // 2 MB

export const Route = createFileRoute("/api/public/upload-card")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: { key?: unknown; dataUrl?: unknown };
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "Invalid JSON" }, { status: 400 });
        }

        const key = typeof body.key === "string" ? body.key : "";
        const dataUrl = typeof body.dataUrl === "string" ? body.dataUrl : "";

        if (!KEY_RE.test(key)) {
          return Response.json({ error: "Invalid key" }, { status: 400 });
        }

        const match = dataUrl.match(/^data:image\/png;base64,(.+)$/);
        if (!match) {
          return Response.json({ error: "Expected PNG data URL" }, { status: 400 });
        }

        const bytes = Buffer.from(match[1], "base64");
        if (bytes.byteLength === 0 || bytes.byteLength > MAX_BYTES) {
          return Response.json({ error: "Bad image size" }, { status: 400 });
        }

        const { createClient } = await import("@supabase/supabase-js");
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY;
        if (!supabaseUrl || !supabaseKey) {
          return Response.json({ error: "Supabase env not configured" }, { status: 500 });
        }
        const client = createClient(supabaseUrl, supabaseKey, {
          auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
        });
        const path = `cards/${key}.png`;

        const { error } = await client.storage
          .from("toast-cards")
          .upload(path, bytes, {
            contentType: "image/png",
            upsert: true,
            cacheControl: "public, max-age=31536000, immutable",
          });

        if (error) {
          console.error("[upload-card] storage upload failed", error);
          return Response.json({ error: error.message }, { status: 500 });
        }

        const { data } = client.storage
          .from("toast-cards")
          .getPublicUrl(path);

        return Response.json({ url: data.publicUrl });
      },
    },
  },
});
