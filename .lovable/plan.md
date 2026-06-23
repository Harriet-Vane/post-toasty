Plan:

1. Update the share-card capture so it uses the card’s full rendered dimensions instead of only forcing a fixed width. This should prevent the right edge from being clipped when `html-to-image` creates the PNG.

2. Add a small capture-only CSS class/state during export to normalize the card layout: fixed 600px card width, no responsive text sizing, centered dazzle stage, and explicit stage/plate bounds so the toast, plate, and background all fit inside the exported image.

3. Make the visible shared recipe page use the same centered stage sizing as the generated share card, so the social thumbnail and destination page visually match.

4. Add a cache-busting/versioned card key for the uploaded preview image if needed, so old cropped PNGs don’t keep appearing from storage/social cache for the same toast combination.

5. Verify by generating a local share card and checking that the exported PNG contains the full right edge of the dazzle background, plate, and toast without clipping.