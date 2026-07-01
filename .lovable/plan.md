## Changes

**`src/components/FlyingToasters.tsx`**
- Increase flyer `duration` to `6 + Math.random() * 2` (6–8s).
- Increase `onDone` timeout to `8000` so the portal stays until the last flyer clears.
- Portal wrapper already has `pointerEvents: "none"` — confirm it stays so the page stays clickable.

**`src/components/SubscribeLink.tsx`**
- The centered "YOU'RE SUBSCRIBED" overlay is currently tied to `flying` (unmounts at 8s). Split it into its own state `showConfirm` that turns on with `flying` on submit and auto-clears via a 3s `setTimeout`.
- Overlay wrapper already uses `pointerEvents: "none"` — keep it, so clicks pass through while it's visible.

## Result
Click Submit → both appear instantly. Centered toast disappears at 3s. Flyers finish drifting across between 6–8s. Underlying UI remains clickable throughout.