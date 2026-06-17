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
  | "pickle";

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
  /** Emoji shown as the ingredient's 8-bit-style avatar in the chip list. */
  emoji: string;
}

export const TOPPINGS: Topping[] = [
  // Spreads & Bases
  { id: "butter", name: "Butter", side: "spread", render: "spread", color: "#f6d97a", emoji: "🧈" },
  { id: "plantbutter", name: "Plant Butter", side: "spread", render: "spread", color: "#f3e08a", emoji: "🌱" },
  { id: "peanutbutter", name: "Peanut Butter", side: "spread", render: "spread", color: "#b87a3d", accent: "#8a5424", emoji: "🥜" },
  { id: "almondbutter", name: "Almond Butter", side: "spread", render: "spread", color: "#c79a6b", accent: "#8e6a3e", emoji: "🌰" },
  { id: "hummus", name: "Hummus", side: "spread", render: "spread", color: "#e3cf94", accent: "#a98a4a", emoji: "🧆" },
  { id: "creamcheese", name: "Cream Cheese", side: "spread", render: "spread", color: "#fdf6e0", accent: "#d7c896", emoji: "🧀" },
  { id: "jam", name: "Jam", side: "spread", render: "spread", color: "#c33a4d", accent: "#7a1d2b", emoji: "🍓" },
  { id: "honey", name: "Honey", side: "spread", render: "drizzle", color: "#e3a82a", emoji: "🍯" },
  { id: "oliveoil", name: "Olive Oil + Salt", side: "spread", render: "drizzle", color: "#c9c163", emoji: "🫒" },
  { id: "ranch", name: "Ranch Dressing", side: "spread", render: "drizzle", color: "#f4ecd0", emoji: "🥛" },
  { id: "fluff", name: "Marshmallow Fluff", side: "spread", render: "spread", color: "#fffdf2", accent: "#e6dfc0", emoji: "☁️" },
  { id: "ketchup", name: "Ketchup", side: "spread", render: "drizzle", color: "#c5263b", emoji: "🍅" },
  { id: "mayo", name: "Mayo", side: "spread", render: "drizzle", color: "#fbf3d2", emoji: "🥚" },

  // Toppings & Extras
  { id: "avocado", name: "Avocado", side: "extra", render: "spread", color: "#9bbf6a", accent: "#5e7c3a", emoji: "🥑" },
  { id: "banana", name: "Banana", side: "extra", render: "banana", color: "#f6e8a8", accent: "#cdb46a", emoji: "🍌" },
  { id: "tomato", name: "Tomato", side: "extra", render: "scatter", color: "#d63a2e", accent: "#7c1b15", emoji: "🍅" },
  { id: "egg", name: "Fried Egg", side: "extra", render: "egg", color: "#fffaf0", accent: "#f1b800", emoji: "🍳" },
  { id: "cinnamon", name: "Cinnamon Sugar", side: "extra", render: "scatter", color: "#a45e2b", accent: "#f3e3b9", emoji: "🍂" },
  { id: "gummy", name: "Gummy Bears", side: "extra", render: "scatter", color: "#f04e8a", accent: "#34a85a", emoji: "🐻" },
  { id: "pickle", name: "A Whole Pickle", side: "extra", render: "pickle", color: "#7ea53a", accent: "#3c5a18", emoji: "🥒" },
  { id: "hotdog", name: "A Literal Hot Dog", side: "extra", render: "hotdog", color: "#d57a5a", accent: "#7a3819", emoji: "🌭" },
  { id: "sardines", name: "Sardines", side: "extra", render: "scatter", color: "#a9b2bd", accent: "#4f5560", emoji: "🐟" },
  { id: "whip", name: "Whipped Cream", side: "extra", render: "spread", color: "#ffffff", accent: "#e6e6e6", emoji: "🍦" },
  { id: "cereal", name: "Dry Cereal", side: "extra", render: "scatter", color: "#e6a64a", accent: "#8a5a1a", emoji: "🥣" },
  { id: "frosting", name: "Birthday Frosting", side: "extra", render: "spread", color: "#ff9ed1", accent: "#c45a96", emoji: "🎂" },
  { id: "ghost", name: "Ghost Pepper Sauce", side: "extra", render: "drizzle", color: "#b8281a", emoji: "🌶️" },
  { id: "sprinkles", name: "Rainbow Sprinkles", side: "extra", render: "scatter", color: "#ff5fb4", accent: "#2db6ff", emoji: "🌈" },
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

const ONES = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
const TEENS = ["ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

function wordsBelow1000(n: number): string {
  let out = "";
  if (n >= 100) {
    out += ONES[Math.floor(n / 100)] + " hundred";
    n %= 100;
    if (n > 0) out += " ";
  }
  if (n >= 20) {
    out += TENS[Math.floor(n / 10)];
    n %= 10;
    if (n > 0) out += "-" + ONES[n];
  } else if (n >= 10) {
    out += TEENS[n - 10];
  } else if (n > 0) {
    out += ONES[n];
  }
  return out;
}

function firstWordOfNumber(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return String(n);
  if (n < 1000) return wordsBelow1000(n).split(/[\s-]/)[0];
  const thousands = Math.floor(n / 1000);
  return wordsBelow1000(thousands).split(/[\s-]/)[0] + " thousand";
}

export function articleForCount(count: number): string {
  const first = firstWordOfNumber(count).toLowerCase();
  // "one" starts with a vowel letter but a consonant sound: "a one-toast run".
  if (first === "one") return "a";
  return /^[aeiou]/i.test(first) ? "an" : "a";
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

/* ---------------- Recipe generation (voiced) ---------------- */

// Internal intensity weights — never shown to the user.
const TOPPING_WEIGHT: Record<string, number> = {
  // weight 1 — a little extra
  cinnamon: 1, fluff: 1, frosting: 1, whip: 1, cereal: 1, sprinkles: 1,
  // weight 2 — a swerve
  ranch: 2, ketchup: 2, mayo: 2, sardines: 2, gummy: 2,
  // weight 3 — full send
  ghost: 3, hotdog: 3, pickle: 3,
};

function buildWeight(breadId: BreadId, toppings: ToppingId[]): number {
  let w = toppings.reduce((s, id) => s + (TOPPING_WEIGHT[id] ?? 0), 0);
  if (breadId === "mystery") w += 3;
  return w;
}

// Tiny seeded picker so recipes stay deterministic per build.
function makeSeed(breadId: BreadId, toppings: ToppingId[]) {
  let h = 2166136261;
  const s = breadId + "|" + toppings.join(",");
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = (h * 16777619) >>> 0;
  }
  let n = h || 1;
  return () => {
    n ^= n << 13; n >>>= 0;
    n ^= n >> 17;
    n ^= n << 5;  n >>>= 0;
    return n;
  };
}
const pick = <T,>(arr: T[], rng: () => number) => arr[rng() % arr.length];

/* ---- Beat 1: bread ---- */
function breadBeat(breadId: BreadId, rng: () => number): string {
  if (breadId === "mystery") {
    return pick(
      [
        "Unwrap whatever that is from the back of the freezer. Brave of you.",
        "Mystery bread, defrosting as we speak. Nobody's filed a report yet.",
        "Nobody knows what this is. That's not stopping us.",
        "Pull the nominally-bread thing out of the freezer. We believe in it.",
        "Some kind of bread. Origin unknown. Nothing has gone wrong yet.",
      ],
      rng,
    );
  }
  const name = getBread(breadId).name;
  const lower = name.toLowerCase();
  const frames = [
    `Start with a slice of ${lower} — give it a second, that smell is doing some of the work already.`,
    `${name}. Straight up. No notes needed.`,
    `Grab your ${lower}. This is the part that matters most, even though it's the plainest.`,
    `Pull out the ${lower} and treat it right. This is the foundation.`,
    `One slice of ${lower}. Inhale. That's the good stuff.`,
    `${name}, respected. Crust and all.`,
  ];
  return pick(frames, rng);
}

/* ---- Beat 2: toasting ---- */
function toastBeat(breadId: BreadId, rng: () => number): string {
  if (breadId === "mystery") {
    return pick(
      [
        "Toast it and hope. That's the whole instruction.",
        "Into the toaster. Whatever comes out, comes out.",
        "Give it the full cycle. Nobody knows what we're working with.",
      ],
      rng,
    );
  }
  if (breadId === "bagel") {
    return pick(
      [
        "A bagel takes longer. Give it the works.",
        "Toast it the whole way through. Bagels don't rush.",
        "Full cycle, maybe more. Trust the toaster.",
      ],
      rng,
    );
  }
  return pick(
    [
      "Toast it like you mean it.",
      "Give it the full cycle. Don't rush this part.",
      "However your toaster handles a slice this size, trust it.",
      "Toast it. However long it takes is however long it takes.",
      "Into the toaster. Don't hover.",
    ],
    rng,
  );
}

/* ---- Beat 3: application ---- */
const SPREAD_VERBS = ["Smear on the", "Slather on the", "Spread the", "Layer on the", "Swipe on the", "Pile on the"];
const SPREAD_MODS = ["don't hold back", "like you mean it", "generously", "with conviction", "no half measures"];
const DRIZZLE_VERBS_CALM = ["Drizzle the", "Stripe on the", "Go back and forth with the"];
const DRIZZLE_VERBS_WILD = ["Zigzag the", "Lash the", "Go reckless with the"];
const SCATTER_VERBS = ["Scatter the", "Shower the", "Rain down the", "Fling on the"];

function applicationBeat(
  topping: Topping,
  repeatIndex: number,
  tier: number,
  rng: () => number,
): string {
  const name = topping.name.toLowerCase();

  if (repeatIndex > 0) {
    const variants = [
      `More ${name}. Why not.`,
      `Another pass of ${name}.`,
      `Keep the ${name} coming.`,
      `Don't stop at one layer of ${name}.`,
      `Yes, even more ${name}.`,
      `Lay on more ${name}. You're already here.`,
    ];
    return pick(variants, rng);
  }

  // Deadpan single odd items
  if (topping.id === "hotdog") {
    return pick(
      ["Add the hot dog. Yes, really.", "Place one whole hot dog on top. That's the step.", "The hot dog goes on now. No commentary."],
      rng,
    );
  }
  if (topping.id === "pickle") {
    return pick(
      ["Place one whole pickle on top. No further instructions necessary.", "Set down the pickle. Whole. Don't slice it.", "Add the pickle. As-is."],
      rng,
    );
  }
  if (topping.id === "sardines") {
    return pick(
      ["Lay the sardines across the top. No apologies.", "Arrange the sardines. They earned their spot.", "Sardines on. We're committed now."],
      rng,
    );
  }

  switch (topping.render) {
    case "egg":
      return pick(
        [
          "Let the egg happen. Yolk goes wherever it wants.",
          "Slide the fried egg on. That's the deal.",
          "The egg lands on top. Yolk's in charge from here.",
        ],
        rng,
      );
    case "spread": {
      const v = pick(SPREAD_VERBS, rng);
      const m = pick(SPREAD_MODS, rng);
      const lead = rng() % 3;
      if (lead === 0) return `${v} ${name}, ${m}.`;
      if (lead === 1) return `The ${name} goes on next — ${m}.`;
      return `${v} ${name} like you mean it.`;
    }
    case "drizzle": {
      const pool = tier >= 2 ? DRIZZLE_VERBS_WILD : DRIZZLE_VERBS_CALM;
      const v = pick(pool, rng);
      const lead = rng() % 3;
      if (lead === 0) return `${v} ${name} across the top.`;
      if (lead === 1) return `${v} ${name}. Don't overthink the pattern.`;
      return `${v} ${name} back and forth.`;
    }
    case "banana": {
      const lead = rng() % 3;
      if (lead === 0) return "Scatter the banana slices generously.";
      if (lead === 1) return "Lay the banana slices down. They go where they go.";
      return "Banana slices on next — don't skip them, they're doing real work.";
    }
    case "scatter": {
      const v = pick(SCATTER_VERBS, rng);
      const lead = rng() % 3;
      if (lead === 0) return `${v} ${name} across the top.`;
      if (lead === 1) return `${v} ${name}. A little chaos is the point.`;
      return `The ${name} goes on next — ${v.toLowerCase()} it on.`;
    }
    case "hotdog":
      return "Add the hot dog. Yes, really.";
    case "pickle":
      return "Place one whole pickle on top. No further instructions necessary.";
  }
}

/* ---- Beat 4: closing ---- */
function closingBeat(weight: number, rng: () => number): string {
  if (weight <= 2) {
    return pick(
      [
        "Eat it slow. This one's exactly right.",
        "No notes. Sit down and enjoy it.",
        "Simple is fine. This is for you.",
        "That's the one. Don't rush eating it.",
      ],
      rng,
    );
  }
  if (weight <= 5) {
    return pick(
      [
        "Bold combination. You knew exactly what you were doing.",
        "Didn't see that one coming, but it works. Respect.",
        "That's a swerve, and it lands. Eat proudly.",
        "Mischievous build. Eat the evidence.",
      ],
      rng,
    );
  }
  return pick(
    [
      "Not for the faint of heart. Good thing it's for you.",
      "This is less a snack and more a statement. Eat it proudly.",
      "No apologies. Hold onto something.",
      "Legendary build. Permission to eat granted.",
    ],
    rng,
  );
}

export function generateRecipe(breadId: BreadId, toppings: ToppingId[]): string[] {
  const rng = makeSeed(breadId, toppings);
  const weight = buildWeight(breadId, toppings);
  const lines: string[] = [];
  let n = 1;
  lines.push(`${n++}. ${breadBeat(breadId, rng)}`);
  lines.push(`${n++}. ${toastBeat(breadId, rng)}`);

  const seenCount = new Map<ToppingId, number>();
  toppings.forEach((id) => {
    const t = getTopping(id);
    if (!t) return;
    const prior = seenCount.get(id) ?? 0;
    seenCount.set(id, prior + 1);
    lines.push(`${n++}. ${applicationBeat(t, prior, weight, rng)}`);
  });

  if (toppings.length === 0) {
    lines.push(`${n++}. Eat it plain. That counts.`);
  } else {
    lines.push(`${n++}. ${closingBeat(weight, rng)}`);
  }
  return lines;
}
