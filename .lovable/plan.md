## TL;DR — the keys are fine

Both `LOVABLE_API_KEY` and `HUBSPOT_API_KEY` are already set in the deployment environment:

- `LOVABLE_API_KEY` — auto-provisioned by Lovable. You never set this yourself; it's the same key in preview and production.
- `HUBSPOT_API_KEY` — injected automatically by the linked **Beth's HubSpot** connector (status: linked, has access, gateway-enabled). It goes to preview and production together — there is no separate "prod key" to paste in.

So the sync failures are not a missing-key problem. Server logs show two real errors from HubSpot itself.

## What's actually breaking

From the last hour of server logs (every subscribe attempt):

1. **403 on property check** — `You do not have permissions to view object type CONTACT (requires one of [contacts-read])`. The HubSpot private-app token behind the connector was created without the CRM contacts scopes.
2. **400 on contact create** — `Property "hs_lead_source" does not exist`. Your portal doesn't have that property, so every create is rejected. (One older log line shows a 409 "Contact already exists. Existing ID: 9500" — that one email got through before the property-name change; nothing new is landing.)

## Fix plan

**Step 1 — Regenerate the HubSpot private-app token with the right scopes, then reconnect.**
In HubSpot: Settings → Integrations → Private Apps → your app → Scopes, enable at minimum:
- `crm.objects.contacts.read`
- `crm.objects.contacts.write`
- `crm.schemas.contacts.read`
- `crm.schemas.contacts.write` (so we can auto-create the `posttoasty_subscriber` property)

Generate a new access token, then in Lovable → Connectors → Beth's HubSpot → Reconnect and paste the new token. No code change, no env var change.

**Step 2 — Stop sending `hs_lead_source`.**
Edit `src/lib/hubspot.functions.ts` to drop the `hs_lead_source` field from the contact-create payload (and from the existing-contact PATCH). We'll keep `posttoasty_subscriber = true` as the marker for subscribers from the share modal; the source string isn't worth blocking every sync over. Only change in the file:

```ts
properties: {
  email: data.email,
  [SUBSCRIBER_PROPERTY]: "true",
},
```

**Step 3 — Verify.**
After the reconnect + code change deploys, submit a test email from the published site and confirm:
- Server logs show no 403/400 from HubSpot.
- The contact appears in HubSpot with `posttoasty_subscriber = true`.

## Where to actually set secrets (for future reference)

- Connector-managed secrets (like `HUBSPOT_API_KEY`): **Connectors** in the Lovable sidebar → pick the connection → Reconnect. Not editable via a secrets panel.
- `LOVABLE_API_KEY`: managed by Lovable, not editable. If it ever needs rotating, I can do that with a tool call.
- Your own secrets (Anthropic keys, webhook secrets, etc.): **Project Settings → Secrets**, or ask me and I'll open a secure form.
