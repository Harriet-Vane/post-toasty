## 1. Root cause of the error

OpenAI's structured-output mode requires every object property to appear in `required`. In `src/lib/toast-chat.functions.ts` the custom-ingredient variant has `accent: z.string().regex(...).optional()`, which compiles to a JSON schema where `accent` is in `properties` but not in `required`. The gateway rejects it with:

> Invalid schema for response_format 'response': … 'required' is required to be supplied and to be an array including every key in properties. Missing 'accent'.

**Fix:** make `accent` required but nullable — `z.string().regex(...).nullable()` — and update the system prompt to say "return null when no accent". On the client, treat `accent: null` as undefined when registering the custom topping.

## 2. Rename Toast Oracle → Toast Angel everywhere

- Rename file `src/components/ToastOracle.tsx` → `src/components/ToastAngel.tsx`; rename exported component `ToastOracle` → `ToastAngel`.
- Update import + JSX usage in `src/routes/index.tsx`.
- Update PostHog events: `oracle_message_sent` → `angel_message_sent`, `oracle_stack_applied` → `angel_stack_applied`, `oracle_feedback` → `angel_feedback`.
- Update server distinct_id `server:toast-oracle` → `server:toast-angel` and the system prompt line "You are the toast oracle…" → "You are Toast Angel…".
- Update all user-visible strings (toasts, fallback messages, console tags) to say "Toast Angel".

## 3. Friendlier, human error messages

Centralize friendly copy and surface it in both the chat transcript and the sonner toast. Examples:

- Schema/validation failure → "Sorry, that message got stuck in my toaster. Care to try again?"
- Network/throw → "Looks like the toaster unplugged itself. Try again?"
- 429 rate limit → "Too many slices at once — give me a sec and try again."
- 402 credits → "The toaster's out of tokens for now. Try again later."
- Missing API key / 500 → "Something burned in the back. Try again in a minute."

Implementation: small `friendlyError(result | errorObj)` helper in `ToastAngel.tsx` that maps `result.error` / thrown error text to one of the above. Use it for both the in-chat assistant bubble and the sonner toast. Keep the raw error in `console.error` for debugging and still send it to PostHog via the existing `$ai_generation` event.

## 4. Files touched

- `src/lib/toast-chat.functions.ts` — schema fix (`accent` nullable + required), prompt rename, distinct_id rename.
- `src/components/ToastAngel.tsx` (renamed from `ToastOracle.tsx`) — component rename, friendly error helper, accept `accent: null`.
- `src/routes/index.tsx` — import + JSX rename.

No DB, no new packages, no UI layout changes.