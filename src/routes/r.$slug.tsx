import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { NavMenu } from "@/components/NavMenu";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import posthog from "posthog-js";
import { useEffect, useMemo, useRef } from "react";


import { ToastAngel } from "@/components/ToastAngel";
import { BreadCanvas } from "@/components/BreadCanvas";
import { cardPublicUrl } from "@/lib/cardKey";
import { generateAiRecipe } from "@/lib/recipe-ai.functions";
import { parseShareSlug, SHARE_ORIGIN } from "@/lib/shortShare";
import {
  calculateNutrition,
  generateName,
  generateRecipe,
  getBread,
  type BreadId,
  type ToppingId,
} from "@/lib/runchbase";

export const Route = createFileRoute("/r/$slug")({
  loader: ({ params }) => {
    const parsed = parseShareSlug(params.slug);
    if (!parsed) throw notFound();
    return parsed;
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) return {};
    const { breadId, toppings, salted, name: sharedName } = loaderData;
    const name = sharedName || generateName(breadId, toppings);
    const title = `${name} — PostToast`;
    const description = `A ${getBread(breadId).name} toast recipe built on PostToast. Make your own.`;
    const image = cardPublicUrl(breadId, toppings, salted);
    const url = `${SHARE_ORIGIN}/r/${params.slug}`;
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
  notFoundComponent: () => (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center">
        <h1 className="font-pixel text-[var(--paper)] text-lg mb-3">Toast not found</h1>
        <Link to="/" className="pixel-btn-primary">Make a toast</Link>
      </div>
    </main>
  ),
  errorComponent: ({ reset }) => (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center">
        <p className="font-body text-[var(--paper)] mb-3">Something went wrong loading this toast.</p>
        <button onClick={reset} className="pixel-btn">Try again</button>
      </div>
    </main>
  ),
  component: RecipePage,
});

function RecipePage() {
  const { breadId, toppings, salted, name: sharedName } = Route.useLoaderData() as {
    breadId: BreadId;
    toppings: ToppingId[];
    salted: boolean;
    name: string;
  };

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
  const name = sharedName || (aiOk ? (aiQuery.data!.name as string) : fallbackName);
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
          <NavMenu
            links={[
              { to: "/about", label: "About" },
              { to: "/how-it-works", label: "How It Works" },
              { to: "/", label: "Make one" },
            ]}
          />
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
              <ToastAngel width={48} height={48} />

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
          <a href="https://www.bethdunn.com" target="_blank" rel="noopener noreferrer" className="font-pixel text-[9px] hover:underline">© Beth Dunn</a>
          <span className="font-body text-xs">because toast is the most</span>
        </div>
      </div>
    </main>
  );
}
