export const SELECTION_MESSAGES: Record<string, string> = {
  // Breads
  white: "A bold choice!",
  sourdough: "So tasty.",
  wholewheat: "So healthy!",
  rye: "Love that for you.",
  englishmuffin: "Tally ho!",
  bagel: "Fuggeddaboutit",
  scone: "Oh indeed!",
  mystery: "YOLO",

  // Spreads & bases
  butter: "Bring it",
  plantbutter: "SO GOOD",
  peanutbutter: "I like where this is going.",
  almondbutter: "Delicious.",
  hummus: "Heck yeah hummus!",
  creamcheese: "Slather it on.",
  jam: "Here we go.",
  clottedcream: "This is the way.",
  marmalade: "Marvelous in every way!",
  lemoncurd: "A sophisticated palate!",
  honey: "Finger-licking good.",
  oliveoil: "Fat equals flavor!",
  fluff: "A classic for a reason.",
  ketchup: "Bring the tang.",
  marmite: "You maverick, you!",

  // Toppings & extras
  avocado: "So green.",
  banana: "BANANA!!!",
  tomato: "To-mah-to",
  egg: "As you like it.",
  cinnamon: "Like mom used to make.",
  gummy: "This is getting good.",
  pickle: "Live in your truth!",
  hotdog: "Why the heck not?",
  pumpkinseeds: "For that extra crunch…",
  pineapple: "Belongs on everything, frankly.",
  whip: "Whip it good.",
  frosting: "Among the few perks of being an adult.",
  ghost: "Don’t hold back.",
  sprinkles: "You’re a mermaid unicorn!",
};

export function getSelectionMessage(id: string): string {
  return SELECTION_MESSAGES[id] ?? "Nice choice.";
}

export function SelectionToast({ message }: { message: string }) {
  return (
    <div
      className="selection-toast z-20 px-4 py-2 border-2 border-[var(--ink)] rounded-sm bg-[var(--toast-pink)] shadow-[3px_3px_0_0_var(--ink)]"
      role="status"
      aria-live="polite"
    >
      <span className="font-body text-sm font-bold text-[var(--ink)]">
        {message}
      </span>
    </div>
  );
}
