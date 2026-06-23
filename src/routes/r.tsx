import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import posthog from "posthog-js";
import { useEffect, useMemo, useRef } from "react";

import angelToast from "@/assets/angel-toast.png";
import { FlyingAngel } from "@/components/FlyingAngel";
import { BreadCanvas } from "@/components/BreadCanvas";
import { cardPublicUrl } from "@/lib/cardKey";
import { generateAiRecipe } from "@/lib/recipe-ai.functions";
import {
  BREADS,
  TOPPINGS,
  calculateNutrition,
  generateName,
  generateRecipe,
  getBread,
  type BreadId,
  type ToppingId,
} from "@/lib/runchbase";

type RecipeSearch = {
  b: BreadId;
  t: string;
  s: boolean;
};

const BREAD_IDS = new Set<string>(BREADS.map((b) => b.id));
const TOPPING_IDS = new Set<string>(TOPPINGS.map((t) => t.id));

function parseSearch(raw: Record<string, unknown>): RecipeSearch {
  const b = typeof raw.b === "string" && BREAD_IDS.has(raw.b) ? (raw.b as BreadId) : "white";
  const t = typeof raw.t === "string" ? raw.t : "";
  const s = raw.s === "1" || raw.s === 1;
  return { b, t, s };
}

export const Route = createFileRoute("/r")({
  validateSearch: (search) => parseSearch(search as Record<string, unknown>),
  head: ({ match }) => {
    const { b, t, s } = (match.search ?? { b: "white", t: "", s: false }) as RecipeSearch;
    const toppings = t
      .split(",")
      .map((s) => s.trim())
      .filter((s) => TOPPING_IDS.has(s));
    const name = generateName(b, toppings);
    const title = `${name} — PostToast`;
    const description = `A ${getBread(b).name} toast recipe built on PostToast. Make your own.`;
    const image = cardPublicUrl(b, toppings, s);
    const url = `https://post-toasty.lovable.app/r?b=${encodeURIComponent(b)}&t=${encodeURIComponent(t)}${s ? `&s=1` : ""}`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: name },
        { property: "og:description", content: description },
        { property: "og:url", content: url },
        { property: "og:type", content: "article" },
        { property: "og:image", content: image },
        { property: "twitter:card", content: "summary_large_image" },
        { property: "twitter:image", content: image },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: RecipePage,
});

function RecipePage() {
  const search = Route.useSearch();
  const breadId: BreadId = search.b;
  const t: string = search.t;
  const salted: boolean = search.s;

  const toppings = useMemo<ToppingId[]>(
    () =>
      t
        .split(",")
        .map((s: string) => s.trim())
        .filter((s: string) => TOPPING_IDS.has(s)),
    [t],
  );

  const fallbackName = useMemo(() => generateName(breadId, toppings), [breadId, toppings]);
  const fallbackRecipe = useMemo(() => generateRecipe(breadId, toppings), [breadId, toppings]);
  const nutrition = useMemo(() => calculateNutrition(breadId, toppings), [breadId, toppings]);
  const bread = getBread(breadId);

  const generateAiRecipeFn = useServerFn(generateAiRecipe);
  const aiQuery = useQuery({
    queryKey: ["ai-recipe", "shared", breadId, toppings.join(","), salted],
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
    ? (aiQuery.data!.steps as string[]).map((step, i) => `${i + 1}. ${step}`)
    : fallbackRecipe;
  const traceIdRef = useRef<string>(
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `trace-${Date.now()}-${Math.random().toString(36).slice(2)}`
  );

  useEffect(() => {
    if (toppings.length >= 1) {
      posthog.capture("toast_created", {
        bread_id: breadId,
        topping_count: toppings.length,
        toppings,
      });
    }
  }, [breadId, toppings]);

  const reportedRef = useRef<string | null>(null);
  useEffect(() => {
    if (aiQuery.isLoading) return;
    const key = `${breadId}|${toppings.join(",")}|${salted}|${
      aiQuery.data?.error ?? "ok"
    }`;
    if (reportedRef.current === key) return;
    reportedRef.current = key;

    posthog.capture("toast_recipe_generated", {
      source: aiOk ? "ai" : "fallback",
      latency_ms: aiQuery.data?.latencyMs ?? null,
      model: aiQuery.data?.model ?? null,
      bread_id: breadId,
      topping_count: toppings.length,
      salted,
      shared_page: true,
    });

    if (aiQuery.data && aiQuery.data.model) {
      const latencyMs = aiQuery.data.latencyMs ?? null;
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
      if (typeof latencyMs === "number") aiProps.$ai_latency = latencyMs / 1000;
      if (typeof usage.promptTokens === "number") aiProps.$ai_input_tokens = usage.promptTokens;
      if (typeof usage.completionTokens === "number") aiProps.$ai_output_tokens = usage.completionTokens;
      if (typeof usage.totalTokens === "number") aiProps.$ai_total_tokens = usage.totalTokens;
      if (aiQuery.data.error) aiProps.$ai_error = aiQuery.data.error;
      posthog.capture("$ai_generation", aiProps);
    }
  }, [aiQuery.isLoading, aiQuery.data, aiOk, breadId, toppings, salted]);

  const variant = useMemo(() => {
    const variants = ["", "variant-starfield", "variant-hearts", "variant-toasters", "variant-glitter", "variant-myspace", "variant-skulls"];
    const seed = (breadId + "|" + toppings.join(",")).split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    return variants[seed % variants.length];
  }, [breadId, toppings]);
  const plate = useMemo(() => {
    const seed = (breadId + "/" + toppings.join(",")).split("").reduce((a, c) => a * 31 + c.charCodeAt(0), 7);
    return `plate-${1 + (Math.abs(seed) % 5)}`;
  }, [breadId, toppings]);


  return (
    <main className="min-h-screen w-full flex items-center justify-center p-3 sm:p-6">
      <div className="w-full max-w-[720px] arcade-cabinet p-3 sm:p-6">
        <div className="flex items-center justify-between gap-3 mb-3 sm:mb-4 px-2">
          <Link to="/" className="flex items-center gap-2 sm:gap-3 cursor-pointer">
            <h1
              className="font-pixel text-[var(--paper)] text-[14px] sm:text-[18px] leading-none"
              style={{ textShadow: "2px 2px 0 var(--tomato)" }}
            >
              PostToast
            </h1>
          </Link>
          <span className="font-body text-[var(--paper)] opacity-80 text-xs sm:text-sm">
            toast is for sharing
          </span>
        </div>

        <div className="relative arcade-screen crt p-4 sm:p-8 flex flex-col">
          <article
            className="mx-auto w-full max-w-[560px] bg-[var(--card)] p-4 sm:p-5"
            style={{
              border: "4px solid var(--ink)",
              boxShadow: "6px 6px 0 0 var(--ink)",
            }}
          >
            <header className="mb-3">
              <p className="font-pixel text-[9px]" style={{ color: "var(--toast-crust)" }}>
                PostToast
              </p>
              <h2 className="font-pixel text-[14px] sm:text-[16px] mt-2 leading-tight text-[var(--ink)]">
                {name.toUpperCase()}
              </h2>
              <p className="font-body text-sm opacity-80 mt-1">
                A {bread.name} toast, built just so.
              </p>
            </header>

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
              <FlyingAngel
                src={angelToast}
                alt="Angel toast"
                width={48}
                height={48}
                className="opacity-80"
                loading="lazy"
              />
            </footer>
          </article>

          <div className="flex flex-col items-center justify-center gap-3 mt-6">
            <Link to="/" className="pixel-btn-primary">
              Make your own toast
            </Link>
            <p className="font-body text-xs text-[var(--ink)] opacity-70">
              Free, fun, and always delicious.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between px-2 pt-3 sm:pt-4 text-[var(--paper)] opacity-70">
          <span className="font-pixel text-[9px]">© Beth Dunn</span>
          <span className="font-body text-xs">because toast is the most</span>
        </div>
      </div>
    </main>
  );
}
