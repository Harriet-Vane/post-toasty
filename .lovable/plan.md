## What's broken

The share card's OG image isn't being uploaded, so `/r` link previews and downstream shares don't show the toast image.

## Why

`ShareScreen` captures the share card (`cardRef`) with `html-to-image`'s `toPng`, then POSTs the result to `/api/public/upload-card`. The uploaded URL is what `/r`'s `og:image` / `twitter:image` point to (via `cardPublicUrl`).

Recent change: the angel image inside the share card's footer (`src/routes/index.tsx` ~line 880) was swapped from a plain `<img>` to `<ToastAngel>`. `ToastAngel` always renders an inline `<style>{@keyframes toast-angel-heart-rise ...}</style>` sibling to the `<img>`, plus a stateful click handler.

`html-to-image` clones the captured subtree and serializes it inside an SVG `<foreignObject>`. Inline `<style>` tags inside that subtree are a well-known failure mode — the keyframe block ends up inside the SVG payload and the resulting data URL either throws during decode or yields a broken PNG. `ensureCardUploaded` catches the error and logs `[share] card upload failed`, so `uploadedRef` stays `null` and no card is ever uploaded for that recipe key. `/r` then advertises an `og:image` URL that 404s in storage.

The interactive heart-burst angel only needs to live where users actually click it (the hero on `/` and the footer on `/r`), not inside the static captured card.

## Fix

1. **`src/routes/index.tsx` (share card footer, ~line 880)** — replace the `<ToastAngel width={48} height={48} />` inside the captured `<article ref={cardRef}>` with a plain `<img src={angelToast} alt="" width={48} height={48} className="opacity-80" />`. Add the `angelToast` import if it isn't already in this file. This removes the inline `<style>` from the captured DOM and restores html-to-image's ability to produce a valid PNG.
2. **Leave the other two `<ToastAngel>` usages alone** — the hero one on `/` (line ~228) and the footer one on `/r` (r.tsx line ~297) are outside any capture and should keep their floating-hearts interaction.
3. **Tighten the failure surface** — in `ensureCardUploaded`, when capture or upload fails, also call `sonnerToast.error("Couldn't prepare the share image — link previews may be blank.")` so future regressions are visible to users instead of silently producing image-less shares.

## How to verify

- Open `/`, build a toast, advance to the share screen.
- Watch the Network tab: a `POST /api/public/upload-card` should fire within a second of the share screen mounting and return `200` with a `{ url }` pointing at the `toast-cards` bucket.
- Visit that URL directly — it should render the captured share card as a PNG.
- Paste the `/r?b=...&t=...` URL into a link-preview debugger (or just check the page source's `og:image`) — it should match the uploaded URL and resolve to the same PNG.

No backend or schema changes; this is purely a presentational tweak to the captured DOM plus a user-visible error toast.