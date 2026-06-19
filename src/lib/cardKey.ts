// Deterministic hash so the same toast always lives at the same storage path.
// Used on the client (to upload) and in the /r route head() (to predict the
// public image URL for OG tags). Keep client + server in sync.

export function cardKey(breadId: string, toppings: string[]): string {
  const s = `${breadId}|${toppings.join(",")}`;
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h * 33) ^ s.charCodeAt(i)) >>> 0;
  }
  return h.toString(36);
}

export function cardPublicUrl(breadId: string, toppings: string[]): string {
  const base =
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_URL) ||
    "";
  return `${base}/storage/v1/object/public/toast-cards/cards/${cardKey(breadId, toppings)}.png`;
}
