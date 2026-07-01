## Problem
The `posttoasty_subscriber` contact property is created lazily on the first email submission, so it doesn't exist in HubSpot yet — meaning you can't build the active list.

## Fix
Create the property right now via a one-off gateway call from the sandbox (using the existing HubSpot connection), no code changes and no test submission needed.

## Steps
1. Call HubSpot through the connector gateway: `POST /crm/v3/properties/contacts` with the `posttoasty_subscriber` enumeration/booleancheckbox definition (same payload the server function uses).
2. Verify with `GET /crm/v3/properties/contacts/posttoasty_subscriber` → expect 200.
3. If it returns `MISSING_SCOPES`, stop and tell you to regenerate the HubSpot private-app token with `crm.schemas.contacts.write` and reconnect.
4. Once it exists, you build the active list in HubSpot: Contacts → Lists → Create list → Active list → filter `Posttoasty Subscriber is equal to any of: true`.

## Not doing
- No code changes — the lazy-ensure logic in `src/lib/hubspot.functions.ts` stays as a safety net.
- Not creating the list itself via API.
