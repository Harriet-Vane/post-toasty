## Idle hop for Toast Angel

Add a subtle "hop" animation that plays once after the user has been idle for 10 seconds, then stops until the next idle cycle.

### Behavior
- Idle timer starts on mount and resets on any user interaction (`mousemove`, `keydown`, `touchstart`, `scroll`, `click`).
- After 10s of no activity, the angel plays a single hop (~600ms: quick up, soft landing, tiny squash).
- Timer does not re-arm until the user interacts again — so it's "once per idle stretch," not a loop.
- Existing click behavior (flying toasters) is preserved.

### Implementation
Edit only `src/components/ToastAngel.tsx`:
- Add a `hopping` state and a CSS class `angel-hop` toggled for the animation duration.
- Use a `useEffect` to attach passive window listeners that clear + restart a 10s timeout; on timeout fire, set `hopping=true` and unset after animation ends. Do not re-arm until an activity event fires.
- Inline `<style>` block (matching the pattern used in `FlyingToasters.tsx`) defining `@keyframes angel-hop` — small translateY(-10px) with a subtle scaleY squash on landing, `ease-out`, 600ms, runs once.
- Respect `prefers-reduced-motion`: skip the animation entirely.

No changes to other files.
