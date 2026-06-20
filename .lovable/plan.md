## Goal
When someone shares their toast via the Email button, capture their email address, store it in the app's database, and push it into your HubSpot account tagged as a PostToast contact.

## UX flow
1. On the share screen, the **Email** button no longer immediately opens the mail client.
2. Clicking it swaps the share modal content for a tiny inline form:
   - One field: "Your email"
   - Small consent line: "We'll add you to PostToast updates. Unsubscribe anytime." + checkbox (default checked)
   - Buttons: **Continue to email** / **Cancel**
3. On submit:
   - Email is validated client-side (zod).
   - We POST it to a server function which stores it and forwards to HubSpot.
   - Then we open the existing `mailto:` link so the user sends the toast from their own mail client as today.
4. The other share buttons (LinkedIn, Facebook, Threads) are unchanged.

## Where it's stored
A new table in Lovable Cloud: `share_email_captures`
- `id` uuid pk
- `email` citext, not null
- `marketing_opt_in` boolean
- `bread_id`, `topping_ids` text[], `recipe_name` text, `share_url` text — context about the toast they shared
- `user_agent`, `referrer`, `created_at`
- RLS: inserts only via the server function using the service role; no anon/auth read access. Unique index on `email` is **not** added — we want one row per share event for analytics; HubSpot dedupes by email upstream.

## HubSpot sync
- Use the existing HubSpot connector via the Lovable connector gateway (no key handling in code).
- If you haven't connected HubSpot to this project yet, I'll prompt the connect flow on first build.
- On each capture, the server function calls HubSpot's "create or update contact" endpoint (`/crm/v3/objects/contacts/upsert` keyed on email), setting:
  - `email`
  - `lifecyclestage`: `subscriber` (only if opt-in checked)
  - `hs_lead_status`: `NEW`
  - Custom property `source_app`: `PostToast` — so you can segment in HubSpot
  - `recent_toast_name`, `recent_toast_url` — last shared toast
- Contact is also added to a HubSpot **static list** named "PostToast Shares" (created on first run if missing) so you have an easy filter / workflow trigger.
- Failures to reach HubSpot do **not** block the user — we always still open their mail client. Errors are logged server-side and the DB row is marked `hubspot_synced=false` for retry.

## Tagging strategy in HubSpot
Two complementary tags so you can slice either way:
- Contact property `source_app = PostToast` (durable, queryable in any view/workflow).
- Membership in the static list "PostToast Shares" (easy UI filter + enrollment trigger for sequences/workflows).

## Privacy / compliance notes
- The consent checkbox controls `marketing_opt_in`. When unchecked, we still store the email and create the HubSpot contact with `source_app=PostToast`, but we do NOT set `lifecyclestage=subscriber` and do NOT add them to the static list.
- We capture only the sharer's email — never the friend's, since `mailto:` keeps the recipient on the user's device.

## Implementation steps
1. **Migration**: create `public.share_email_captures` with the columns above, grants for `service_role` only, RLS enabled, no public policies.
2. **Server function** `captureShareEmail` (`src/lib/share-capture.functions.ts`):
   - Zod-validates input.
   - Inserts row via `supabaseAdmin` (loaded inside handler).
   - Calls HubSpot gateway: upsert contact + add to list. Updates `hubspot_synced` flag.
   - Returns `{ ok: true }` even on HubSpot failure (logs error) so UI never blocks the share.
3. **HubSpot connector**: trigger `standard_connectors--connect` with `hubspot` on first build if not already linked.
4. **UI** (`src/routes/index.tsx`):
   - New `EmailCaptureForm` rendered inside the share modal when the user clicks Email.
   - On submit → call `captureShareEmail` → then `window.location.href = emailHref`.
   - PostHog event `share_email_captured` with `opt_in` flag.

## Files touched
- New: `supabase/migrations/<ts>_share_email_captures.sql`
- New: `src/lib/share-capture.functions.ts`
- Edit: `src/routes/index.tsx` (share modal Email button → form)

## Out of scope (can do later if you want)
- Retry job for rows with `hubspot_synced=false`.
- Capturing the recipient's email by switching to server-sent emails (Lovable Emails / Resend) instead of `mailto:`.
- Double opt-in confirmation email.
