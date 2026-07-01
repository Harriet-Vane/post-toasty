# Update toast copy

Apply the user-provided strings verbatim. Only string literals change — no logic, no styling.

## `src/components/SelectionToast.tsx`

Replace the `SELECTION_MESSAGES` map values:

- `white`: "You rebel"
- `wholewheat`: "So healthy, so… brown?"
- `englishmuffin`: "Nooks and crannies FTW"
- `bagel`: "Only valid in New York." (also switch curly `“` to straight `"`)
- `scone`: "Okay but which topping comes first?"
- `almondbutter`: "Oooh so fancy"
- `hummus`: "Heck yeah hummus"
- `marmalade`: "Marvelous in every way"
- `lemoncurd`: "A highly sophisticated palate appears"
- `honey`: "Finger-licking good"
- `oliveoil`: "It's the chickpea of the sea"
- `banana`: "BA-NA-NA"
- `egg`: "Sunnyside up"
- `whip`: "Whip it good"
- `ghost`: "Feeling spicy"
- `sprinkles`: "You're a mermaid unicorn"

All other entries already match the requested copy — leave as-is.

## No other files need changes

- `sourdough`, `rye`, `mystery`, all butter/spread lines already present, `avocado`, `tomato`, `cinnamon`, `gummy`, `pickle`, `hotdog`, `pumpkinseeds`, `pineapple`, `frosting`, default → already match.
- Custom overlays "SALTY GOODNESS FTW" and "YOU'RE SUBSCRIBED" → unchanged.
- Sonner strings in `src/routes/index.tsx` (share image capture failure, pop-up blocked, copy failure) and `src/components/SubscribeLink.tsx` ("Hmm, that email looks off.") → already match.
- `sonnerToast.success("Link copied!")` in `src/routes/index.tsx` → change to `"Link copied"`.
