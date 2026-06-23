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
  funFact: z.string().min(1).max(280),
});

export type AiRecipeResult = {
  name: string | null;
  steps: string[] | null;
  funFact: string | null;
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
      "VOICE: Short, warm, lightly playful. Most steps are plain instructions ('Toast the sourdough.' 'Spread the peanut butter.'). One or two steps can have a small bit of personality — a fragment, an aside, a quick aside. Never more than one flourish per step. At least half the steps are flourish-free.",
      "Be kind about the build. All toast is good toast — never imply the user's choices are weird, questionable, chaotic, or a mistake. No 'questionable choices,' 'delicious chaos,' 'don't think about it.'",
      "No emojis (the UI handles those).",
      "Avoid the thesaurus-verb trap: don't open every step with a different showy verb. Plain verbs are great — Toast, Spread, Add, Top, Finish. Save a punchier verb for a single step at most.",
      "Forbidden words: 'thrust,' 'worship,' 'behold,' 'masterpiece.' Avoid cosmic/grandiose framing ('from space,' 'toast pioneer,' 'scream with joy').",
      "",
      "STRUCTURE:",
      "Always name the recipe in the form '<ingredient>, revisited' where <ingredient> is the most distinctive bread or topping in the build (Title Case before the comma, lowercase 'revisited' after). Examples: 'Sourdough, revisited', 'Honey, revisited', 'Avocado, revisited'.",
      "Write 4 to 7 numbered steps that reference the actual bread and toppings the user chose. Keep each step under ~90 characters; most should be shorter.",
      "Do NOT include the leading number in each step — return raw strings; the client renders the numbering.",
      "",
      "Easter eggs (use only if triggered, sparingly):",
      "- If there are zero toppings, lean into minimalism and the dignity of plain toast.",
      "- If the build includes both butter and honey, call it the 'bee's pajamas' somewhere.",
      "- If the same topping appears 3+ times, gently acknowledge the commitment.",
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
        model: null,
        latencyMs: null,
        usage: null,
        error: message,
      };
    }
  });
