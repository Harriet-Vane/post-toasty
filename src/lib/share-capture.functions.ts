import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const inputSchema = z.object({
  email: z.string().trim().email().max(255),
  marketingOptIn: z.boolean(),
  breadId: z.string().max(64).optional(),
  toppingIds: z.array(z.string().max(64)).max(50).optional(),
  recipeName: z.string().max(200).optional(),
  shareUrl: z.string().url().max(500).optional(),
  userAgent: z.string().max(500).optional(),
  referrer: z.string().max(500).optional(),
});

type HubspotResult = { ok: true } | { ok: false; error: string };

async function syncToHubspot(payload: {
  email: string;
  marketingOptIn: boolean;
  recipeName?: string;
  shareUrl?: string;
}): Promise<HubspotResult> {
  const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
  const HUBSPOT_API_KEY = process.env.HUBSPOT_API_KEY;
  if (!LOVABLE_API_KEY || !HUBSPOT_API_KEY) {
    return { ok: false, error: "HubSpot connector not configured" };
  }

  const GATEWAY = "https://connector-gateway.lovable.dev/hubspot";
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${LOVABLE_API_KEY}`,
    "X-Connection-Api-Key": HUBSPOT_API_KEY,
  };

  const properties: Record<string, string> = {
    email: payload.email,
    source_app: "PostToast",
    hs_lead_status: "NEW",
  };
  if (payload.marketingOptIn) properties.lifecyclestage = "subscriber";
  if (payload.recipeName) properties.recent_toast_name = payload.recipeName;
  if (payload.shareUrl) properties.recent_toast_url = payload.shareUrl;

  // Upsert by email: try create, fall back to update on 409.
  const createRes = await fetch(`${GATEWAY}/crm/v3/objects/contacts`, {
    method: "POST",
    headers,
    body: JSON.stringify({ properties }),
  });

  if (createRes.status === 409) {
    const updateRes = await fetch(
      `${GATEWAY}/crm/v3/objects/contacts/${encodeURIComponent(payload.email)}?idProperty=email`,
      {
        method: "PATCH",
        headers,
        body: JSON.stringify({ properties }),
      },
    );
    if (!updateRes.ok) {
      const body = await updateRes.text();
      return { ok: false, error: `HubSpot update ${updateRes.status}: ${body.slice(0, 300)}` };
    }
    return { ok: true };
  }

  if (!createRes.ok) {
    const body = await createRes.text();
    return { ok: false, error: `HubSpot create ${createRes.status}: ${body.slice(0, 300)}` };
  }
  return { ok: true };
}

export const captureShareEmail = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const hubspot = await syncToHubspot({
      email: data.email,
      marketingOptIn: data.marketingOptIn,
      recipeName: data.recipeName,
      shareUrl: data.shareUrl,
    });

    if (!hubspot.ok) {
      console.error("[share-capture] HubSpot sync failed:", hubspot.error);
    }

    const { error } = await supabaseAdmin.from("share_email_captures").insert({
      email: data.email,
      marketing_opt_in: data.marketingOptIn,
      bread_id: data.breadId ?? null,
      topping_ids: data.toppingIds ?? null,
      recipe_name: data.recipeName ?? null,
      share_url: data.shareUrl ?? null,
      user_agent: data.userAgent ?? null,
      referrer: data.referrer ?? null,
      hubspot_synced: hubspot.ok,
      hubspot_error: hubspot.ok ? null : hubspot.error,
    });

    if (error) {
      console.error("[share-capture] insert failed:", error);
      // Don't fail the user's share flow on a storage error.
    }

    return { ok: true };
  });
