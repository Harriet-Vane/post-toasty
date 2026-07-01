import { createServerFn } from "@tanstack/react-start";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/hubspot";
const SUBSCRIBER_PROPERTY = "posttoasty_subscriber";

let propertyEnsured = false;

function authHeaders(lovableKey: string, hubspotKey: string) {
  return {
    Authorization: `Bearer ${lovableKey}`,
    "X-Connection-Api-Key": hubspotKey,
    "Content-Type": "application/json",
  };
}

async function ensureSubscriberProperty(lovableKey: string, hubspotKey: string) {
  if (propertyEnsured) return;
  const headers = authHeaders(lovableKey, hubspotKey);

  try {
    const check = await fetch(
      `${GATEWAY_URL}/crm/v3/properties/contacts/${SUBSCRIBER_PROPERTY}`,
      { method: "GET", headers },
    );
    if (check.ok) {
      propertyEnsured = true;
      return;
    }
    if (check.status !== 404) {
      const body = await check.text();
      console.error("HubSpot property check failed", check.status, body);
      // Don't cache — retry next call.
      return;
    }

    const create = await fetch(`${GATEWAY_URL}/crm/v3/properties/contacts`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        name: SUBSCRIBER_PROPERTY,
        label: "PostToasty Subscriber",
        type: "enumeration",
        fieldType: "booleancheckbox",
        groupName: "contactinformation",
        description:
          "True when the contact submitted their email via the PostToasty share modal.",
        options: [
          { label: "True", value: "true", displayOrder: 0, hidden: false },
          { label: "False", value: "false", displayOrder: 1, hidden: false },
        ],
      }),
    });

    if (create.ok || create.status === 409) {
      propertyEnsured = true;
      return;
    }
    const body = await create.text();
    console.error("HubSpot property create failed", create.status, body);
  } catch (err) {
    console.error("HubSpot property ensure threw", err);
  }
}

function parseExistingId(bodyText: string): string | undefined {
  try {
    const parsed = JSON.parse(bodyText) as { message?: string };
    const match = parsed.message?.match(/Existing ID:\s*(\d+)/i);
    return match?.[1];
  } catch {
    return undefined;
  }
}

function isExistingContactConflict(status: number, bodyText: string) {
  return status === 409 && /contact\s+already\s+exists|CONTACT_EXISTS/i.test(bodyText);
}

async function findExistingContactId(
  email: string,
  lovableKey: string,
  hubspotKey: string,
) {
  const res = await fetch(`${GATEWAY_URL}/crm/v3/objects/contacts/search`, {
    method: "POST",
    headers: authHeaders(lovableKey, hubspotKey),
    body: JSON.stringify({
      filterGroups: [
        {
          filters: [
            {
              propertyName: "email",
              operator: "EQ",
              value: email,
            },
          ],
        },
      ],
      properties: ["email", SUBSCRIBER_PROPERTY],
      limit: 1,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("HubSpot contact search failed", res.status, body);
    return undefined;
  }

  const data = (await res.json()) as { results?: Array<{ id?: string }> };
  return data.results?.[0]?.id;
}

async function stampExistingContact(
  id: string,
  lovableKey: string,
  hubspotKey: string,
) {
  const res = await fetch(`${GATEWAY_URL}/crm/v3/objects/contacts/${id}`, {
    method: "PATCH",
    headers: authHeaders(lovableKey, hubspotKey),
    body: JSON.stringify({
      properties: { [SUBSCRIBER_PROPERTY]: "true" },
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    console.error("HubSpot contact PATCH failed", res.status, body);
    return false;
  }
  console.info("HubSpot existing contact stamped as subscriber");
  return true;
}

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

    await ensureSubscriberProperty(lovableKey, hubspotKey);

    try {
      const res = await fetch(`${GATEWAY_URL}/crm/v3/objects/contacts`, {
        method: "POST",
        headers: authHeaders(lovableKey, hubspotKey),
        body: JSON.stringify({
          properties: {
            email: data.email,
            [SUBSCRIBER_PROPERTY]: "true",
          },
        }),
      });

      if (res.ok) {
        console.info("HubSpot contact created as subscriber");
        return { ok: true as const, existed: false };
      }

      const bodyText = await res.text();
      if (isExistingContactConflict(res.status, bodyText)) {
        const id = parseExistingId(bodyText) ?? (await findExistingContactId(data.email, lovableKey, hubspotKey));
        if (id) {
          const stamped = await stampExistingContact(id, lovableKey, hubspotKey);
          return { ok: stamped, existed: true, reason: stamped ? undefined : "patch_failed" };
        }
        console.error("HubSpot existing contact ID could not be resolved");
        return { ok: false as const, existed: true, reason: "existing_id_not_found" };
      }

      console.error("HubSpot contact create failed", res.status, bodyText);
      return { ok: false as const, reason: `http_${res.status}` };
    } catch (err) {
      console.error("HubSpot contact create threw", err);
      return { ok: false as const, reason: "exception" };
    }
  });
