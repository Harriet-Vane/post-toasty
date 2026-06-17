export type BreadId =
  | "white"
  | "sourdough"
  | "wholewheat"
  | "rye"
  | "englishmuffin"
  | "bagel"
  | "glutenfree"
  | "mystery";

export const BREADS: { id: BreadId; name: string }[] = [
  { id: "white", name: "White" },
  { id: "sourdough", name: "Sourdough" },
  { id: "wholewheat", name: "Whole Wheat" },
  { id: "rye", name: "Rye" },
  { id: "englishmuffin", name: "English Muffin" },
  { id: "bagel", name: "Bagel" },
  { id: "glutenfree", name: "Gluten-Free" },
  { id: "mystery", name: "Mystery Freezer Bread" },
];

export type ToppingRender =
  | "spread"
  | "drizzle"
  | "scatter"
  | "banana"
  | "egg"
  | "hotdog"
  | "pickle"
  | "secondtoast";

export type ToppingId = string;

export interface Topping {
  id: ToppingId;
  name: string;
  side: "spread" | "extra";
  render: ToppingRender;
  /** Primary color for the rendering. */
  color: string;
  /** Optional accent color (e.g. crust, yolk, swirl). */
  accent?: string;
}

export const TOPPINGS: Topping[] = [
  // Spreads & Bases
  { id: "butter", name: "Butter", side: "spread", render: "spread", color: "#f6d97a" },
  { id: "plantbutter", name: "Plant Butter", side: "spread", render: "spread", color: "#f3e08a" },
  { id: "peanutbutter", name: "Peanut Butter", side: "spread", render: "spread", color: "#b87a3d", accent: "#8a5424" },
  { id: "almondbutter", name: "Almond Butter", side: "spread", render: "spread", color: "#c79a6b", accent: "#8e6a3e" },
  { id: "hummus", name: "Hummus", side: "spread", render: "spread", color: "#e3cf94", accent: "#a98a4a" },
  { id: "creamcheese", name: "Cream Cheese", side: "spread", render: "spread", color: "#fdf6e0", accent: "#d7c896" },
  { id: "jam", name: "Jam", side: "spread", render: "spread", color: "#c33a4d", accent: "#7a1d2b" },
  { id: "honey", name: "Honey", side: "spread", render: "drizzle", color: "#e3a82a" },
  { id: "oliveoil", name: "Olive Oil + Salt", side: "spread", render: "drizzle", color: "#c9c163" },
  { id: "ranch", name: "Ranch Dressing", side: "spread", render: "drizzle", color: "#f4ecd0" },
  { id: "fluff", name: "Marshmallow Fluff", side: "spread", render: "spread", color: "#fffdf2", accent: "#e6dfc0" },
  { id: "ketchup", name: "Ketchup", side: "spread", render: "drizzle", color: "#c5263b" },
  { id: "mayo", name: "Mayo", side: "spread", render: "drizzle", color: "#fbf3d2" },

  // Toppings & Extras
  { id: "avocado", name: "Avocado", side: "extra", render: "spread", color: "#9bbf6a", accent: "#5e7c3a" },
  { id: "banana", name: "Banana", side: "extra", render: "banana", color: "#f6e8a8", accent: "#cdb46a" },
  { id: "tomato", name: "Tomato", side: "extra", render: "scatter", color: "#d63a2e", accent: "#7c1b15" },
  { id: "egg", name: "Fried Egg", side: "extra", render: "egg", color: "#fffaf0", accent: "#f1b800" },
  { id: "cinnamon", name: "Cinnamon Sugar", side: "extra", render: "scatter", color: "#a45e2b", accent: "#f3e3b9" },
  { id: "gummy", name: "Gummy Bears", side: "extra", render: "scatter", color: "#f04e8a", accent: "#34a85a" },
  { id: "pickle", name: "A Whole Pickle", side: "extra", render: "pickle", color: "#7ea53a", accent: "#3c5a18" },
  { id: "hotdog", name: "A Literal Hot Dog", side: "extra", render: "hotdog", color: "#d57a5a", accent: "#7a3819" },
  { id: "sardines", name: "Sardines", side: "extra", render: "scatter", color: "#a9b2bd", accent: "#4f5560" },
  { id: "whip", name: "Whipped Cream", side: "extra", render: "spread", color: "#ffffff", accent: "#e6e6e6" },
  { id: "cereal", name: "Dry Cereal", side: "extra", render: "scatter", color: "#e6a64a", accent: "#8a5a1a" },
  { id: "frosting", name: "Birthday Frosting", side: "extra", render: "spread", color: "#ff9ed1", accent: "#c45a96" },
  { id: "ghost", name: "Ghost Pepper Sauce", side: "extra", render: "drizzle", color: "#b8281a" },
  { id: "sprinkles", name: "Rainbow Sprinkles", side: "extra", render: "scatter", color: "#ff5fb4", accent: "#2db6ff" },
  { id: "secondtoast", name: "A Second Smaller Toast On Top", side: "extra", render: "secondtoast", color: "#e8b14b", accent: "#7a4514" },
];

export function getTopping(id: ToppingId): Topping | undefined {
  return TOPPINGS.find((t) => t.id === id);
}

export function getBread(id: BreadId) {
  return BREADS.find((b) => b.id === id)!;
}

export function toastsForMinutes(min: number): number {
  return Math.max(1, Math.round(min / 4));
}

/* ---------------- Recipe & Name generation ---------------- */

const NAME_TEMPLATES = [
  "The {time} {hero} Situation",
  "A Quiet {hero} Moment",
  "The {hero} Affair",
  "The Honest {hero} Stack",
  "{hero}, Considered",
  "The {time} {hero} Report",
  "A {hero} Sort Of Day",
];
const TIMES = ["Late-Night", "Tuesday", "Pre-Dawn", "Mid-Morning", "Post-Run", "Afternoon"];

export function generateName(breadId: BreadId, toppings: ToppingId[]): string {
  const hero =
    (toppings.length > 0 && getTopping(toppings[toppings.length - 1])?.name) ||
    getBread(breadId).name;
  const seed = breadId.length + toppings.join("").length;
  const tpl = NAME_TEMPLATES[seed % NAME_TEMPLATES.length];
  const time = TIMES[(seed * 7) % TIMES.length];
  return tpl.replace("{hero}", hero).replace("{time}", time);
}

export function generateRecipe(breadId: BreadId, toppings: ToppingId[]): string[] {
  const bread = getBread(breadId);
  const lines: string[] = [];
  lines.push(`1. Start with one slice of ${bread.name.toLowerCase()}.`);
  lines.push(`2. Toast it (~4 minutes, or until it looks right to you).`);
  toppings.forEach((id, i) => {
    const t = getTopping(id);
    if (!t) return;
    const verb =
      t.render === "spread"
        ? "Spread on the"
        : t.render === "drizzle"
          ? "Drizzle the"
          : t.render === "scatter"
            ? "Scatter the"
            : t.render === "banana"
              ? "Lay down slices of"
              : t.render === "egg"
                ? "Slide on the"
                : t.render === "hotdog"
                  ? "Place the"
                  : t.render === "pickle"
                    ? "Set down the"
                    : "Crown it with the";
    lines.push(`${i + 3}. ${verb} ${t.name.toLowerCase()}.`);
  });

  // Closing line varies only by COUNT, never judgment.
  const n = toppings.length;
  let closing: string;
  if (n === 0) closing = "Eat it plain. That counts.";
  else if (n === 1) closing = "One topping. Eat it.";
  else if (n <= 3) closing = `${n} toppings. Eat it.`;
  else if (n <= 6) closing = `${n} toppings. Eat it, slowly if you like.`;
  else if (n <= 10) closing = `${n} toppings. Bring a plate.`;
  else closing = `${n} toppings. This is a two-hands situation.`;

  lines.push(`${lines.length + 1}. ${closing}`);
  return lines;
}
