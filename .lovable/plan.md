## Goal

Add a "Describe your toast" chat panel inside the builder (Step 2) that lets the user type natural-language requests like *"PB&J but make it spicy"* or *"a fancy ricotta toast with figs and basil"*. The AI responds by:

1. Picking a bread (if the user mentioned one).
2. Returning an ordered ingredient stack — using existing library ingredients when possible, and inventing new ones (with name, color, render type, emoji) when needed.
3. Optionally adding a short chat reply ("Loaded a peanut butter + sriracha + banana stack — want it crunchier?").

The user keeps chatting to refine until they hit "Lock it in." Custom ingredients render with the existing BreadCanvas primitives (spread / drizzle / scatter / leaf / etc.) — no on-the-fly image generation.

PostHog AI observability captures each model call (model, tokens, latency, cost, and the user's follow-up sentiment via thumbs).

## UX

Builder Step 2 layout changes from a 3-column grid to a 4-column grid on desktop (`[chat | spreads | canvas | extras]`); on mobile the chat collapses into a button at the top that expands a sheet.

Chat panel:

- Header: "Ask Toast Angel" with the angel sprite.
- Transcript with user/assistant bubbles (assistant uses no background; user bubble uses `--toast-crust` / `--paper`).
- Composer: textarea + send button. `Enter` sends, `Shift+Enter` newlines.
- Below each assistant reply: 👍 / 👎 buttons (fires `$ai_feedback` with PostHog AI's standard shape so sentiment shows up in observability).
- Status line: "Thinking…" while streaming/awaiting.
- When the model returns a stack, it's applied immediately to `breadId` + `toppings`; canvas updates live. A small "Replaced 4 ingredients" toast confirms it.

Custom ingredients in the stack chip list render with their AI-chosen emoji and name, same UI as library ingredients.

## Technical Plan

### 1. Custom topping registry

`src/lib/customToppings.ts`:

- Module-level `Map<ToppingId, Topping>` for AI-invented ingredients.
- `registerCustomTopping(t: Topping)` / `getCustomTopping(id)`.
- IDs are prefixed `ai_<slug>_<shortHash>` to avoid colliding with the library.

`src/lib/runchbase.ts`:

- `getTopping()` falls back to `getCustomTopping(id)` when the library lookup misses. This is the only change needed for `BreadCanvas`, `generateName`, `generateRecipe`, etc. to render custom ingredients.

### 2. AI server function

`src/lib/toast-chat.functions.ts` — `chatToastBuilder` server fn (`createServerFn POST`):

Input (Zod):

```ts
{
  messages: { role: "user"|"assistant"; content: string }[],
  currentBread: BreadId,
  currentToppings: { id: string; name: string }[]
}
```

Handler:

- Model: `openai/gpt-5-mini` via the existing `createLovableAiGatewayProvider`.
- System prompt explains the PostToast world, the available bread IDs, the full library of topping IDs/names, and the rules for inventing new ingredients.
- `generateText` with `Output.object({ schema })` where schema is:
  ```ts
  {
    reply: string,            // 1–2 short sentences for the chat
    breadId: BreadId,
    stack: Array<{
      kind: "library", id: ToppingId
    } | {
      kind: "custom",
      name: string,
      side: "spread"|"extra",
      render: "spread"|"drizzle"|"scatter"|"banana"|"egg"|,
      color: string,          // hex
      accent?: string,        // hex
      emoji: string,          // single emoji
    }>
  }
  ```
- After the call, emit a PostHog `$ai_generation` event server-side via a lightweight `fetch` to PostHog's capture API (project key already in `src/lib/posthog.ts` — move it to a shared const), with properties: `$ai_model`, `$ai_provider`, `$ai_input` (messages), `$ai_output_choices`, `$ai_input_tokens`, `$ai_output_tokens`, `$ai_latency`, `$ai_trace_id` (uuid returned to client so feedback can be linked), `$ai_http_status`. This is PostHog's documented LLM observability event shape — it powers cost/latency/sentiment dashboards.
- Returns `{ reply, breadId, stack, traceId, error }` to the client.

### 3. Client chat panel

`src/components/ToastOracle.tsx`:

- Props: `breadId`, `toppings`, `onApplyStack(breadId, ToppingId[])`.
- Local `messages` state (in-memory only — no persistence; matches the rest of the app).
- On send: call the server fn via `useServerFn`, append assistant reply, register any custom ingredients into the runtime registry, then call `onApplyStack`.
- 👍/👎 buttons call `posthog.capture("$ai_feedback", { $ai_trace_id, $ai_feedback: 1|-1 })`.
- Errors (429 / 402 / generic) surface as a sonner toast and an inline assistant message.

### 4. Wire into BuilderScreen

`src/routes/index.tsx`:

- In step 2, add `<ToastOracle … />` as a new left column.
- `onApplyStack` calls `setBreadId` and `setToppings` directly.
- Track `oracle_message_sent`, `oracle_stack_applied`, `oracle_feedback` for product analytics (separate from `$ai_*` observability events).

### 5. No changes needed to

- `BreadCanvas` (custom toppings render through the existing `Topping.render` switch).
- Recipe AI / share card (recipes naturally reference custom ingredient names because they're in `getTopping`).
- Database / auth (this feature is fully client + serverless; no persistence requested).

## Out of scope (call out for follow-ups)

- Actual sprite/image generation for custom ingredients (you chose primitives-only).
- Saving chat history across sessions.
- Streaming the assistant reply token-by-token — first version waits for the full structured response, which is simpler and fine for short replies.