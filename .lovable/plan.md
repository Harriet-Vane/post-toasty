## Goal
When a user submits their email in the Share modal, also send it to your HubSpot account as a contact (in addition to the existing PostHog `identify` + `share_email_captured` event).

## Approach
Your workspace already has **Beth's HubSpot** connected via the Lovable connector gateway, so no new API keys or OAuth setup needed. HubSpot's `HUBSPOT_API_KEY` env var is already available server-side.

We'll call HubSpot's `POST /crm/v3/objects/contacts` through the gateway from a new server function so the API key never touches the browser.

## Changes

**1. New server function: `src/lib/hubspot.functions.ts`**
- `createHubSpotContact` — public (no auth middleware, since sharers aren't logged-in users).
- Validates `{ email, source?: string }` with a simple email regex.
- POSTs to `https://connector-gateway.lovable.dev/hubspot/crm/v3/objects/contacts` with headers `Authorization: Bearer ${LOVABLE_API_KEY}` and `X-Connection-Api-Key: ${HUBSPOT_API_KEY}`.
- Body: `{ properties: { email, lifecyclestage: "subscriber", hs_lead_source: "PostToast share modal" } }`.
- Handles the `409 CONTACT_EXISTS` response as success (idempotent — same email submitting again is fine).
- Returns `{ ok: true, existed?: boolean }`; on other errors, returns `{ ok: false }` (never throws to the client — email capture is best-effort and shouldn't block the toast).

**2. Wire it into `src/routes/index.tsx`**
- Inside `captureShareEmail(method)`, after the existing PostHog calls, fire-and-forget `createHubSpotContact({ data: { email, source: method } })`.
- Wrap in `.catch(() => {})` so a HubSpot outage never breaks the UI or the "Thanks! You're the toastiest." toast.

## Scope required (heads-up)
Your HubSpot key must have `crm.objects.contacts.write`. If the first call returns `MISSING_SCOPES`, you'll need to regenerate the HubSpot private-app token with that scope and reconnect — Lovable can't grant provider scopes for you.

## What we're NOT doing
- No custom HubSpot list assignment, workflows, or property mapping beyond `email` + lead source. Easy to add later if you want.
- Not touching the existing `share_email_captures` table or PostHog wiring.
- No changes to the Submit button, toast copy, or modal layout.
