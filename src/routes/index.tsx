import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import posthog from "posthog-js";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast as sonnerToast } from "sonner";

import { generateAiRecipe } from "@/lib/recipe-ai.functions";
import { createHubSpotContact } from "@/lib/hubspot.functions";

import angelToast from "@/assets/angel-toast.png";
import { ToastAngel } from "@/components/ToastAngel";
import { BreadCanvas } from "@/components/BreadCanvas";
import { SelectionToast, getSelectionMessage } from "@/components/SelectionToast";
import { SaltFall } from "@/components/SaltFall";
import { NavMenu } from "@/components/NavMenu";


import { cardKey } from "@/lib/cardKey";
import { buildShareSlug, SHARE_ORIGIN } from "@/lib/shortShare";
import { useFeatureFlagVariant } from "@/lib/posthog";

import {
  BREADS,
  TOPPINGS,
  calculateNutrition,
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
      { title: "PostToast — Build your perfect toast" },
      {
        name: "description",
        content:
          "Pick a bread. Pile on toppings. Get a one-of-a-kind toast recipe to share.",
      },
      { property: "og:title", content: "PostToast" },
      { property: "og:description", content: "Toast, the champion of treats." },
    ],
  }),
  component: PostToast,
});

type Phase = "input" | "builder" | "share";

function PostToast() {
  const [phase, setPhase] = useState<Phase>("input");
  const [breadId, setBreadId] = useState<BreadId>("white");
  const [breadStep, setBreadStep] = useState(true); // step 1 vs step 2 in builder
  const [toppings, setToppings] = useState<ToppingId[]>([]);
  const [salted, setSalted] = useState(false);

  const toastCount = 1;

  function reset() {
    setPhase("input");
    setBreadId("white");
    setBreadStep(true);
    setToppings([]);
    setSalted(false);
  }

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-3 sm:p-6">
      <div className="w-full max-w-[1080px] arcade-cabinet p-3 sm:p-6">
        {/* Cabinet marquee */}
        <div className="flex items-center justify-between gap-3 mb-3 sm:mb-4 px-2">
          <Link to="/" className="flex items-center gap-2 sm:gap-3 cursor-pointer">
            <img
              src={angelToast}
              alt="Angel toast"
              width={28}
              height={28}
              className="opacity-90"
            />
            <h1
              className="font-pixel text-[var(--paper)] text-[14px] sm:text-[18px] leading-none"
              style={{ textShadow: "2px 2px 0 var(--tomato)" }}
            >
              PostToast
            </h1>
          </Link>
          <NavMenu
            links={[
              { to: "/about", label: "About" },
              { to: "/how-it-works", label: "How It Works" },
            ]}
            extras={
              phase !== "input" ? (
                <button onClick={reset} className="pixel-btn-ghost text-[var(--paper)] border-[var(--paper)]">
                  Start over
                </button>
              ) : null
            }
          />
        </div>

        {/* Screen */}
        <div className="relative arcade-screen crt p-4 sm:p-8 min-h-[520px] flex flex-col">

          {phase === "input" && (
            <InputScreen
              onContinue={() => setPhase("builder")}
            />
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
              salted={salted}
              onSalted={() => setSalted(true)}
              onUnsalt={() => setSalted(false)}
            />
          )}

          {phase === "share" && (
            <ShareScreen
              breadId={breadId}
              toppings={toppings}
              toastCount={toastCount}
              onBuildAgain={() => setPhase("builder")}
              salted={salted}
            />
          )}
        </div>

        {/* Cabinet footer */}
        <div className="flex items-center justify-between px-2 pt-3 sm:pt-4 text-[var(--paper)] opacity-70">
          <a href="https://www.bethdunn.com" target="_blank" rel="noopener noreferrer" className="font-pixel text-[9px] hover:underline">© Beth Dunn</a>
          <span className="font-body text-xs">because toast is the most</span>
        </div>
      </div>
    </main>
  );
}


/* -------------------- Input -------------------- */

function InputScreen({
  onContinue,
}: {
  onContinue: () => void;
}) {
  const [modal, setModal] = useState<null | "yes" | "not-yet">(null);

  const line1 = "DO YOU WANT TO";
  const line2 = "MAKE SOME TOAST?";
  const fullText = line1 + " " + line2;
  const line1Len = line1.length;

  const [displayed, setDisplayed] = useState(fullText.slice(0, 1));
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 1;
    const interval = setInterval(() => {
      i++;
      setDisplayed(fullText.slice(0, i));
      if (i >= fullText.length) {
        clearInterval(interval);
        setDone(true);
      }
    }, 150);
    return () => clearInterval(interval);
  }, []);

  const modalCopy =
    modal === "yes"
      ? "Heck yeah you do!"
      : modal === "not-yet"
        ? "You totally do!"
        : "";

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center max-w-xl mx-auto py-8 gap-8">
      <div className="flex flex-col items-center">
        <p className="font-pixel text-[10px] text-[var(--toast-crust)] mb-5">
          DELICIOUS TREATS DEPARTMENT
        </p>
        <h2 className="font-pixel text-[18px] sm:text-[24px] leading-[1.4] text-[var(--ink)] min-h-[52px] sm:min-h-[70px]">
          {displayed.length <= line1Len ? displayed : (
            <>
              {line1}
              <span className="sm:hidden"><br /></span>
              <span className="hidden sm:inline">{" "}</span>
              {displayed.slice(line1Len + 1)}
            </>
          )}
          {!done && (
            <span className="inline-block w-[0.5em] h-[1em] bg-[var(--ink)] ml-0.5 animate-pulse align-middle" />
          )}
        </h2>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
        <button
          onClick={() => {
            posthog.capture("home_yes_clicked");
            setModal("yes");
          }}
          className="pixel-btn-primary"
        >
          Yes
        </button>
        <button
          onClick={() => {
            posthog.capture("home_convince_me_clicked");
            setModal("not-yet");
          }}
          className="pixel-btn"
        >
          CONVINCE ME
        </button>
      </div>


      <div className="flex flex-col items-center gap-1 mt-auto">
        <ToastAngel
          title="toast angel, toast angel, will you be mine?"
          width={96}
          height={96}
        />
        <p className="font-body text-xs opacity-60 max-w-xs">
          In toast we trust
        </p>
      </div>

      {modal && (
        <div
          className="share-modal-backdrop"
          onClick={() => setModal(null)}
          role="dialog"
          aria-modal="true"
          aria-label="It's toasty time"
        >
          <div className="share-modal text-center" onClick={(e) => e.stopPropagation()}>
            <p className="font-pixel text-[9px] mb-3" style={{ color: "var(--toast-crust)" }}>
              {modal === "yes" ? "I WANT SOME TOAST" : "DO I REALLY WANT TOAST?"}
            </p>
            <p className="font-body text-base text-[var(--ink)] leading-snug mb-5">
              {modalCopy}
            </p>
            <div className="flex justify-center">
              <button
                onClick={() => {
                  posthog.capture("lets_toast_clicked", { modal: modal });
                  onContinue();
                }}
                className="pixel-btn-primary"
              >
                <span className="align-middle">LET'S TOAST</span>
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
  salted,
  onSalted,
  onUnsalt,
}: {
  breadId: BreadId;
  setBreadId: (b: BreadId) => void;
  toppings: ToppingId[];
  setToppings: (t: ToppingId[]) => void;
  breadStep: boolean;
  setBreadStep: (v: boolean) => void;
  onLock: () => void;
  salted: boolean;
  onSalted: () => void;
  onUnsalt: () => void;
}) {
  const [isOver, setIsOver] = useState(false);
  const [selectionToast, setSelectionToast] = useState<{ message: string; id: number } | null>(null);
  const [saltFalling, setSaltFalling] = useState(false);

  // Experiment "ingredients-cta-copy-test": the "make-my-toast" variant swaps
  // the CTA copy to reinforce that a recipe is generated next. Reading the flag
  // here also registers the user's exposure.
  const ctaVariant = useFeatureFlagVariant("ingredients-cta-copy-test");
  const ctaLabel = ctaVariant === "make-my-toast" ? "Make my toast" : "Let's eat!";

  function addSalt() {
    if (saltFalling) return;
    posthog.capture("add_salt_clicked", { bread_id: breadId, topping_count: toppings.length });
    setSelectionToast({ message: "SALTY GOODNESS FTW", id: Date.now() });
    setSaltFalling(true);
    onSalted();
    window.setTimeout(() => {
      setSaltFalling(false);
    }, 7500);
  }


  useEffect(() => {
    if (!selectionToast) return;
    const t = setTimeout(() => setSelectionToast(null), 3000);
    return () => clearTimeout(t);
  }, [selectionToast]);

  function showToast(id: string) {
    const message = getSelectionMessage(id);
    if (message) {
      setSelectionToast({ message, id: Date.now() });
    }
  }

  function selectBread(id: BreadId) {
    setBreadId(id);
    posthog.capture("bread_chosen", { bread_id: id });
    showToast(id);
  }

  function addTopping(id: ToppingId) {
    const next = [...toppings, id];
    setToppings(next);
    posthog.capture("topping_chosen", { topping_id: id, stack_size: next.length });
    if (next.length === 1) {
      posthog.capture("first_topping_chosen", { topping_id: id });
    }
    showToast(id);
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
            GET BREADY
          </h2>
        </header>
        <div className="relative max-w-3xl mx-auto">
          {selectionToast && (
            <SelectionToast key={selectionToast.id} message={selectionToast.message} />
          )}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {BREADS.map((b) => {
              const selected = b.id === breadId;
              return (
                <button
                  key={b.id}
                  onClick={() => selectBread(b.id)}
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
        </div>
        <div className="flex justify-center mt-8">
          <button
            onClick={() => {
              posthog.capture("choose_toppings_clicked", { bread_id: breadId });
              setBreadStep(false);
            }}
            className="pixel-btn-primary"
          >
            Next: Toppings
          </button>
        </div>
      </div>
    );
  }

  const spreads = TOPPINGS.filter((t) => t.side === "spread");
  const extras = TOPPINGS.filter((t) => t.side === "extra");

  return (
    <div className="pt-4">
      <header className="text-center mb-2">
        <p className="font-pixel text-[10px] text-[var(--toast-crust)]">STEP 2 OF 2</p>
        <h2 className="font-pixel text-[14px] sm:text-[18px] mt-2 text-[var(--ink)]">
          TOP OFF YOUR TOAST
        </h2>
        <p className="font-body text-xs opacity-70 mt-1">
          Tap to add. No limits. No shade.
        </p>
      </header>

      <div className="relative">
        {selectionToast && (
          <SelectionToast key={selectionToast.id} message={selectionToast.message} />
        )}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-3 md:gap-4 items-start">
          {/* Left: Spreads & Bases + Stack */}
          <div className="flex flex-col gap-3">
            <ToppingColumn
              title="SPREADS & BASES"
              items={spreads}
              onAdd={addTopping}
            />

            {/* Stack list */}
            {(toppings.length > 0 || salted) && (
              <div
                className="w-full bg-[var(--card)] p-2"
                style={{ border: "2px solid var(--ink)" }}
              >
                <p className="font-pixel text-[8px] mb-1" style={{ color: "var(--toast-crust)" }}>
                  STACK ({toppings.length + (salted ? 1 : 0)})
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
                  {salted && (
                    <li key="salt">
                      <button
                        onClick={() => {
                          posthog.capture("remove_salt_clicked", { bread_id: breadId, topping_count: toppings.length });
                          onUnsalt();
                        }}
                        className="font-body text-[11px] px-1.5 py-0.5"
                        style={{
                          background: "var(--paper)",
                          border: "1.5px solid var(--ink)",
                          cursor: "pointer",
                        }}
                        aria-label="Remove salt"
                        title="Remove"
                      >
                        Salt ×
                      </button>
                    </li>
                  )}
                </ol>
              </div>
            )}
          </div>

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
              <BreadCanvas breadId={breadId} toppings={toppings} size={300} salted={salted} />
            </div>
            <div className="flex flex-wrap gap-2 mt-3 justify-center">
              <button
                onClick={() => setBreadStep(true)}
                className="pixel-btn-ghost"
                style={{ color: "var(--ink)" }}
              >
                Change bread
              </button>
              <button
                onClick={addSalt}
                disabled={saltFalling}
                className="pixel-btn-ghost"
                style={{ color: "var(--ink)" }}
              >
                Add salt
              </button>
            </div>

            <button
              onClick={() => {
                posthog.capture("lets_eat_clicked", {
                  bread_id: breadId,
                  topping_count: toppings.length,
                  toppings,
                });
                onLock();
              }}
              className="pixel-btn-primary mt-3"
            >
              {ctaLabel}
            </button>
          </div>

          {/* Right: Toppings & Extras */}
          <ToppingColumn
            title="TOPPINGS & EXTRAS"
            items={extras}
            onAdd={addTopping}
          />
        </div>
      </div>
      {saltFalling && <SaltFall />}
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
  salted,
}: {
  breadId: BreadId;
  toppings: ToppingId[];
  toastCount: number;
  onBuildAgain: () => void;
  salted: boolean;
}) {
  const fallbackName = useMemo(() => generateName(breadId, toppings), [breadId, toppings]);
  const fallbackRecipe = useMemo(() => generateRecipe(breadId, toppings), [breadId, toppings]);
  const nutrition = useMemo(() => calculateNutrition(breadId, toppings), [breadId, toppings]);
  const bread = getBread(breadId);

  // AI-generated recipe (Claude via Lovable AI Gateway). Falls back to local
  // rule-based generator on error.
  const traceIdRef = useRef<string>(
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `trace-${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
  const generateAiRecipeFn = useServerFn(generateAiRecipe);
  const aiQuery = useQuery({
    queryKey: ["ai-recipe", breadId, toppings.join(","), salted],
    queryFn: () => generateAiRecipeFn({ data: { breadId, toppingIds: toppings, salted } }),
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const aiOk =
    !!aiQuery.data &&
    aiQuery.data.name &&
    aiQuery.data.steps &&
    aiQuery.data.steps.length > 0;
  const name = aiOk ? (aiQuery.data!.name as string) : fallbackName;
  const recipe = aiOk
    ? (aiQuery.data!.steps as string[]).map((s, i) => `${i + 1}. ${s}`)
    : fallbackRecipe;

  // Fire analytics once per resolved recipe (success or fallback).
  const reportedRef = useRef<string | null>(null);
  useEffect(() => {
    if (aiQuery.isLoading) return;
    const key = `${breadId}|${toppings.join(",")}|${salted}|${
      aiQuery.data?.error ?? "ok"
    }`;
    if (reportedRef.current === key) return;
    reportedRef.current = key;

    const source: "ai" | "fallback" = aiOk ? "ai" : "fallback";
    const latencyMs = aiQuery.data?.latencyMs ?? null;
    const model = aiQuery.data?.model ?? null;

    posthog.capture("toast_recipe_generated", {
      source,
      latency_ms: latencyMs,
      model,
      bread_id: breadId,
      topping_count: toppings.length,
      salted,
    });

    // PostHog AI Observability event — only fire when we actually called the AI,
    // including when the call errored (so error rate shows in the dashboard).
    if (aiQuery.data && aiQuery.data.model) {
      const usage = aiQuery.data.usage ?? {};
      const aiProps: Record<string, unknown> = {
        $ai_trace_id: traceIdRef.current,
        $ai_provider: aiQuery.data.model.startsWith("anthropic/")
          ? "anthropic"
          : aiQuery.data.model.startsWith("google/")
            ? "google"
            : "lovable",
        $ai_model: aiQuery.data.model,
        $ai_is_error: !!aiQuery.data.error,
      };
      if (typeof latencyMs === "number") {
        // PostHog AI Observability expects latency in seconds.
        aiProps.$ai_latency = latencyMs / 1000;
      }
      if (typeof usage.promptTokens === "number") {
        aiProps.$ai_input_tokens = usage.promptTokens;
      }
      if (typeof usage.completionTokens === "number") {
        aiProps.$ai_output_tokens = usage.completionTokens;
      }
      if (typeof usage.totalTokens === "number") {
        aiProps.$ai_total_tokens = usage.totalTokens;
      }
      if (aiQuery.data.error) {
        aiProps.$ai_error = aiQuery.data.error;
      }
      posthog.capture("$ai_generation", aiProps);
    }
  }, [aiQuery.isLoading, aiQuery.data, aiOk, breadId, toppings, salted]);


  const [shareOpen, setShareOpen] = useState(false);
  const [shareEmail, setShareEmail] = useState("");
  // We only identify a given sharer once per share session, even if they try
  // several share methods in a row.
  const identifiedRef = useRef(false);
  const cardRef = useRef<HTMLElement | null>(null);
  const uploadedRef = useRef<string | null>(null);
  const variant = useMemo(() => {
    const variants = ["", "variant-starfield", "variant-hearts", "variant-toasters", "variant-glitter", "variant-myspace", "variant-skulls"];
    return variants[Math.floor(Math.random() * variants.length)];
  }, []);
  const plate = useMemo(() => `plate-${1 + Math.floor(Math.random() * 5)}`, []);


  const shareText = `${name} — a ${bread.name} toast. Built on PostToast.`;
  // Always share the canonical custom-domain URL with a short, silly slug
  // like /r/awesome-toast-mix-15100. The trailing digits encode bread,
  // toppings, and salt so the /r/$slug page can reconstruct the recipe.
  const shareUrl = useMemo(() => {
    const slug = buildShareSlug(name, breadId, toppings, salted);
    return `${SHARE_ORIGIN}/r/${slug}`;
  }, [name, breadId, toppings, salted]);


  // Capture the share card and upload it so /r OG tags resolve to a real image.
  // Width is forced to a fixed value so the captured image is identical
  // regardless of the visitor's viewport — otherwise on narrow screens the
  // article renders smaller than the toast/plate inside it and the right side
  // gets clipped in link previews.
  async function ensureCardUploaded(): Promise<string | null> {
    if (uploadedRef.current) return uploadedRef.current;
    const node = cardRef.current;
    if (!node) return null;
    try {
      const { toPng } = await import("html-to-image");
      // Force a fixed desktop-sized layout, then measure the resulting
      // height so the capture canvas matches the card's actual rendered
      // bounds (plus a margin for the offset box-shadow on the right/bottom).
      const CAPTURE_WIDTH = 600;
      const SHADOW_PAD = 16;
      const prevWidth = node.style.width;
      const prevMaxWidth = node.style.maxWidth;
      node.style.width = `${CAPTURE_WIDTH}px`;
      node.style.maxWidth = `${CAPTURE_WIDTH}px`;
      // Force a reflow so we measure the new width's height.
      void node.offsetHeight;
      const measuredHeight = Math.ceil(node.getBoundingClientRect().height);

      const dataUrl = await toPng(node, {
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: "#ffffff",
        width: CAPTURE_WIDTH + SHADOW_PAD,
        height: measuredHeight + SHADOW_PAD,
        style: {
          width: `${CAPTURE_WIDTH}px`,
          maxWidth: `${CAPTURE_WIDTH}px`,
          margin: "0",
          // Push the card in slightly so the offset box-shadow is captured
          // instead of being clipped at the canvas edge.
          boxSizing: "border-box",
          transform: "translate(0, 0)",
        },
      });

      node.style.width = prevWidth;
      node.style.maxWidth = prevMaxWidth;

      const key = cardKey(breadId, toppings, salted);
      const res = await fetch("/api/public/upload-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, dataUrl }),
      });
      if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
      const { url } = (await res.json()) as { url: string };
      uploadedRef.current = url;
      return url;
    } catch (err) {
      console.error("[share] card upload failed", err);
      sonnerToast.error("Couldn't prepare the share image — link previews may be blank.");
      return null;
    }
  }


  // Kick off the upload once the AI recipe has resolved so the captured card
  // contains the final recipe text, not the "Cooking up your recipe…" stub.
  useEffect(() => {
    if (aiQuery.isLoading) return;
    void ensureCardUploaded();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiQuery.isLoading, name]);


  const enc = encodeURIComponent;
  type SocialLink = { label: string; href: string };
  const emailHref = `mailto:?subject=${enc(`${name} — a toast for you`)}&body=${enc(`I made you a toast on PostToast!

${shareUrl}`)}`;
  const socialLinks: SocialLink[] = [
    { label: "Email", href: emailHref },
    { label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(shareUrl)}` },
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${enc(shareUrl)}&quote=${enc(shareText)}` },
    { label: "Threads", href: `https://www.threads.net/intent/post?text=${enc(`${shareText} ${shareUrl}`)}` },
  ];

  // If the sharer chose to give us their email, attach it to their PostHog
  // identity so their (previously anonymous) journey becomes attributable, and
  // record a share_email_captured event. Entirely optional — does nothing when
  // the field is left blank or doesn't look like an email.
  function captureShareEmail(method: string) {
    const email = shareEmail.trim();
    if (!email || identifiedRef.current) return;
    // Light validation — just enough to skip obvious typos, not a strict check.
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    identifiedRef.current = true;
    try {
      posthog.identify(email, { email });
      posthog.capture("share_email_captured", {
        share_method: method,
        bread_id: breadId,
        topping_count: toppings.length,
      });
    } catch {
      /* posthog not initialized yet */
    }
    // Best-effort push to HubSpot; never blocks the UI.
    createHubSpotContact({ data: { email, source: method } }).catch(() => {});
  }

  function openShare(href: string) {
    void ensureCardUploaded();

    if (href.startsWith("mailto:")) {
      window.location.href = href;
      return;
    }

    const w = window.open(href, "_blank");
    if (!w) {
      sonnerToast.error("Pop-up blocked — allow pop-ups for PostToast to share.");
      return;
    }
    try { w.opener = null; } catch { /* cross-origin */ }
  }

  return (
    <div className="pt-12 pb-2">
      {/* The "share card" */}
      <article
        ref={cardRef}
        className="mx-auto max-w-[560px] bg-[var(--card)] p-4 sm:p-5"
        style={{
          border: "4px solid var(--ink)",
          boxShadow: "6px 6px 0 0 var(--ink)",
        }}
      >
        <header className="mb-3">
          <div className="w-full">
            <p className="font-pixel text-[9px]" style={{ color: "var(--toast-crust)" }}>
              PostToast
            </p>
            <h3 className="font-pixel text-[14px] sm:text-[16px] mt-2 leading-tight text-[var(--ink)]">
              {name.toUpperCase()}
            </h3>
            <p className="font-body text-sm opacity-80 mt-1">
              A toast as tasty as you.
            </p>
          </div>
        </header>

        {/* Dazzling MySpace-era stage around the toast */}
        <div
          className={`dazzle-stage ${variant} flex items-center justify-center py-6 my-2`}
          style={{ border: "3px solid var(--ink)", minHeight: 320 }}
        >
          <div className="dazzle-rays" aria-hidden />
          <div className="dazzle-stars" aria-hidden />
          <span className="dazzle-corner" style={{ top: 8, left: 10 }} aria-hidden>
            YUM
          </span>
          <span className="dazzle-corner" style={{ top: 8, right: 10 }} aria-hidden>
            TOAST
          </span>
          <span className="dazzle-corner" style={{ bottom: 8, left: 10 }} aria-hidden>
            WOW
          </span>
          <span className="dazzle-corner" style={{ bottom: 8, right: 10 }} aria-hidden>
            YES
          </span>
          <div className={`dazzle-toast ${plate}`}>
            <BreadCanvas breadId={breadId} toppings={toppings} size={260} salted={salted} />
          </div>
        </div>

        <div className="mt-3">
          <p className="font-pixel text-[9px] mb-2" style={{ color: "var(--toast-crust)" }}>
            RECIPE
          </p>
          {aiQuery.isLoading ? (
            <p className="font-body text-sm text-[var(--ink)] opacity-70 italic">
              Cooking up your recipe…
            </p>
          ) : (
            <ol className="font-body text-sm text-[var(--ink)] space-y-1 list-none">
              {recipe.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ol>
          )}
        </div>

        {aiOk && aiQuery.data?.pairing ? (
          <div className="mt-4">
            <p className="font-pixel text-[9px] mb-2" style={{ color: "var(--toast-crust)" }}>
              GOES WELL WITH
            </p>
            <p className="font-body text-sm text-[var(--ink)]">
              {aiQuery.data.pairing}
            </p>
          </div>
        ) : null}

        <div className="mt-4">
          <p className="font-pixel text-[9px] mb-2" style={{ color: "var(--toast-crust)" }}>
            NUTRITION (approx, per toast)
          </p>
          <div
            className="grid grid-cols-4 gap-2"
            style={{ border: "2px solid var(--ink)", padding: "8px" }}
          >
            {[
              { label: "CAL", value: nutrition.calories },
              { label: "CARBS", value: `${nutrition.carbs}g` },
              { label: "PROTEIN", value: `${nutrition.protein}g` },
              { label: "FAT", value: `${nutrition.fat}g` },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center text-center">
                <span className="font-pixel text-[8px]" style={{ color: "var(--toast-crust)" }}>
                  {stat.label}
                </span>
                <span className="font-pixel text-[12px] text-[var(--ink)] mt-1">
                  {stat.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        <footer
          className="flex flex-col items-center justify-center mt-4 pt-3 gap-2"
          style={{ borderTop: "2px dashed var(--ink)" }}
        >
          <span className="font-body text-xs text-[var(--ink)] opacity-80">
            Everyone deserves a good toast.
          </span>
          <img
            src={angelToast}
            alt=""
            width={48}
            height={48}
            className="opacity-80"
            draggable={false}
          />

        </footer>
      </article>

      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-6">
        <button onClick={onBuildAgain} className="pixel-btn-ghost">Tweak your toast</button>
        <button
          onClick={() => {
            posthog.capture("share_clicked", {
              bread_id: breadId,
              topping_count: toppings.length,
            });
            setShareOpen(true);
          }}
          className="pixel-btn-primary"
        >
          Share
        </button>
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
                  {"\n"}
                </p>
                <h4 className="font-pixel text-[13px] mt-2 text-[var(--ink)]">
                  SHARE YOUR TOAST
                </h4>
              </div>
              <button
                onClick={() => setShareOpen(false)}
                className="pixel-btn-ghost text-xl flex items-center justify-center w-10 h-10"
                aria-label="Close share dialog"
              >
                ✕
              </button>
            </div>
            <p className="font-body text-sm text-[var(--ink)] opacity-80 mb-3">
              Bring some toasty love to the world.
            </p>
            <div className="grid grid-cols-2 gap-2">

              {socialLinks.map((s) => (
                <button
                  key={s.label}
                  type="button"
                  className="pixel-btn"
                  style={{ justifyContent: "flex-start" }}
                  onClick={() => {
                    captureShareEmail(s.label.toLowerCase());
                    posthog.capture("recipe_shared", {
                      share_method: s.label.toLowerCase(),
                      bread_id: breadId,
                      topping_count: toppings.length,
                    });
                    openShare(s.href);
                    setShareOpen(false);
                  }}
                >
                  <span>{s.label}</span>
                </button>
              ))}
            </div>

            <div className="mt-4">
              <p className="font-pixel text-[9px] mb-2" style={{ color: "var(--toast-crust)" }}>
                OR COPY LINK
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  onFocus={(e) => e.currentTarget.select()}
                  aria-label="Shareable link to your toast"
                  className="flex-1 min-w-0 font-body text-xs text-[var(--ink)] bg-[var(--paper)] px-2 py-2"
                  style={{ border: "2px solid var(--ink)" }}
                />
                <button
                  type="button"
                  className="pixel-btn"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(shareUrl);
                      sonnerToast.success("Link copied!");
                      captureShareEmail("copy_link");
                      posthog.capture("recipe_shared", {
                        share_method: "copy_link",
                        bread_id: breadId,
                        topping_count: toppings.length,
                      });
                    } catch {
                      sonnerToast.error("Couldn't copy — select the link and copy manually.");
                    }
                  }}
                >
                  Copy
                </button>
              </div>
            </div>

            <div className="mt-5 pt-4" style={{ borderTop: "2px dashed var(--ink)" }}>
              <h5 className="font-pixel text-[11px] mb-2 text-[var(--ink)]">
                SUBSCRIBE TO TOASTY UPDATES
              </h5>
              <div className="flex gap-2">
                <input
                  id="share-email"
                  type="email"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                  placeholder="you@example.com"
                  aria-label="Your email (optional)"
                  className="flex-1 min-w-0 font-body text-xs text-[var(--ink)] bg-[var(--paper)] px-2 py-2"
                  style={{ border: "2px solid var(--ink)" }}
                />
                <button
                  type="button"
                  className="pixel-btn"
                  onClick={() => {
                    const email = shareEmail.trim();
                    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                      sonnerToast.error("Hmm, that email looks off.");
                      return;
                    }
                    if (identifiedRef.current) {
                      sonnerToast.success("Thanks! You're the toastiest.");
                      return;
                    }
                    captureShareEmail("submit");
                    sonnerToast.success("Thanks! You're the toastiest.");
                  }}
                >
                  Submit
                </button>
              </div>
              <p className="font-body text-[11px] text-[var(--ink)] opacity-70 mt-1">
                Totally optional. Updates will be rare and non-annoying. Pinky swear.
              </p>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
