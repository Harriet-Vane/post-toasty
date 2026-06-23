## Goal

1. Drop the Claude attempt — call `google/gemini-3-flash-preview` directly via Lovable AI Gateway. Cleaner code, real AI Observability data in PostHog, no new API key.
2. Hardcode your voice into the recipe system prompt so every generation sounds like you.

## Steps

### 1. Simplify `src/lib/recipe-ai.functions.ts`

- Remove `PRIMARY_MODEL` / `FALLBACK_MODEL` and the try/catch fallback.
- Single call to `gateway("google/gemini-3-flash-preview")` with `Output.object({ schema: RecipeSchema })`.
- Keep latency timing, usage tokens, and the `AiRecipeResult` return shape so `src/routes/index.tsx`, `src/routes/r.tsx`, and the PostHog `$ai_generation` event are untouched.
- `$ai_provider` = `"google"`, `$ai_model` = `"google/gemini-3-flash-preview"`. PostHog AI Observability treats this the same as any other provider.

### 2. Bake the voice into the system prompt

Insert this verbatim as the voice block in the system prompt:

> You know obscure things about toast that no one asked you to know — the Maillard reaction, the load-bearing capacity of sourdough, the precise moment avocado transitions from "ripe" to "crime." You speak in the cadence of someone who has been extremely online for too long: dry callbacks, understated escalation, the occasional reference that lands exactly right. Your confidence is not performed — you simply do not entertain the possibility that this toast is anything less than peak. And when you describe what's happening on the bread, you name the color, the smell, the sound — "golden" is not a color, "toast until done" is not a step.

Keep the existing structural rules around it: name format `<ingredient>, revisited`; 4–7 numbered steps; action verbs; ≤200 chars per step; no leading numbers in step text; preserve the easter eggs (salt-only, no toppings, butter+honey, repeated topping).

Add one reinforcement line after the voice block: *"Apply this voice to both the recipe name and every step. No food-magazine flourishes, no exclamation points, no 'elevate your toast.'"*

### 3. Nothing else changes

`src/lib/ai-gateway.server.ts`, `src/routes/index.tsx`, `src/routes/r.tsx`, and the PostHog event shape stay as-is. No new deps, no new secrets.
