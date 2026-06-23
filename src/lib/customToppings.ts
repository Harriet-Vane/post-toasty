import type { Topping, ToppingId } from "./runchbase";

// Runtime registry of AI-invented toppings. Lives in-memory only; cleared on reload.
const registry = new Map<ToppingId, Topping>();

export function registerCustomTopping(t: Topping): Topping {
  registry.set(t.id, t);
  return t;
}

export function getCustomTopping(id: ToppingId): Topping | undefined {
  return registry.get(id);
}

export function isCustomToppingId(id: string): boolean {
  return id.startsWith("ai_");
}

/** Make a stable-ish id from a name + index for AI-invented toppings. */
export function makeCustomToppingId(name: string, salt = ""): ToppingId {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 16) || "ing";
  const hash = Math.abs(
    Array.from(name + salt).reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 0)
  )
    .toString(36)
    .slice(0, 5);
  return `ai_${slug}_${hash}`;
}
