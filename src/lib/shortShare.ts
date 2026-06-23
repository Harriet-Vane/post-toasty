import { BREADS, TOPPINGS, type BreadId, type ToppingId } from "@/lib/runchbase";

const BREAD_INDEX = new Map<string, number>(BREADS.map((b, i) => [b.id, i]));
const TOPPING_INDEX = new Map<string, number>(TOPPINGS.map((t, i) => [t.id, i]));

/**
 * Encode bread + toppings + salt into a compact digit string:
 *   [count(1)] [bread(1)] [salt(1)] [toppingIdx(2 each)]
 *
 * Examples:
 *   white, [], salted=false   -> "000"
 *   bagel(5), [butter(0)], s  -> "1510" + "00" = "15100"
 *
 * Max realistic length ~ 3 + 2*9 = 21 digits. Most are 3-9.
 */
export function encodeToken(
  breadId: BreadId,
  toppings: ToppingId[],
  salted: boolean,
): string {
  const b = BREAD_INDEX.get(breadId) ?? 0;
  const indices = toppings
    .map((id) => TOPPING_INDEX.get(id))
    .filter((n): n is number => typeof n === "number" && n >= 0 && n < 100)
    .slice(0, 9); // single-digit count
  const count = indices.length;
  const s = salted ? 1 : 0;
  let out = `${count}${b}${s}`;
  for (const i of indices) out += i.toString().padStart(2, "0");
  return out;
}

export interface DecodedToken {
  breadId: BreadId;
  toppings: ToppingId[];
  salted: boolean;
}

export function decodeToken(token: string): DecodedToken | null {
  if (!/^\d{3,}$/.test(token)) return null;
  const count = Number(token[0]);
  const b = Number(token[1]);
  const s = Number(token[2]);
  if (token.length !== 3 + count * 2) return null;
  const bread = BREADS[b];
  if (!bread) return null;
  const toppings: ToppingId[] = [];
  for (let i = 0; i < count; i++) {
    const idx = Number(token.slice(3 + i * 2, 5 + i * 2));
    const t = TOPPINGS[idx];
    if (!t) return null;
    toppings.push(t.id);
  }
  return { breadId: bread.id, toppings, salted: s === 1 };
}

/** kebab-case slug from a human name, ascii only, max ~40 chars. */
export function slugifyName(name: string): string {
  const cleaned = name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/-+$/g, "");
  return cleaned || "toast";
}

/** Turn the slug portion before the trailing token back into a title-case name. */
export function nameFromSlug(slugWords: string): string {
  if (!slugWords) return "";
  return slugWords
    .split("-")
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

/** Build the full slug used in /r/<slug>: "<silly-name>-<token>". */
export function buildShareSlug(
  name: string,
  breadId: BreadId,
  toppings: ToppingId[],
  salted: boolean,
): string {
  return `${slugifyName(name)}-${encodeToken(breadId, toppings, salted)}`;
}

/** Parse "<silly-name>-<token>" back into name + decoded state. */
export function parseShareSlug(
  slug: string,
): (DecodedToken & { name: string }) | null {
  const m = slug.match(/^(.+?)-(\d{3,})$/);
  if (!m) return null;
  const [, words, token] = m;
  const decoded = decodeToken(token);
  if (!decoded) return null;
  return { ...decoded, name: nameFromSlug(words) };
}

export const SHARE_ORIGIN = "https://posttoasty.com";
