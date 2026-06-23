## Problem

On `/r/$slug`, the recipe title flickers: it renders with the deterministic `fallbackName` first, then swaps to the AI-generated name once `generateAiRecipe` resolves. The slug only carries a shared name in some cases; when it doesn't, the AI result currently overrides the fallback for the heading.

Relevant line in `src/routes/r.$slug.tsx`:

```ts
const name = sharedName || (aiOk ? aiQuery.data!.name : fallbackName);
```

## Fix

Decouple the heading from the AI response. Use a stable title source that's known on first paint, and let the AI response only affect the recipe steps / pairing.

Change the `name` derivation to:

```ts
const name = sharedName || fallbackName;
```

Effects:
- The `<h2>` title (line 205) and `head()` meta `title` / `og:title` both already use `sharedName || fallbackName` semantics on the server. The client now matches, so no swap occurs.
- The AI recipe steps and pairing block continue to render when `aiOk`, unchanged.
- No change to loader, head(), or share-card logic.

## Scope

- Edit one line in `src/routes/r.$slug.tsx` (the `name` assignment).
- No other files touched. No schema or dependency changes.