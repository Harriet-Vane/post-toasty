The `id-preview--…lovable.app` URL serves a **static preview build**, which is separate from the working dev sandbox iframe next to chat. That screen ("Preview has not been built yet") means the last preview build either hasn't finished or errored out — the live dev preview itself is rendering fine (I inspected it: full DOM, no console/SSR errors, only harmless `inputValidator` deprecation warnings).

Since you just looked for the first time, the most likely cause is simply that a fresh build hasn't been triggered yet against that URL, or the last one failed silently.

## Plan

1. Wait ~1–2 minutes and refresh the shared preview link once. First-time visits often just need the build to finish.
2. If it's still stuck, trigger a fresh build by publishing (the publish flow rebuilds the preview snapshot as part of the deploy):
   - Confirm no unresolved critical security findings first.
   - Publish to your existing `post-toasty.lovable.app` URL. This also refreshes the shared preview build.
3. If publishing fails or the shared preview is still blank after the build completes, pull the preview build logs and fix whatever error surfaces there (most likely a route/loader failure that only trips during the static build, not dev SSR).

## Nothing to change in code right now

I didn't find any error in the running dev preview, so no code edit is warranted yet. If step 3 turns up a real build error, I'll come back with a targeted fix plan for that specific error.

## What I need from you

Tell me which you'd like:
- **Wait and refresh** — do nothing, just retry the link in a minute.
- **Publish now** — I'll run the publish flow to force a rebuild.
- **Investigate first** — I'll pull build logs and diagnose before touching anything.