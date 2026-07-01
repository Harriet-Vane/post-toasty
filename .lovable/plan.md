## Plan

1. Update `src/components/FlyingToasters.tsx` so each toaster starts just off the left edge instead of far off-screen.
2. Remove the randomized `startOffset` distance that currently makes the first visible toaster take time to reach the viewport.
3. Keep the existing behavior: exactly 3 toasters, left-to-right movement, 6–8 second duration, no click-blocking overlay, and the confirmation UI toast hiding after 3 seconds.
4. Verify in the preview that toasters are visible immediately when Subscribe is submitted and continue flying for 6–8 seconds.

## Technical detail

The current CSS has no animation delay, but the `0%` keyframe starts at `translateX(calc((var(--start-offset) + 40vw) * -1))`; with `startOffset` set to `20–50vw`, toasters begin `60–90vw` off-screen left. That creates the visible delay. The fix is to start them around `-110%` of their own width / just outside the viewport instead of many viewport-widths away.