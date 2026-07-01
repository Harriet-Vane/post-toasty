## Goal
Make the subscribe-confirm toast and flying toasters appear simultaneously the moment the user clicks Submit, and keep the whole show ≤ 4 seconds.

## Changes

**`src/components/FlyingToasters.tsx`**
- Remove per-flyer random `delay` (set to `0`) so all three toasters start moving immediately on mount.
- Shorten `duration` from `9–13s` to about `3–3.8s` so they clear the screen within 4 seconds.
- Change the `onDone` timeout from `15000` to `4000` so the portal unmounts at 4s max.
- Keep the bob animation but drop its delay to `0`.

**`src/components/SubscribeLink.tsx`**
- No structural change needed — the centered "YOU'RE SUBSCRIBED" overlay and `<FlyingToasters />` already mount in the same render when `flying` becomes true, so removing the flyer delay makes them appear together.
- Confirm the centered overlay disappears with `flying` (it already does via `onDone`).

## Result
Click Submit → toasters start flying from off-screen left and the centered "YOU'RE SUBSCRIBED" message appears at the same instant → both are gone by 4s.