export type BreadId =
  | "white"
  | "sourdough"
  | "wholewheat"
  | "rye"
  | "englishmuffin"
  | "bagel"
  | "scone"
  | "mystery";

export const BREADS: { id: BreadId; name: string }[] = [
  { id: "white", name: "White" },
  { id: "sourdough", name: "Sourdough" },
  { id: "wholewheat", name: "Whole Wheat" },
  { id: "rye", name: "Rye" },
  { id: "englishmuffin", name: "English Muffin" },
  { id: "bagel", name: "Bagel" },
  { id: "scone", name: "Scone" },
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

export type Sound = "B" | "P" | "A" | "H" | "C" | "R" | "M" | "L" | "O" | "S" | "T" | "F" | "G" | "W";

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
  /** How this topping reads inside a compliment sentence. */
  complimentName: string;
  /** Alliteration sound tag for picking adjective + noun pools. */
  sound: Sound;
}

export const TOPPINGS: Topping[] = [
  // Spreads & Bases
  { id: "butter", name: "Butter", side: "spread", render: "spread", color: "#f6d97a", emoji: "🧈", complimentName: "butter", sound: "B" },
  { id: "plantbutter", name: "Plant Butter", side: "spread", render: "spread", color: "#f3e08a", emoji: "🌱", complimentName: "plant butter", sound: "P" },
  { id: "peanutbutter", name: "Peanut Butter", side: "spread", render: "spread", color: "#b87a3d", accent: "#8a5424", emoji: "🥜", complimentName: "peanut butter", sound: "P" },
  { id: "almondbutter", name: "Almond Butter", side: "spread", render: "spread", color: "#c79a6b", accent: "#8e6a3e", emoji: "🌰", complimentName: "almond butter", sound: "A" },
  { id: "hummus", name: "Hummus", side: "spread", render: "spread", color: "#e3cf94", accent: "#a98a4a", emoji: "🧆", complimentName: "hummus", sound: "H" },
  { id: "creamcheese", name: "Cream Cheese", side: "spread", render: "spread", color: "#fdf6e0", accent: "#d7c896", emoji: "🧀", complimentName: "cream cheese", sound: "C" },
  { id: "jam", name: "Raspberry Jam", side: "spread", render: "spread", color: "#c33a4d", accent: "#7a1d2b", emoji: "🍓", complimentName: "raspberry jam", sound: "R" },
  { id: "clottedcream", name: "Clotted Cream", side: "spread", render: "spread", color: "#fdf6e0", emoji: "🍶", complimentName: "clotted cream", sound: "C" },
  { id: "marmalade", name: "Marmalade", side: "spread", render: "spread", color: "#e38a2a", emoji: "🍊", complimentName: "marmalade", sound: "M" },
  { id: "lemoncurd", name: "Lemon Curd", side: "spread", render: "spread", color: "#f4e04a", emoji: "🍋", complimentName: "lemon curd", sound: "L" },
  { id: "honey", name: "Honey", side: "spread", render: "drizzle", color: "#e3a82a", emoji: "🍯", complimentName: "honey", sound: "H" },
  { id: "oliveoil", name: "Olive Oil + Salt", side: "spread", render: "drizzle", color: "#c9c163", emoji: "🫒", complimentName: "olive oil", sound: "O" },
  { id: "fluff", name: "Marshmallow Fluff", side: "spread", render: "spread", color: "#fffdf2", accent: "#e6dfc0", emoji: "☁️", complimentName: "marshmallow fluff", sound: "M" },
  { id: "ketchup", name: "Ketchup", side: "spread", render: "drizzle", color: "#c5263b", emoji: "🍅", complimentName: "ketchup", sound: "C" },

  // Toppings & Extras
  { id: "avocado", name: "Avocado", side: "extra", render: "spread", color: "#9bbf6a", accent: "#5e7c3a", emoji: "🥑", complimentName: "avocado", sound: "A" },
  { id: "banana", name: "Banana", side: "extra", render: "banana", color: "#f6e8a8", accent: "#cdb46a", emoji: "🍌", complimentName: "banana", sound: "B" },
  { id: "tomato", name: "Tomato", side: "extra", render: "scatter", color: "#d63a2e", accent: "#7c1b15", emoji: "🍅", complimentName: "tomato", sound: "T" },
  { id: "egg", name: "Fried Egg", side: "extra", render: "egg", color: "#fffaf0", accent: "#f1b800", emoji: "🍳", complimentName: "fried egg", sound: "F" },
  { id: "cinnamon", name: "Cinnamon Sugar", side: "extra", render: "scatter", color: "#a45e2b", accent: "#f3e3b9", emoji: "🍂", complimentName: "cinnamon sugar", sound: "S" },
  { id: "gummy", name: "Gummy Bears", side: "extra", render: "scatter", color: "#f04e8a", accent: "#34a85a", emoji: "🐻", complimentName: "gummy bear", sound: "G" },
  { id: "pickle", name: "A Whole Pickle", side: "extra", render: "pickle", color: "#7ea53a", accent: "#3c5a18", emoji: "🥒", complimentName: "pickle", sound: "P" },
  { id: "hotdog", name: "A Literal Hot Dog", side: "extra", render: "hotdog", color: "#d57a5a", accent: "#7a3819", emoji: "🌭", complimentName: "hot dog", sound: "H" },
  { id: "pumpkinseeds", name: "Pumpkin Seeds", side: "extra", render: "scatter", color: "#c4a35a", emoji: "🎃", complimentName: "pumpkin seed", sound: "P" },
  { id: "pineapple", name: "Pineapple", side: "extra", render: "scatter", color: "#f6d04a", accent: "#d4a81a", emoji: "🍍", complimentName: "pineapple", sound: "P" },
  { id: "whip", name: "Whipped Cream", side: "extra", render: "spread", color: "#ffffff", accent: "#e6e6e6", emoji: "🍦", complimentName: "whipped cream", sound: "W" },
  { id: "frosting", name: "Cake Frosting", side: "extra", render: "spread", color: "#ff9ed1", accent: "#c45a96", emoji: "🎂", complimentName: "cake frosting", sound: "C" },
  { id: "ghost", name: "Hot Sauce", side: "extra", render: "drizzle", color: "#b8281a", emoji: "🌶️", complimentName: "hot sauce", sound: "H" },
  { id: "sprinkles", name: "Rainbow Sprinkles", side: "extra", render: "scatter", color: "#ff5fb4", accent: "#2db6ff", emoji: "🌈", complimentName: "rainbow sprinkles", sound: "R" },
];

export const COMPLIMENT_POOLS: Record<Sound, { adjectives: string[]; nouns: string[] }> = {
  B: {
    adjectives: ["bodacious","brilliant","bold","beautiful","bountiful","breezy","brave"],
    nouns:      ["baron","bard","beacon","boss","bigwig","beauty","bombshell"],
  },
  P: {
    adjectives: ["peerless","phenomenal","perfect","posh","peppy","polished","plucky","proud"],
    nouns:      ["paragon","pioneer","prince","princess","powerhouse","prodigy","pundit","professor","pal"],
  },
  A: {
    adjectives: ["amazing","admirable","astounding","awesome","artful","ambitious"],
    nouns:      ["ace","ally","aristocrat","ambassador","all-star","artist","aficionado"],
  },
  H: {
    adjectives: ["hilarious","heavenly","heroic","hearty","handsome","happy"],
    nouns:      ["hero","honcho","highness","hotshot","harbinger"],
  },
  C: {
    adjectives: ["cultivated","classy","charming","captivating","clever","courageous","cool"],
    nouns:      ["connoisseur","champion","captain","comrade","count","king","queen"],
  },
  R: {
    adjectives: ["resplendent","radiant","ravishing","regal","remarkable","rad"],
    nouns:      ["rockstar","royalty","ruler","rascal","renegade"],
  },
  M: {
    adjectives: ["majestic","marvelous","magnificent","magical","mighty","merry"],
    nouns:      ["maestro","monarch","marvel","mastermind","magnate","maven","maverick"],
  },
  L: {
    adjectives: ["luscious","luminous","legendary","lovely","lively","leading"],
    nouns:      ["legend","luminary","laureate","lord","lady","luchador"],
  },
  O: {
    adjectives: ["oracular","outstanding","open-minded","original","optimistic","opulent"],
    nouns:      ["oracle","optimist","orator","overlord","original"],
  },
  S: {
    adjectives: ["sparkling","sophisticated","sensational","stellar","sunny","supreme","snazzy"],
    nouns:      ["superstar","sage","sovereign","sweetheart","sensation","star"],
  },
  T: {
    adjectives: ["terrific","tremendous","top-notch","tenacious","tasteful"],
    nouns:      ["titan","trooper","trailblazer","treasure","tycoon","tastemaker"],
  },
  F: {
    adjectives: ["fabulous","fantastic","fearless","fine","friendly","fierce"],
    nouns:      ["fanatic","fellow","friend","force","firecracker"],
  },
  G: {
    adjectives: ["glorious","gorgeous","grand","great","gallant","golden"],
    nouns:      ["genius","guru","gem","guardian","giant","go-getter"],
  },
  W: {
    adjectives: ["wonderful","whimsical","winsome","wise","witty","worthy"],
    nouns:      ["wizard","wonder","winner","whiz","wunderkind"],
  },
};

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
  "{hero}, Considered",
  "The {time} {hero} Report",
  "A {hero} Sort Of Day",
];
const TIMES = ["Late-Night", "Tuesday", "Pre-Dawn", "Mid-Morning", "Post-Run", "Afternoon"];

const UNHINGED_TEMPLATES = [
  "The Unhinged {hero} Catastrophe",
  "A Rogue {hero} Disaster",
  "The {hero} Mistake",
  "An Unholy {hero} Creation",
  "The {hero} Catastrophe",
  "A {hero} Disasterpiece",
  "The {hero} Incident",
  "A Cursed {hero} Situation",
  "The {hero} Abomination",
  "A {hero} Nightmare",
  "The {hero} Fiasco",
  "A {hero} Travesty",
];

const SWEET_TOPPINGS = new Set([
  "jam",
  "clottedcream",
  "marmalade",
  "lemoncurd",
  "honey",
  "fluff",
  "gummy",
  "whip",
  "frosting",
  "sprinkles",
  "banana",
  "cinnamon",
  "pineapple",
]);

const SAVORY_TOPPINGS = new Set([
  "butter",
  "plantbutter",
  "peanutbutter",
  "almondbutter",
  "hummus",
  "creamcheese",
  "oliveoil",
  "ketchup",
  "avocado",
  "tomato",
  "egg",
  "pickle",
  "hotdog",
  "pumpkinseeds",
  "ghost",
]);

function isUnhinged(toppings: ToppingId[]): boolean {
  if (toppings.length === 0) return false;

  // Classic chaos ingredients
  const chaosIds = new Set(["hotdog", "pickle", "ketchup"]);
  if (toppings.some((id) => chaosIds.has(id))) return true;

  // Savory + sweet collision
  let hasSweet = false;
  let hasSavory = false;
  for (const id of toppings) {
    if (SWEET_TOPPINGS.has(id)) hasSweet = true;
    if (SAVORY_TOPPINGS.has(id)) hasSavory = true;
    if (hasSweet && hasSavory) return true;
  }

  return false;
}

export function generateName(breadId: BreadId, toppings: ToppingId[]): string {
  const hero =
    (toppings.length > 0 && getTopping(toppings[toppings.length - 1])?.name) ||
    getBread(breadId).name;
  const seed = breadId.length + toppings.join("").length;

  if (isUnhinged(toppings)) {
    const tpl = UNHINGED_TEMPLATES[seed % UNHINGED_TEMPLATES.length];
    return tpl.replace("{hero}", hero);
  }

  const tpl = NAME_TEMPLATES[seed % NAME_TEMPLATES.length];
  const time = TIMES[(seed * 7) % TIMES.length];
  return tpl.replace("{hero}", hero).replace("{time}", time);
}

/* ---------------- Recipe generation (simple) ---------------- */


function indefiniteArticle(phrase: string): string {
  const firstWord = phrase.trim().toLowerCase().split(/\s+/)[0];
  if (/^(hour|honest|honor|heir)/.test(firstWord)) return "an";
  return /^[aeiou]/.test(firstWord) ? "an" : "a";
}

function breadStep(breadId: BreadId): string {
  if (breadId === "mystery") {
    return "Take a slice of mystery freezer bread.";
  }
  const name = getBread(breadId).name.toLowerCase();
  if (breadId === "scone" || breadId === "bagel" || breadId === "englishmuffin") {
    return `Take ${indefiniteArticle(name)} ${name}.`;
  }
  return `Take a slice of ${name}.`;
}

function toastStep(breadId: BreadId): string {
  if (breadId === "bagel") {
    return "Toast the bagel halves until golden and warm through.";
  }
  if (breadId === "mystery") {
    return "Toast it until it's as done as it's going to get.";
  }
  return "Toast until golden.";
}

function toppingStep(topping: Topping, repeatIndex: number): string {
  const name = topping.name.toLowerCase();
  if (repeatIndex > 0) {
    return `Add more ${name}.`;
  }
  return `Add ${name}.`;
}

function closingStep(toppings: ToppingId[]): string {
  if (toppings.length === 0) {
    return "Add a topping first, you silly goose.";
  }

  const valid = toppings
    .map((id) => getTopping(id))
    .filter((t): t is Topping => !!t);

  if (valid.length === 0) {
    return "Add a topping first, you silly goose.";
  }

  const anchor = valid[Math.floor(Math.random() * valid.length)];
  const pool = COMPLIMENT_POOLS[anchor.sound];
  const adj = pool.adjectives[Math.floor(Math.random() * pool.adjectives.length)];
  const noun = pool.nouns[Math.floor(Math.random() * pool.nouns.length)];

  return `Enjoy, you ${adj} ${anchor.complimentName} ${noun}.`;
}


export function generateRecipe(breadId: BreadId, toppings: ToppingId[]): string[] {
  const lines: string[] = [];
  let n = 1;
  lines.push(`${n++}. ${breadStep(breadId)}`);
  lines.push(`${n++}. ${toastStep(breadId)}`);

  const seenCount = new Map<ToppingId, number>();
  toppings.forEach((id) => {
    const t = getTopping(id);
    if (!t) return;
    const prior = seenCount.get(id) ?? 0;
    seenCount.set(id, prior + 1);
    lines.push(`${n++}. ${toppingStep(t, prior)}`);
  });

  lines.push(`${n++}. ${closingStep(toppings)}`);
  return lines;
}
