// Deterministic hash so the same toast always lives at the same storage path.
// Used on the client (to upload) and in the /r route head() (to predict the
// public image URL for OG tags). Keep client + server in sync.

export function cardKey(breadId: string, toppings: string[], salted?: boolean): string {
  // Bump this suffix when the capture layout changes so previously uploaded
  // (clipped) PNGs are not reused for the same recipe.
  const s = `v2|${breadId}|${toppings.join(",")}${salted ? "|salt" : ""}`;
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h * 33) ^ s.charCodeAt(i)) >>> 0;
  }
  return h.toString(36);
}


export function cardPublicUrl(breadId: string, toppings: string[], salted?: boolean): string {
  const base =
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_URL) ||
    "";
  return `${base}/storage/v1/object/public/toast-cards/cards/${cardKey(breadId, toppings, salted)}.png`;
}
