export const SELECTION_MESSAGES: Record<string, string> = {
  // Breads
  white: "You rebel!",
  sourdough: "Let's get this started...",
  wholewheat: "So healthy! So brown!",
  rye: "This is the kind with extra seeds. Be warned.",
  englishmuffin: "Nooks and crannies FTW!",
  bagel: "Only valid in New York",
  scone: "Okay but which topping comes first??",
  mystery: "YOLO",

  // Spreads & bases
  butter: "Truly. there is nothing better than hot, buttered toast.",
  plantbutter: "Truly, there is nothing better than hot, ethical toast.",
  peanutbutter: "You can decide if it's crunchy or smooth.",
  almondbutter: "Oooh so fancy!",
  hummus: "Heck yeah hummus!",
  creamcheese: "Slather it on.",
  jam: "I see how you are.",
  clottedcream: "This is the way.",
  marmalade: "Marvelous in every way!",
  lemoncurd: "A highly sophisticated palate appears!",
  honey: "Finger-licking good!",
  oliveoil: "Weird flex, but OK!",
  fluff: "The New Englander in me bows to the New Englander in you.",
  marmite: "The original, definitive, acquired taste.",

  // Toppings & extras
  avocado: "Always the right choice. Usually needs salt.",
  banana: "BANANA!!!",
  tomato: "To-may-to, to-mah-to. Let's eat.",
  egg: "Sunnyside up!",
  cinnamon: "Just like mom used to make.",
  gummy: "The universal solvent",
  pickle: "AKA rocket, an objectively cooler name",
  hotdog: "Lightly sauteed in miso butter, oh yes",
  pumpkinseeds: "Stay salty, my friend.",
  pineapple: "Pineapple belongs on everything, frankly.",
  whip: "Whip it good!",
  frosting: "Tangy and perfect, like you",
  ghost: "Feeling spicy!",
  sprinkles: "You're a mermaid unicorn!",
};

export function getSelectionMessage(id: string): string {
  return SELECTION_MESSAGES[id] ?? "Nice choice.";
}

export function SelectionToast({ message }: { message: string }) {
  return (
    <div
      className="selection-toast z-20 px-4 py-2 border-2 border-[var(--ink)] rounded-sm bg-[var(--toast-pink)] shadow-[3px_3px_0_0_var(--ink)] pointer-events-none"
      role="status"
      aria-live="polite"
    >
      <span className="font-body text-sm font-bold text-[var(--ink)]">
        {message}
      </span>
    </div>
  );
}
