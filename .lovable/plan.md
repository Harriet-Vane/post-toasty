## Goal
Automatically add every email captured in the Share modal to an active (dynamic) list in HubSpot, using a custom contact property as the filter.

## Approach
HubSpot's active lists can't be written to directly via API — membership is defined by filters. Standard pattern: stamp new contacts with a custom property, then create the active list in HubSpot filtered on that property.

We'll extend the existing `createHubSpotContact` server function to set a custom property `posttoasty_subscriber = true` on every contact it creates or updates. Then you create the active list once in HubSpot.

## Changes

**1. Update `src/lib/hubspot.functions.ts`**
- Add a one-time bootstrap step (idempotent) that ensures the custom property `posttoasty_subscriber` (type: `enumeration`, single checkbox, values `true`/`false`) exists in the `contacts` object schema. It calls `GET /crm/v3/properties/contacts/posttoasty_subscriber`; on 404 it `POST`s to `/crm/v3/properties/contacts` to create it. Result cached in a module-level flag so we only hit it once per server instance.
- In the create-contact call, add `posttoasty_subscriber: "true"` to `properties`.
- When HubSpot returns `409 CONTACT_EXISTS`, parse the existing contact ID from the error body and `PATCH /crm/v3/objects/contacts/{id}` to set `posttoasty_subscriber: "true"` (so previously captured emails also flow into the list next time they submit).

**2. No changes to `src/routes/index.tsx`**
- The existing fire-and-forget `createHubSpotContact` call already covers the email capture flow.

## What you'll do in HubSpot (one-time, ~2 minutes)
After the first email flows through and the property is auto-created:
1. HubSpot → Contacts → Lists → Create list → **Active list**.
2. Filter: `Contact property` → `Posttoasty Subscriber` → `is equal to any of` → `true`.
3. Save. New PostToasty subscribers appear in the list automatically going forward, and existing contacts who re-submit get backfilled.

## Required HubSpot scopes
Your private-app token needs `crm.schemas.contacts.write` (to create the property) plus the existing `crm.objects.contacts.write`. If the property-creation call returns `MISSING_SCOPES`, regenerate the token with that scope and reconnect — I'll surface the exact error in server logs.

## What we're NOT doing
- Not calling the Lists API to add contacts directly (active lists don't support that; only static lists do, and you chose active).
- Not creating the list itself via API (HubSpot's v3 Lists API for creation is gated and brittle; the manual one-time setup is faster and more reliable).
- Not changing PostHog, the Submit button, or any UI copy.
