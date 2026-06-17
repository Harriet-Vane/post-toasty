import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast as sonnerToast } from "sonner";

import { BreadCanvas } from "@/components/BreadCanvas";
import { ToastSprite } from "@/components/ToastSprite";
import { ToastsHUD } from "@/components/ToastsHUD";
import {
  BREADS,
  TOPPINGS,
  generateName,
  generateRecipe,
  getBread,
  getTopping,
  type BreadId,
  type ToppingId,
} from "@/lib/runchbase";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RunchBase — Celebrate your runs with toast" },
      {
        name: "description",
        content:
          "Enter your run time. Get a toast count. Build the toast. Toast is the unit of measurement for the run itself.",
      },
      { property: "og:title", content: "RunchBase" },
      { property: "og:description", content: "Toast, the champion of post-run treats." },
    ],
  }),
  component: RunchBase,
});

type Phase = "input" | "builder" | "share";

function RunchBase() {
  const [phase, setPhase] = useState<Phase>("input");
  const [breadId, setBreadId] = useState<BreadId>("white");
  const [breadStep, setBreadStep] = useState(true); // step 1 vs step 2 in builder
  const [toppings, setToppings] = useState<ToppingId[]>([]);

  const toastCount = 1;

  function reset() {
    setPhase("input");
    setBreadId("white");
    setBreadStep(true);
    setToppings([]);
  }

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-3 sm:p-6">
      <div className="w-full max-w-[1080px] arcade-cabinet p-3 sm:p-6">
        {/* Cabinet marquee */}
        <div className="flex items-center justify-between gap-3 mb-3 sm:mb-4 px-2">
          <div className="flex items-center gap-2 sm:gap-3">
            <ToastSprite size={28} />
            <h1
              className="font-pixel text-[var(--paper)] text-[14px] sm:text-[18px] leading-none"
              style={{ textShadow: "2px 2px 0 var(--tomato)" }}
            >
              RUNCHBASE
            </h1>
          </div>
          <div className="font-body text-[var(--paper)] opacity-80 text-xs sm:text-sm hidden sm:block">
            run · toast · repeat
          </div>
          {phase !== "input" && (
            <button onClick={reset} className="pixel-btn-ghost text-[var(--paper)] border-[var(--paper)]">
              Start over
            </button>
          )}
        </div>

        {/* Screen */}
        <div className="relative arcade-screen crt p-4 sm:p-8 min-h-[520px]">
          {/* HUD top-left appears in builder & later */}
          {(phase === "builder" || phase === "share") && (
            <div className="absolute top-3 left-3 z-10">
              <ToastsHUD count={toastCount} />
            </div>
          )}

          {phase === "input" && (
            <InputScreen onContinue={() => setPhase("builder")} />
          )}

          {phase === "builder" && (
            <BuilderScreen
              breadId={breadId}
              setBreadId={setBreadId}
              toppings={toppings}
              setToppings={setToppings}
              breadStep={breadStep}
              setBreadStep={setBreadStep}
              onLock={() => setPhase("share")}
            />
          )}

          {phase === "share" && (
            <ShareScreen
              breadId={breadId}
              toppings={toppings}
              toastCount={toastCount}
              onBuildAgain={() => setPhase("builder")}
            />
          )}
        </div>

        {/* Cabinet footer */}
        <div className="flex items-center justify-between px-2 pt-3 sm:pt-4 text-[var(--paper)] opacity-70">
          <span className="font-pixel text-[9px]">© RUNCHBASE</span>
          <span className="font-body text-xs">toast is the unit, the process, the goal</span>
        </div>
      </div>
    </main>
  );
}


/* -------------------- Input -------------------- */

function InputScreen({ onContinue }: { onContinue: () => void }) {
  const [modal, setModal] = useState<null | "yes" | "not-yet">(null);

  const modalCopy =
    modal === "yes"
      ? "You rock! Let's eat some toast."
      : modal === "not-yet"
        ? "Awesome! Rest is an important part of recovery. But then, so is toast."
        : "";

  return (
    <div className="h-full flex flex-col items-center justify-center text-center max-w-xl mx-auto py-8">
      <p className="font-pixel text-[10px] text-[var(--toast-crust)] mb-3">
        ★ POST-RUN TREATS DEPARTMENT ★
      </p>
      <h2 className="font-pixel text-[18px] sm:text-[24px] leading-[1.4] text-[var(--ink)] whitespace-nowrap">
        DID YOU GO FOR A RUN?
      </h2>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
        <button onClick={() => setModal("yes")} className="pixel-btn-primary">
          Yes
        </button>
        <button onClick={() => setModal("not-yet")} className="pixel-btn">
          Not yet
        </button>
      </div>

      <p className="font-body text-xs opacity-60 mt-10 max-w-xs">
        May all your runs end with toast
      </p>

      {modal && (
        <div
          className="share-modal-backdrop"
          onClick={() => setModal(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Toast time"
        >
          <div className="share-modal text-center" onClick={(e) => e.stopPropagation()}>
            <p className="font-pixel text-[9px] mb-3" style={{ color: "var(--toast-crust)" }}>
              ★ TOAST TIME ★
            </p>
            <p className="font-body text-base text-[var(--ink)] leading-snug mb-5">
              {modalCopy}
            </p>
            <div className="flex justify-center">
              <button onClick={onContinue} className="pixel-btn-primary">
                
                <span className="align-middle">Time for toast</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------- Builder -------------------- */


function BuilderScreen({
  breadId,
  setBreadId,
  toppings,
  setToppings,
  breadStep,
  setBreadStep,
  onLock,
}: {
  breadId: BreadId;
  setBreadId: (b: BreadId) => void;
  toppings: ToppingId[];
  setToppings: (t: ToppingId[]) => void;
  breadStep: boolean;
  setBreadStep: (v: boolean) => void;
  onLock: () => void;
}) {
  const [isOver, setIsOver] = useState(false);

  function addTopping(id: ToppingId) {
    setToppings([...toppings, id]);
  }
  function removeAt(i: number) {
    setToppings(toppings.filter((_, idx) => idx !== i));
  }

  if (breadStep) {
    return (
      <div className="pt-10">
        <header className="text-center mb-6">
          <p className="font-pixel text-[10px] text-[var(--toast-crust)]">STEP 1 OF 2</p>
          <h2 className="font-pixel text-[16px] sm:text-[20px] mt-2 text-[var(--ink)]">
            CHOOSE YOUR BREAD
          </h2>
        </header>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto">
          {BREADS.map((b) => {
            const selected = b.id === breadId;
            return (
              <button
                key={b.id}
                onClick={() => setBreadId(b.id)}
                className="flex flex-col items-center p-2 bg-[var(--card)]"
                style={{
                  border: `3px solid ${selected ? "var(--turquoise)" : "var(--ink)"}`,
                  boxShadow: selected ? "4px 4px 0 0 var(--turquoise)" : "3px 3px 0 0 var(--ink)",
                  cursor: "pointer",
                }}
                aria-pressed={selected}
              >
                <BreadCanvas breadId={b.id} toppings={[]} size={110} />
                <span className="font-pixel text-[9px] mt-2 text-center text-[var(--ink)]">
                  {b.name.toUpperCase()}
                </span>
              </button>
            );
          })}
        </div>
        <div className="flex justify-center mt-8">
          <button onClick={() => setBreadStep(false)} className="pixel-btn-primary">
            Next: Toppings
          </button>
        </div>
      </div>
    );
  }

  const spreads = TOPPINGS.filter((t) => t.side === "spread");
  const extras = TOPPINGS.filter((t) => t.side === "extra");

  return (
    <div className="pt-10">
      <header className="text-center mb-4">
        <p className="font-pixel text-[10px] text-[var(--toast-crust)]">STEP 2 OF 2</p>
        <h2 className="font-pixel text-[14px] sm:text-[18px] mt-2 text-[var(--ink)]">
          BUILD YOUR TOAST
        </h2>
        <p className="font-body text-xs opacity-70 mt-1">
          Drag (or tap) to add. No limit. No judgment.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-3 md:gap-4 items-start">
        {/* Left: Spreads & Bases */}
        <ToppingColumn
          title="SPREADS & BASES"
          items={spreads}
          onAdd={addTopping}
        />

        {/* Center: canvas */}
        <div className="flex flex-col items-center">
          <div
            className={`drop-target bg-[var(--paper)] p-3 ${isOver ? "is-over" : ""}`}
            style={{
              border: "3px dashed var(--toast-crust)",
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setIsOver(true);
            }}
            onDragLeave={() => setIsOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsOver(false);
              const id = e.dataTransfer.getData("text/topping");
              if (id) addTopping(id);
            }}
            aria-label="Toast canvas"
          >
            <BreadCanvas breadId={breadId} toppings={toppings} size={300} />
          </div>
          <button
            onClick={() => setBreadStep(true)}
            className="pixel-btn-ghost mt-3"
            style={{ color: "var(--ink)" }}
          >
            Change bread
          </button>

          {/* Stack list */}
          {toppings.length > 0 && (
            <div
              className="mt-3 w-full max-w-[300px] bg-[var(--card)] p-2"
              style={{ border: "2px solid var(--ink)" }}
            >
              <p className="font-pixel text-[8px] mb-1" style={{ color: "var(--toast-crust)" }}>
                STACK ({toppings.length})
              </p>
              <ol className="flex flex-wrap gap-1">
                {toppings.map((id, i) => {
                  const t = getTopping(id);
                  if (!t) return null;
                  return (
                    <li key={`${id}-${i}`}>
                      <button
                        onClick={() => removeAt(i)}
                        className="font-body text-[11px] px-1.5 py-0.5"
                        style={{
                          background: "var(--paper)",
                          border: "1.5px solid var(--ink)",
                          cursor: "pointer",
                        }}
                        aria-label={`Remove ${t.name}`}
                        title="Remove"
                      >
                        {t.name} ×
                      </button>
                    </li>
                  );
                })}
              </ol>
            </div>
          )}
        </div>

        {/* Right: Toppings & Extras */}
        <ToppingColumn
          title="TOPPINGS & EXTRAS"
          items={extras}
          onAdd={addTopping}
        />
      </div>

      <div className="flex justify-center mt-6">
        <button onClick={onLock} className="pixel-btn-primary">
          Let&apos;s eat!
        </button>
      </div>
    </div>
  );
}

function ToppingColumn({
  title,
  items,
  onAdd,
}: {
  title: string;
  items: typeof TOPPINGS;
  onAdd: (id: ToppingId) => void;
}) {
  return (
    <div
      className="bg-[var(--card)] p-2 sm:p-3"
      style={{ border: "3px solid var(--ink)", boxShadow: "3px 3px 0 0 var(--ink)" }}
    >
      <p className="font-pixel text-[9px] mb-2 text-center" style={{ color: "var(--toast-crust)" }}>
        {title}
      </p>
      <div className="grid grid-cols-2 gap-1.5">
        {items.map((t) => (
          <div
            key={t.id}
            className="topping-chip"
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData("text/topping", t.id);
              e.dataTransfer.effectAllowed = "copy";
            }}
            onClick={() => onAdd(t.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onAdd(t.id);
              }
            }}
          >
            <span
              aria-hidden
              className="topping-chip-emoji"
              style={{ background: t.color, border: `1.5px solid ${t.accent ?? "var(--ink)"}` }}
            >
              {t.emoji}
            </span>
            <span className="leading-tight">{t.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------------------- Share -------------------- */

function ShareScreen({
  breadId,
  toppings,
  toastCount,
  onBuildAgain,
}: {
  breadId: BreadId;
  toppings: ToppingId[];
  toastCount: number;
  onBuildAgain: () => void;
}) {
  const name = useMemo(() => generateName(breadId, toppings), [breadId, toppings]);
  const recipe = useMemo(() => generateRecipe(breadId, toppings), [breadId, toppings]);
  const bread = getBread(breadId);
  const [shareOpen, setShareOpen] = useState(false);

  const shareText = `${name} — a ${bread.name} toast for my ${toastCount}-toast run. Built on RunchBase.`;
  const shareUrl = typeof window !== "undefined" ? window.location.origin : "https://runchbase.app";

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      sonnerToast.success("Copied to clipboard — share away.");
    } catch {
      sonnerToast.error("Couldn't copy link.");
    }
  }
  function emailIt() {
    const subj = encodeURIComponent(`${name} — a ${toastCount}-toast run`);
    const body = encodeURIComponent(`${shareText}\n\n${recipe.join("\n")}\n\n${shareUrl}`);
    window.location.href = `mailto:?subject=${subj}&body=${body}`;
  }

  const enc = encodeURIComponent;
  const socialLinks: { label: string; emoji: string; href: string }[] = [
    {
      label: "Twitter / X",
      emoji: "🐦",
      href: `https://twitter.com/intent/tweet?text=${enc(shareText)}&url=${enc(shareUrl)}`,
    },
    {
      label: "Facebook",
      emoji: "📘",
      href: `https://www.facebook.com/sharer/sharer.php?u=${enc(shareUrl)}&quote=${enc(shareText)}`,
    },
    {
      label: "Reddit",
      emoji: "👽",
      href: `https://www.reddit.com/submit?url=${enc(shareUrl)}&title=${enc(shareText)}`,
    },
    {
      label: "LinkedIn",
      emoji: "💼",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(shareUrl)}`,
    },
    {
      label: "WhatsApp",
      emoji: "💬",
      href: `https://wa.me/?text=${enc(`${shareText} ${shareUrl}`)}`,
    },
    {
      label: "Threads",
      emoji: "🧵",
      href: `https://www.threads.net/intent/post?text=${enc(`${shareText} ${shareUrl}`)}`,
    },
  ];

  return (
    <div className="pt-12 pb-2">
      {/* The "share card" */}
      <article
        className="mx-auto max-w-[560px] bg-[var(--card)] p-4 sm:p-5"
        style={{
          border: "4px solid var(--ink)",
          boxShadow: "6px 6px 0 0 var(--ink)",
        }}
      >
        <header className="flex items-start justify-between gap-3 mb-3">
          <div>
            <p className="font-pixel text-[9px]" style={{ color: "var(--toast-crust)" }}>
              ★ RUNCHBASE ★
            </p>
            <h3 className="font-pixel text-[14px] sm:text-[16px] mt-2 leading-tight text-[var(--ink)]">
              {name.toUpperCase()}
            </h3>
            <p className="font-body text-sm opacity-80 mt-1">
              You ran a <strong>{toastCount}-toast run</strong>. Here&apos;s what you built to celebrate.
            </p>
          </div>
          <ToastsHUD count={toastCount} />
        </header>

        {/* Dazzling MySpace-era stage around the toast */}
        <div
          className="dazzle-stage flex items-center justify-center py-6 my-2"
          style={{ border: "3px solid var(--ink)", minHeight: 320 }}
        >
          <div className="dazzle-rays" aria-hidden />
          <div className="dazzle-stars" aria-hidden />
          <span className="dazzle-corner" style={{ top: 8, left: 10 }} aria-hidden>
            ★ TOAST ★
          </span>
          <span className="dazzle-corner" style={{ bottom: 8, right: 10 }} aria-hidden>
            ✦ WOW ✦
          </span>
          <div className="dazzle-toast">
            <BreadCanvas breadId={breadId} toppings={toppings} size={260} />
          </div>
        </div>

        <div className="mt-3">
          <p className="font-pixel text-[9px] mb-2" style={{ color: "var(--toast-crust)" }}>
            RECIPE
          </p>
          <ol className="font-body text-sm text-[var(--ink)] space-y-1 list-none">
            {recipe.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ol>
        </div>

        <footer className="flex items-center justify-between mt-4 pt-3" style={{ borderTop: "2px dashed var(--ink)" }}>
          <span className="font-pixel text-[8px]" style={{ color: "var(--toast-crust)" }}>
            BUILT ON RUNCHBASE
          </span>
          <a
            href={shareUrl}
            className="font-body text-xs underline"
            style={{ color: "var(--ink)" }}
          >
            {shareUrl.replace(/^https?:\/\//, "")}
          </a>
        </footer>
      </article>

      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-6">
        <button onClick={() => setShareOpen(true)} className="pixel-btn-primary">Share</button>
        <button onClick={copyLink} className="pixel-btn">Copy link</button>
        <button onClick={emailIt} className="pixel-btn">Email</button>
        <button onClick={onBuildAgain} className="pixel-btn-ghost">TWEAK YOUR TOAST</button>
      </div>

      {shareOpen && (
        <div
          className="share-modal-backdrop"
          onClick={() => setShareOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Share on social"
        >
          <div className="share-modal" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-pixel text-[9px]" style={{ color: "var(--toast-crust)" }}>
                  ★ SHARE THE TOAST ★
                </p>
                <h4 className="font-pixel text-[13px] mt-2 text-[var(--ink)]">
                  POST YOUR {toastCount}-TOAST RUN
                </h4>
              </div>
              <button
                onClick={() => setShareOpen(false)}
                className="pixel-btn-ghost"
                aria-label="Close share dialog"
              >
                ✕
              </button>
            </div>
            <p className="font-body text-sm text-[var(--ink)] opacity-80 mb-3">
              Pick a place to brag (gently).
            </p>
            <div className="grid grid-cols-2 gap-2">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pixel-btn"
                  style={{ justifyContent: "flex-start" }}
                >
                  
                  <span>{s.label}</span>
                </a>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              <button
                onClick={async () => {
                  await copyLink();
                  setShareOpen(false);
                }}
                className="pixel-btn-ghost"
              >
                Copy text + link
              </button>
              {typeof navigator !== "undefined" && (navigator as Navigator).share && (
                <button
                  onClick={async () => {
                    try {
                      await (navigator as Navigator).share({
                        title: "RunchBase",
                        text: shareText,
                        url: shareUrl,
                      });
                      setShareOpen(false);
                    } catch {
                      /* dismissed */
                    }
                  }}
                  className="pixel-btn-ghost"
                >
                  System share
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
