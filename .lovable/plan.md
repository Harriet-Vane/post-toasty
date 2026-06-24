# Fix weird pink/black halo in share images

## Root cause

The share image is rasterized in the browser via `html-to-image` from the on-page share card (`cardRef` in `src/routes/index.tsx`). The card's `.dazzle-stage` uses effects that `html-to-image` can't render reliably:

- `repeating-conic-gradient` rays with `mix-blend-mode: screen` — often dropped entirely.
- `radial-gradient` background on the stage — sometimes rendered, sometimes not.
- A heavy multi-layer pink/blue `box-shadow` on the circular `.dazzle-toast` plate.
- Running CSS animations (`rays-spin`, `disco-twinkle`) — captured at a random frame.

When the rays/gradient drop out but the box-shadow renders, you get exactly the screenshot: black background + gray circle + raw pink/blue halo.

## Fix

Render a deterministic, capture-friendly version of the dazzle stage just during the html-to-image snapshot, then restore the live styles.

1. In `src/routes/index.tsx` `ensureCardUploaded`, add/remove a `is-capturing` class on `cardRef.current` around the `toPng` call (in the existing try/finally so it always cleans up).

2. In `src/styles.css`, add capture-only overrides scoped to `.is-capturing`:
   - `.is-capturing .dazzle-stage .dazzle-rays,.is-capturing .dazzle-stage .dazzle-stars { display: none; }` — kill the unreliable conic-gradient and twinkles.
   - `.is-capturing .dazzle-stage { background: #1b0840; }` — flat dark purple fallback that matches the existing palette (no radial-gradient surprises).
   - `.is-capturing .dazzle-stage .dazzle-toast { box-shadow: none; }` — remove the pink/blue halo that's causing the artifact.
   - `.is-capturing .dazzle-stage .dazzle-toast::after { display: none; }` — drop the sparkle ring (also a multi-radial-gradient that renders inconsistently).
   - `.is-capturing *, .is-capturing *::before, .is-capturing *::after { animation: none !important; }` — freeze every animation so frames are deterministic.

3. Keep variant backgrounds working: the existing `variant-*` rules already set their own `background` on `.dazzle-stage`, and our override is a single flat color the variant rule will win against where defined. For variants that rely only on `.dazzle-rays`/`.dazzle-stars`, the flat `#1b0840` fallback is what shows — acceptable and consistent.

4. No changes to `/api/public/upload-card.ts`, the OG meta wiring in `r.$slug.tsx`, or `cardKey` — the bytes uploaded just become the clean version.

## Cache note

Cards are uploaded at a deterministic `cards/{key}.png` with `immutable` cache headers, so previously-broken images for a given recipe key will stay broken in the bucket until overwritten. New visits that trigger a share will `upsert` and replace them. Social platforms also cache scraped OG images and will refresh on their own schedule; users can force-refresh via each platform's link-preview debugger.

## Files

- `src/routes/index.tsx` — toggle `is-capturing` class around `toPng` in `ensureCardUploaded`.
- `src/styles.css` — add `.is-capturing` override block near the existing `.dazzle-stage` rules.
