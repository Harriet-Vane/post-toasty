## Problem

In `src/components/FlyingToasters.tsx`, each toaster `<div>` is anchored with `right: 0` and only starts moving after its per-flyer `delay` (up to ~2.5s). During that delay the element is already mounted and painted at `right: 0` — so a toaster sits parked against the right edge of the screen until its animation kicks in. That's the "rogue toaster on the right."

The animation itself travels left→right correctly once it starts; the bug is purely the pre-animation resting position.

## Fix

Rework the flyer so it is off-screen left before, during, and after the animation:

1. Anchor each flyer with `left: 0` instead of `right: 0`.
2. Start the `flyRight` keyframe at a negative X (fully off-screen left, e.g. `translateX(-40vw)` driven by a `--start-left` var) and end at `translateX(120vw)`.
3. Add `animation-fill-mode: both` (via the `forwards` shorthand already there, plus explicit `0%` start) so the element also holds the off-screen-left position *before* the delay — no flash on the right, no flash on the left.
4. Keep count at 3, keep pace (`duration: 9–13s`), keep the bob.

No other files change.
