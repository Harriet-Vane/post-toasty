import { createServerFn } from "@tanstack/react-start";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/hubspot";

export const createHubSpotContact = createServerFn({ method: "POST" })
  .inputValidator((data: { email: string; source?: string }) => {
    if (!data || typeof data.email !== "string") throw new Error("Invalid input");
    const email = data.email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Invalid email");
    return { email, source: typeof data.source === "string" ? data.source : undefined };
  })
  .handler(async ({ data }) => {
    const lovableKey = process.env.LOVABLE_API_KEY;
    const hubspotKey = process.env.HUBSPOT_API_KEY;
    if (!lovableKey || !hubspotKey) {
      return { ok: false as const, reason: "not_configured" };
    }

    try {
      const res = await fetch(`${GATEWAY_URL}/crm/v3/objects/contacts`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${lovableKey}`,
          "X-Connection-Api-Key": hubspotKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          properties: {
            email: data.email,
            hs_lead_source: data.source
              ? `PostToast share modal (${data.source})`
              : "PostToast share modal",
          },
        }),
      });

      if (res.ok) return { ok: true as const, existed: false };

      const bodyText = await res.text();
      // HubSpot returns 409 with CONTACT_EXISTS when the email is already a contact.
      if (res.status === 409 && /CONTACT_EXISTS/i.test(bodyText)) {
        return { ok: true as const, existed: true };
      }

      console.error("HubSpot contact create failed", res.status, bodyText);
      return { ok: false as const, reason: `http_${res.status}` };
    } catch (err) {
      console.error("HubSpot contact create threw", err);
      return { ok: false as const, reason: "exception" };
    }
  });
