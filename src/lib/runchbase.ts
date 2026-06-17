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

const INTENSITY: Record<string, number> = {
  pickle: 1,
  cinnamon: 1,
  fluff: 1,
  frosting: 1,
  whip: 1,
  cereal: 1,
  sprinkles: 1,
  ranch: 2,
  ketchup: 2,
  mayo: 2,
  sardines: 2,
  gummy: 2,
  ghost: 3,
  hotdog: 3,
};

const REAL_BREAD_FRAMES = [
  "Start with a slice of {bread} — give it a second, that smell is doing some of the work already.",
  "{bread}. Straight up. No notes needed.",
  "Grab your {bread}. This is the part that matters most, even though it's the plainest.",
  "One slice of {bread}, please — inhale that scent before anything else happens.",
  "{bread} it is. Respect the crust.",
];

const MYSTERY_BREAD_FRAMES = [
  "Unwrap whatever that is from the back of the freezer. Brave of you.",
  "Mystery bread, defrosting as we speak. Nobody's filed a report yet.",
  "Nobody knows what this is. That's not stopping us.",
  "Something freezer-shaped. We're calling it bread. Onward.",
];

const TOAST_GENERAL = [
  "Toast it like you mean it.",
  "Give it the full cycle. Don't rush this part.",
  "However your toaster handles a slice this size, trust it.",
  "Give it the works.",
];

const TOAST_MYSTERY_EXTRA = [
  "Toast it and hope. That's the whole instruction.",
  "However it comes out is canon now.",
];

const SPREAD_VERBS = ["smear", "slather", "spread", "layer on", "swipe on", "pile on"];
const SPREAD_MODIFIERS = [
  "don't hold back",
  "like you mean it",
  "generously",
  "with conviction",
  "no half measures",
];
const SPREAD_FRAMES = [
  "{Verb} on the {topping}, {modifier}.",
  "The {topping} goes on next — {modifier}.",
  "{Verb} the {topping} {modifier}.",
];

const DRIZZLE_VERBS = ["drizzle", "zigzag", "stripe on", "lash on", "go back and forth with"];
const DRIZZLE_FRAMES = [
  "{Verb} the {topping} across the top.",
  "{Verb} on the {topping} — don't overthink the pattern.",
  "The {topping} gets a quick {verb} across everything.",
];

const SCATTER_VERBS = [
  "scatter",
  "shower",
  "rain down",
  "scatter generously",
  "fling on (affectionately)",
];
const SCATTER_FRAMES = [
  "{Verb} the {topping} across the whole thing.",
  "{topping} goes everywhere — {verb} it on.",
  "Give it a generous {verb} of {topping}.",
];

const EGG_LINES = [
  "Let the egg happen.",
  "Yolk goes wherever it wants. That's the deal.",
  "Egg on top, full coverage. No pan in sight.",
];

const DISCRETE_FRAMES = [
  "Add the {topping}. Yes, really.",
  "Place the {topping} on top. No further instructions necessary.",
  "{topping}, just like that. Moving on.",
];

const CLOSING_T1 = [
  "Eat it slow. This one's exactly right.",
  "No notes. Sit down and enjoy it.",
  "Simple, and that's the whole point. Dig in.",
  "This one's for you. Take your time with it.",
];
const CLOSING_T2 = [
  "Bold combination. You knew exactly what you were doing.",
  "Didn't see that one coming, but it works.",
  "Respect. Eat it before it gets any braver.",
  "That's a swerve, and a good one. Go enjoy it.",
];
const CLOSING_T3 = [
  "Not for the faint of heart. Good thing it's for you.",
  "This is less a snack and more a statement. Eat it proudly.",
  "No apologies. Hold onto something.",
  "Legendary. Possibly concerning. Eat it anyway.",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickAvoiding<T>(arr: T[], avoid: T | null): T {
  if (arr.length <= 1 || avoid === null) return pick(arr);
  let choice = pick(arr);
  let safety = 0;
  while (choice === avoid && safety < 8) {
    choice = pick(arr);
    safety++;
  }
  return choice;
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

type Category = "spread" | "drizzle" | "scatter" | "egg" | "discrete";

function categoryFor(render: ToppingRender): Category {
  switch (render) {
    case "spread":
      return "spread";
    case "drizzle":
      return "drizzle";
    case "scatter":
    case "banana":
      return "scatter";
    case "egg":
      return "egg";
    case "pickle":
    case "hotdog":
      return "discrete";
  }
}

export function generateRecipe(breadId: BreadId, toppings: ToppingId[]): string[] {
  const bread = getBread(breadId);
  const isMystery = breadId === "mystery";
  const lines: string[] = [];

  // 1. Bread intro
  const breadLine = isMystery
    ? pick(MYSTERY_BREAD_FRAMES)
    : pick(REAL_BREAD_FRAMES).replace("{bread}", bread.name);
  lines.push(`1. ${breadLine}`);

  // 2. Toasting
  const toastPool = isMystery ? [...TOAST_GENERAL, ...TOAST_MYSTERY_EXTRA] : TOAST_GENERAL;
  lines.push(`2. ${pick(toastPool)}`);

  // 3+. Topping application — avoid consecutive frame repeats within a category
  const lastFrameByCategory: Record<Category, string | null> = {
    spread: null,
    drizzle: null,
    scatter: null,
    egg: null,
    discrete: null,
  };

  toppings.forEach((id, i) => {
    const t = getTopping(id);
    if (!t) return;
    const cat = categoryFor(t.render);
    const name = t.name.toLowerCase();
    let sentence = "";

    if (cat === "egg") {
      sentence = pickAvoiding(EGG_LINES, lastFrameByCategory.egg);
      lastFrameByCategory.egg = sentence;
    } else if (cat === "discrete") {
      const frame = pickAvoiding(DISCRETE_FRAMES, lastFrameByCategory.discrete);
      lastFrameByCategory.discrete = frame;
      sentence = frame.replace(/\{topping\}/g, name);
    } else if (cat === "spread") {
      const frame = pickAvoiding(SPREAD_FRAMES, lastFrameByCategory.spread);
      lastFrameByCategory.spread = frame;
      const verb = pick(SPREAD_VERBS);
      const modifier = pick(SPREAD_MODIFIERS);
      sentence = frame
        .replace("{Verb}", cap(verb))
        .replace("{verb}", verb)
        .replace("{topping}", name)
        .replace("{modifier}", modifier);
    } else if (cat === "drizzle") {
      const frame = pickAvoiding(DRIZZLE_FRAMES, lastFrameByCategory.drizzle);
      lastFrameByCategory.drizzle = frame;
      const verb = pick(DRIZZLE_VERBS);
      sentence = frame
        .replace("{Verb}", cap(verb))
        .replace("{verb}", verb)
        .replace("{topping}", name);
    } else if (cat === "scatter") {
      const frame = pickAvoiding(SCATTER_FRAMES, lastFrameByCategory.scatter);
      lastFrameByCategory.scatter = frame;
      const verb = pick(SCATTER_VERBS);
      sentence = frame
        .replace("{Verb}", cap(verb))
        .replace("{verb}", verb)
        .replace("{topping}", name);
    }

    sentence = cap(sentence);
    lines.push(`${i + 3}. ${sentence}`);
  });

  // Closing — tier selects pool; tier is never displayed
  let weight = toppings.reduce((sum, id) => sum + (INTENSITY[id] ?? 0), 0);
  if (isMystery) weight += 3;
  const closingPool = weight <= 2 ? CLOSING_T1 : weight <= 5 ? CLOSING_T2 : CLOSING_T3;
  lines.push(`${lines.length + 1}. ${pick(closingPool)}`);

  return lines;
}
