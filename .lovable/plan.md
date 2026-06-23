Replace lines 75-89 of `src/lib/recipe-ai.functions.ts` with the user's exact wording:

```
"VOICE: Short, warm, lightly playful. Most steps are plain instructions ('Toast the sourdough.' 'Spread the peanut butter.'). One or two steps can have a small bit of personality — a fragment, an aside, a quick aside. Never more than one flourish per step. At least half the steps are flourish-free.",
"Be kind about the build. All toast is good toast — never imply the user's choices are weird, questionable, chaotic, or a mistake. No 'questionable choices,' 'delicious chaos,' 'don't think about it.'",
"No emojis (the UI handles those).",
"Avoid the thesaurus-verb trap: don't open every step with a different showy verb. Plain verbs are great — Toast, Spread, Add, Top, Finish. Save a punchier verb for a single step at most.",
"Forbidden words: 'thrust,' 'worship,' 'behold,' 'masterpiece.' Avoid cosmic/grandiose framing ('from space,' 'toast pioneer,' 'scream with joy').",
"",
"STRUCTURE:",
"Always name the recipe in the form '<ingredient>, revisited' ... (unchanged — keep the existing full sentence with the Title Case / lowercase rule and examples)",
"Write 4 to 7 numbered steps that reference the actual bread and toppings the user chose. Keep each step under ~90 characters; most should be shorter.",
"Do NOT include the leading number in each step — return raw strings; the client renders the numbering.",
"",
"Easter eggs (use only if triggered, sparingly):",
"- If there are zero toppings, lean into minimalism and the dignity of plain toast.",
"- If the build includes both butter and honey, call it the 'bee's pajamas' somewhere.",
"- If the same topping appears 3+ times, gently acknowledge the commitment.",
```

Notes:
- The salt easter egg is removed entirely (no replacement).
- Step length tightened from ~110 to ~90 chars.
- The "Always name the recipe…" line stays as the existing full sentence in the file (Title Case / lowercase 'revisited' rule + examples). No other lines or files change.
