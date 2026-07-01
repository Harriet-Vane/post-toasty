## Plan

1. **Fix existing-contact sync**
   - Update the HubSpot subscribe server function so a `409 Contact already exists` response is treated as a successful subscription update.
   - The current code only handles `409` when the response contains `CONTACT_EXISTS`, but HubSpot is returning `"Contact already exists. Existing ID: 9500"`, so the update path is being skipped.

2. **Add a safer fallback**
   - If HubSpot returns `409` but no contact ID can be parsed, search HubSpot by submitted email and PATCH that contact with `posttoasty_subscriber = true`.
   - Keep the current create-new-contact path for brand-new subscribers.

3. **Improve server logging**
   - Log whether the app created a new contact, updated an existing contact, or failed after create/search/patch.
   - Do not expose any email addresses or secrets in logs.

4. **Keep the front-end behavior unchanged**
   - The subscribe modal can still close immediately and show the toaster animation.
   - The backend sync will run in the background, but failures will be visible in server logs for debugging.

5. **Verify after implementation**
   - Test the HubSpot connector read path again.
   - Submit an existing-contact email and confirm logs show an existing contact was patched.
   - Submit a new test email and confirm logs show a new contact was created.

## Diagnosis

The scopes in your screenshot are correct, and the connected HubSpot read test now succeeds. The remaining blocker is in app code: HubSpot’s actual `409` response says `Contact already exists`, but the app is checking for `CONTACT_EXISTS`, so existing subscribers are not being stamped with `posttoasty_subscriber = true`.