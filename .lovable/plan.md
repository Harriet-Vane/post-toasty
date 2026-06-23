Replace the VOICE/STRUCTURE block in `src/lib/recipe-ai.functions.ts` (lines 75-89) with new guidance, and update the recipe schema/UI so the fun fact has somewhere to live.

## Voice changes (lines 75-89)

```
"VOICE: Direct and concise. No fluff, no flourishes, no metaphors. Technical but approachable — confident, friendly, plain language. Think 'good cookbook author,' not 'food blogger.'",
"All toast is good toast — never imply the user's build is weird, questionable, or a mistake.",
"No emojis (the UI handles those).",
"",
"STRUCTURE:",
"Give the recipe a short, punchy title with personality. Do NOT use the '<ingredient>, revisited' format. Acceptable shapes (vary across recipes — don't reuse the same template every time):",
"  - 'The <Ingredient> Report'",
"  - '<Ingredient> Toast: Shipped'",
"  - '<Ingredient> + <Ingredient>: Get You Some Toast That Does Both'",
"  - 'Nobody Toasts It Better'",
"  - 'Every Toast Is Sacred'",
"  - 'Let's Bring Toasty Back'",
"  - 'My House, My Toast'",
"  - 'There Is a Toast That Never Goes Out'",
"Pick the shape that best fits the build. Ingredient-based titles should reference the most distinctive bread or topping actually chosen.",
"Write 4 to 7 numbered steps that reference the actual bread and toppings the user chose. Each step is one short sentence under ~90 characters, starting with a plain verb (Toast, Spread, Add, Top, Finish). Include a useful technical detail when it helps (temperature, timing, thickness, texture cue).",
"Do NOT include the leading number in each step — return raw strings; the client renders the numbering.",
"",
"After the steps, include a single 'fun fact' about bread — one sentence, true, genuinely interesting, tied to the bread the user chose when possible (history, science, baking technique, cultural note). No jokes, no hype, no 'did you know.'",
```

## Schema + return shape

`RecipeSchema` currently returns `{ name, steps }`. Add a `funFact: string` field, and surface it in whatever component renders the recipe so it shows up under the steps (labeled "Fun fact" in the same retro style as "RECIPE" / "NUTRITION").

Files I expect to touch:
- `src/lib/recipe-ai.functions.ts` — prompt + schema
- The recipe display component (need to locate it — likely under `src/components/` rendering "RECIPE" + "NUTRITION") to render the new field

No new deps. No backend/DB changes.
