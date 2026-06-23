import { createServerFn } from "@tanstack/react-start";
import { generateText, Output } from "ai";
import { z } from "zod";

import { createLovableAiGatewayProvider } from "./ai-gateway.server";
import { BREADS, TOPPINGS, type BreadId, type ToppingId } from "./runchbase";

const InputSchema = z.object({
  breadId: z.string(),
  toppingIds: z.array(z.string()),
  salted: z.boolean().optional().default(false),
});

const RecipeSchema = z.object({
  name: z.string().min(1).max(80),
  steps: z.array(z.string().min(1).max(240)).min(3).max(8),
  pairing: z.string().min(1).max(200),
});

export type AiRecipeResult = {
  name: string | null;
  steps: string[] | null;
  pairing: string | null;
  model: string | null;
  latencyMs: number | null;
  usage: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  } | null;
  error: string | null;
};

const MODEL = "google/gemini-3-flash-preview";

export const generateAiRecipe = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data }): Promise<AiRecipeResult> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      return {
        name: null,
        steps: null,
        funFact: null,
        model: null,
        latencyMs: null,
        usage: null,
        error: "Missing LOVABLE_API_KEY",
      };
    }

    const bread = BREADS.find((b) => b.id === (data.breadId as BreadId));
    const toppings = data.toppingIds
      .map((id) => TOPPINGS.find((t) => t.id === (id as ToppingId)))
      .filter((t): t is NonNullable<typeof t> => Boolean(t));

    if (!bread) {
      return {
        name: null,
        steps: null,
        funFact: null,
        model: null,
        latencyMs: null,
        usage: null,
        error: "Unknown bread",
      };
    }

    const toppingList = toppings.length
      ? toppings.map((t) => `- ${t.name}`).join("\n")
      : "- (no toppings, just bread)";

    const anchor =
      (toppings[toppings.length - 1]?.name ?? bread.name).toString();

    const system = [
      "You are the in-house toast oracle for PostToast, a tongue-in-cheek toast-builder app. You write single-serving recipes in one specific voice. Use it.",
      "",
      "VOICE: Direct and concise. No fluff, no flourishes, no metaphors. Technical but approachable — confident, friendly, plain language. Think 'good cookbook author,' not 'food blogger.'",
      "All toast is good toast — never imply the user's build is weird, questionable, or a mistake.",
      "No emojis (the UI handles those).",
      "Forbidden words: 'thrust,' 'worship,' 'behold,' 'masterpiece.'",
      "",
      "STRUCTURE:",
      "Give the recipe a short, punchy title with personality. Do NOT use the '<ingredient>, revisited' format. Acceptable title shapes (vary across recipes — don't reuse the same template every time):",
      "  - 'The <Ingredient> Report'",
      "  - '<Ingredient> Toast: Shipped'",
      "  - '<Ingredient> + <Ingredient>: Get You Some Toast That Does Both'",
      "  - 'Nobody Toasts It Better'",
      "  - 'Every Toast Is Sacred'",
      "  - \"Let's Bring Toasty Back\"",
      "  - 'My House, My Toast'",
      "  - 'There Is a Toast That Never Goes Out'",
      "Pick the shape that best fits the build. Ingredient-based titles should reference the most distinctive bread or topping the user actually chose.",
      "Write 4 to 7 numbered steps that reference the actual bread and toppings the user chose. Each step is one short sentence under ~90 characters, starting with a plain verb (Toast, Spread, Add, Top, Finish). Include a useful technical detail when it helps (temperature, timing, thickness, texture cue).",
      "Do NOT include the leading number in each step — return raw strings; the client renders the numbering.",
      "",
      "FUN FACT: End every recipe with a single 'funFact' field — one sentence, true, genuinely interesting, about bread. Tie it to the bread the user chose when possible (history, science, baking technique, cultural note). No jokes, no hype, no 'did you know.'",
    ].join("\n");

    const user = [
      `Bread: ${bread.name}`,
      `Toppings (in stacking order):`,
      toppingList,
      `Salted: ${data.salted ? "yes" : "no"}`,
      `Most distinctive ingredient (use for the name): ${anchor}`,
    ].join("\n");

    const gateway = createLovableAiGatewayProvider(apiKey);

    async function callModel(modelId: string) {
      const started = performance.now();
      const result = await generateText({
        model: gateway(modelId),
        system,
        prompt: user,
        output: Output.object({ schema: RecipeSchema }),
      });
      const latencyMs = Math.round(performance.now() - started);
      return { result, latencyMs };
    }

    try {
      const modelUsed = MODEL;
      const attempt = await callModel(MODEL);

      const { result, latencyMs } = attempt;
      const output = (result as unknown as { output?: unknown }).output;
      const parsed = RecipeSchema.safeParse(output);
      if (!parsed.success) {
        return {
          name: null,
          steps: null,
          funFact: null,
          model: modelUsed,
          latencyMs,
          usage: null,
          error: "Model returned invalid structure",
        };
      }

      const usageRaw = (result as unknown as { usage?: Record<string, unknown> })
        .usage ?? {};
      const num = (v: unknown) => (typeof v === "number" ? v : undefined);
      const usage = {
        promptTokens:
          num(usageRaw.promptTokens) ?? num(usageRaw.inputTokens),
        completionTokens:
          num(usageRaw.completionTokens) ?? num(usageRaw.outputTokens),
        totalTokens: num(usageRaw.totalTokens),
      };

      return {
        name: parsed.data.name,
        steps: parsed.data.steps,
        funFact: parsed.data.funFact,
        model: modelUsed,
        latencyMs,
        usage,
        error: null,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("[recipe-ai] generation failed", err);
      return {
        name: null,
        steps: null,
        funFact: null,
        model: null,
        latencyMs: null,
        usage: null,
        error: message,
      };
    }
  });
