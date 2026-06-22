## What we're building

Two things, both leaning on Lovable's built-in capabilities so no secrets need to be added:

1. **AI-powered toast recipe** via Lovable AI Gateway (Claude), called server-side from the share screen.
2. **PostHog key events** layered on the existing autocapture setup, including a `$ai_generation` event to populate PostHog's AI Observability dashboard.

No new secrets required:
- `LOVABLE_API_KEY` is already provisioned and powers Claude through the gateway.
- The PostHog project key (`phc_...`) is publishable and lives in client code (already wired — I'll swap in the new key you provided).

---

## 1. AI recipe generator (Claude via Lovable AI Gateway)

**Where it fires:** `ShareScreen` in `src/routes/index.tsx` currently computes the recipe synchronously via `generateRecipe(breadId, toppings)` from `src/lib/runchbase.ts`. We'll replace that with a server-side AI call that returns both a recipe name and step-by-step instructions.

**Server function** — new file `src/lib/recipe-ai.functions.ts`:
- `createServerFn({ method: "POST" })` with Zod validator for `{ breadId, toppingIds, salted }`.
- Uses the AI SDK + `@ai-sdk/openai-compatible` pointed at `https://ai.gateway.lovable.dev/v1`, sending `Lovable-API-Key: process.env.LOVABLE_API_KEY` and `X-Lovable-AIG-SDK: vercel-ai-sdk`.
- Model: `anthropic/claude-sonnet-4.5` (Claude via the gateway). Falls back to `google/gemini-3-flash-preview` if Claude isn't available on the workspace.
- Uses `generateText` with `Output.object({ schema: z.object({ name: z.string(), steps: z.array(z.string()).min(3).max(8) }) })` for structured output.
- System prompt: playful, irreverent toast-chef persona that names the toast in the `[ingredient], revisited` style established earlier and writes multi-step instructions referencing the actual bread + toppings. Includes a handful of easter-egg triggers (e.g. all-salt builds, single-topping minimalism, butter+honey combo) baked into the prompt.
- Measures latency (`performance.now()` around the gateway call) and reads token usage from the AI SDK `result.usage` (`promptTokens`, `completionTokens`, `totalTokens`).
- Returns `{ name, steps, model, latencyMs, usage }`. On error, returns `{ name: null, steps: null, error }` so the client can fall back to the existing rule-based `generateName` / `generateRecipe`.

**Server helper** — new file `src/lib/ai-gateway.server.ts`:
- Exports `createLovableAiGatewayProvider(apiKey)` per the gateway pattern (custom `fetch` wrapper that propagates `X-Lovable-AIG-Run-ID`).
- Server-only; imported only from `.functions.ts`.

**Dependencies to install:** `ai`, `@ai-sdk/openai-compatible`, `zod` (zod likely already present — verify).

**Client wiring** in `ShareScreen`:
- Replace `useMemo` recipe/name calls with a TanStack Query `useQuery` keyed on `[breadId, toppings, salted]` calling the server fn via `useServerFn`.
- While loading: show a skeleton ("Cooking up your recipe…") in place of the recipe block.
- On error or null response: fall back to current `generateName` + `generateRecipe`.
- Keep the existing rule-based functions in `runchbase.ts` as the fallback path.

---

## 2. PostHog autocapture + key events

`src/lib/posthog.ts` already initializes PostHog with autocapture (default on) and manual pageview tracking. Changes:

- Update `POSTHOG_KEY` to `phc_yDPSEJTQgShjMvfjj96uDCHbRdAVuvuPcDyQWH7CWjs6`.
- Export a thin `track(event, props?)` helper that no-ops if PostHog isn't initialized.
- Fire key events at these points in `src/routes/index.tsx`:
  - `toast_bread_selected` — `{ breadId }`
  - `toast_topping_added` — `{ toppingId, totalToppings }`
  - `toast_salt_added`
  - `toast_completed` — `{ breadId, toppings, toastCount, salted }` (fired when ShareScreen mounts)
  - `toast_recipe_generated` — `{ source: "ai" | "fallback", latencyMs, model }`
  - `toast_shared` — `{ channel: "copy" | "twitter" | "linkedin" | "download", breadId }`
  - `toast_build_again`

Autocapture continues to handle pageviews, clicks, and form input automatically.

### PostHog AI Observability event

When the recipe query resolves successfully with `source: "ai"`, fire a second event `$ai_generation` immediately after `toast_recipe_generated` with the properties PostHog's AI Observability dashboard expects:

- `$ai_provider: "anthropic"`
- `$ai_model: "anthropic/claude-sonnet-4.5"` (or the actual model returned by the server fn if we fell back)
- `$ai_latency: latencyMs` (seconds — PostHog expects seconds, so divide ms by 1000)
- `$ai_input_tokens: usage.promptTokens` (when present)
- `$ai_output_tokens: usage.completionTokens` (when present)
- `$ai_total_tokens: usage.totalTokens` (when present)
- `$ai_is_error: false` on success; on error path, fire with `$ai_is_error: true` and `$ai_error: <message>`
- `$ai_trace_id` — generated client-side per recipe request (`crypto.randomUUID()`) so retries group correctly

Token counts and model name are returned from the server function as part of the recipe payload (see above) so the client has everything needed to emit this event without a second round-trip. If the gateway response doesn't include usage (some models omit it), the token properties are simply omitted.

---

## Files touched

- **new** `src/lib/ai-gateway.server.ts` — gateway provider helper
- **new** `src/lib/recipe-ai.functions.ts` — `generateAiRecipe` server function (returns name, steps, model, latency, usage)
- **edit** `src/routes/index.tsx` — call AI server fn in `ShareScreen`, add key-event `track()` calls, fire `$ai_generation`
- **edit** `src/lib/posthog.ts` — update key, export `track()` helper
- **deps** add `ai`, `@ai-sdk/openai-compatible` (and `zod` if missing)

## Out of scope

- No new secrets, no `.env` edits.
- No DB persistence of generated recipes (can add later if you want history).
- Existing `generateRecipe` / `generateName` stay in place as the offline fallback.
