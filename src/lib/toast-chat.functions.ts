import { createServerFn } from "@tanstack/react-start";
import { generateText, Output } from "ai";
import { z } from "zod";

import { createLovableAiGatewayProvider } from "./ai-gateway.server";
import { BREADS, TOPPINGS, type BreadId } from "./runchbase";

const ChatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(4000),
});

const InputSchema = z.object({
  messages: z.array(ChatMessageSchema).min(1).max(40),
  currentBread: z.string(),
  currentToppings: z
    .array(z.object({ id: z.string(), name: z.string() }))
    .max(40),
});

const VALID_RENDERS = [
  "spread",
  "drizzle",
  "scatter",
  "banana",
  "egg",
  "hotdog",
  "pickle",
] as const;

const BREAD_IDS = BREADS.map((b) => b.id) as [BreadId, ...BreadId[]];
const LIBRARY_TOPPING_IDS = TOPPINGS.map((t) => t.id) as [string, ...string[]];

const StackItemSchema = z.union([
  z.object({
    kind: z.literal("library"),
    id: z.enum(LIBRARY_TOPPING_IDS),
  }),
  z.object({
    kind: z.literal("custom"),
    name: z.string().min(1).max(40),
    side: z.enum(["spread", "extra"]),
    render: z.enum(VALID_RENDERS),
    color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    accent: z.string().regex(/^#[0-9a-fA-F]{6}$/).nullable(),
    emoji: z.string().min(1).max(8),
  }),
]);

const ResponseSchema = z.object({
  reply: z.string().min(1).max(300),
  breadId: z.enum(BREAD_IDS),
  stack: z.array(StackItemSchema).max(12),
});

export type ToastChatStackItem = z.infer<typeof StackItemSchema>;

export type ToastChatResult = {
  reply: string | null;
  breadId: BreadId | null;
  stack: ToastChatStackItem[] | null;
  model: string | null;
  traceId: string;
  latencyMs: number | null;
  usage: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  } | null;
  error: string | null;
};

// Different model than the recipe generator so we can compare in PostHog AI observability.
const MODEL = "openai/gpt-5-mini";
const POSTHOG_KEY = "phc_yDPSEJTQgShjMvfjj96uDCHbRdAVuvuPcDyQWH7CWjs6";
const POSTHOG_HOST = "https://us.i.posthog.com";

function randomTraceId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `trace-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

async function emitPosthogAiGeneration(props: {
  traceId: string;
  model: string;
  input: unknown;
  output: unknown;
  inputTokens?: number;
  outputTokens?: number;
  latencyMs: number;
  httpStatus: number;
  errorMessage?: string;
}) {
  try {
    await fetch(`${POSTHOG_HOST}/i/v0/e/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: POSTHOG_KEY,
        event: "$ai_generation",
        distinct_id: `server:toast-angel`,
        properties: {
          $ai_trace_id: props.traceId,
          $ai_model: props.model,
          $ai_provider: "lovable-ai-gateway",
          $ai_input: props.input,
          $ai_output_choices: [
            { role: "assistant", content: JSON.stringify(props.output) },
          ],
          $ai_input_tokens: props.inputTokens ?? 0,
          $ai_output_tokens: props.outputTokens ?? 0,
          $ai_latency: props.latencyMs / 1000,
          $ai_http_status: props.httpStatus,
          $ai_is_error: !!props.errorMessage,
          $ai_error: props.errorMessage,
        },
      }),
    });
  } catch (err) {
    // Never let observability failures break the user request.
    console.warn("[toast-chat] posthog capture failed", err);
  }
}

export const chatToastBuilder = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data }): Promise<ToastChatResult> => {
    const traceId = randomTraceId();
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      return {
        reply: null,
        breadId: null,
        stack: null,
        model: null,
        traceId,
        latencyMs: null,
        usage: null,
        error: "Missing LOVABLE_API_KEY",
      };
    }

    const breadList = BREADS.map((b) => `${b.id} (${b.name})`).join(", ");
    const toppingList = TOPPINGS.map(
      (t) => `${t.id} (${t.name}, ${t.side}, render=${t.render})`,
    ).join("\n");

    const system = [
      "You are Toast Angel, the friendly assistant for PostToast, a playful pixel-art toast builder.",
      "The user describes a toast they want in natural language. You return a full ingredient stack.",
      "",
      "RESPONSE SHAPE (strict):",
      "- reply: 1–2 short, warm sentences. No emojis. No flattery. Mention what you built or changed.",
      "- breadId: choose the best fitting bread id from the list below. If unsure, pick 'sourdough'.",
      "- stack: ordered array (bottom to top) of ingredients. Up to 8 items.",
      "",
      "STACK ORDERING:",
      "- Spreads/bases first, then extras/toppings on top, in the order they'd be applied.",
      "",
      "USE LIBRARY INGREDIENTS WHEN POSSIBLE:",
      'For each library ingredient use {"kind":"library","id":"<id>"} with one of the exact IDs below.',
      "",
      "INVENTING NEW INGREDIENTS:",
      "When the user names something not in the library (e.g. ricotta, fig, sriracha, basil), invent it:",
      '{"kind":"custom","name":"Ricotta","side":"spread","render":"spread","color":"#f6f1e3","accent":"#d8cfa6","emoji":"🥛"}',
      "Rules for custom ingredients:",
      "- side: 'spread' for things that coat the bread (cheeses, butters, sauces, jams, hummus). 'extra' for things piled on top.",
      "- render: 'spread' = thick layer; 'drizzle' = thin streaks (sauces, oils, honey-likes); 'scatter' = small bits (seeds, herbs, sprinkles, crumbles); 'banana' = banana-like slices; 'egg' = fried-egg shape; 'pickle' = leafy/green wedge (use for leaves like basil, mint, arugula); 'hotdog' = elongated cylinder (use for mushrooms, sausages).",
      "- color: a hex like #aabbcc that matches the real ingredient.",
      "- accent: darker shade hex for outline/detail, or null if no accent.",
      "- emoji: one emoji that represents the ingredient.",
      "",
      "PREFER LIBRARY over custom when a close match exists.",
      "",
      "BREAD IDS:",
      breadList,
      "",
      "LIBRARY TOPPING IDS:",
      toppingList,
    ].join("\n");

    const conversation = data.messages
      .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join("\n\n");

    const currentState = [
      `Current bread: ${data.currentBread}`,
      `Current stack (bottom to top): ${
        data.currentToppings.length
          ? data.currentToppings.map((t) => t.name).join(", ")
          : "(empty)"
      }`,
    ].join("\n");

    const prompt = `${currentState}\n\nConversation so far:\n${conversation}\n\nRespond with the updated toast.`;

    const gateway = createLovableAiGatewayProvider(apiKey);
    const started = performance.now();
    try {
      const result = await generateText({
        model: gateway(MODEL),
        system,
        prompt,
        output: Output.object({ schema: ResponseSchema }),
      });
      const latencyMs = Math.round(performance.now() - started);
      const output = (result as unknown as { output?: unknown }).output;
      const parsed = ResponseSchema.safeParse(output);
      if (!parsed.success) {
        await emitPosthogAiGeneration({
          traceId,
          model: MODEL,
          input: data.messages,
          output,
          latencyMs,
          httpStatus: 200,
          errorMessage: "invalid_structure",
        });
        return {
          reply: null,
          breadId: null,
          stack: null,
          model: MODEL,
          traceId,
          latencyMs,
          usage: null,
          error: "Model returned invalid structure",
        };
      }

      const usageRaw =
        (result as unknown as { usage?: Record<string, unknown> }).usage ?? {};
      const num = (v: unknown) => (typeof v === "number" ? v : undefined);
      const usage = {
        promptTokens:
          num(usageRaw.promptTokens) ?? num(usageRaw.inputTokens),
        completionTokens:
          num(usageRaw.completionTokens) ?? num(usageRaw.outputTokens),
        totalTokens: num(usageRaw.totalTokens),
      };

      await emitPosthogAiGeneration({
        traceId,
        model: MODEL,
        input: data.messages,
        output: parsed.data,
        inputTokens: usage.promptTokens,
        outputTokens: usage.completionTokens,
        latencyMs,
        httpStatus: 200,
      });

      return {
        reply: parsed.data.reply,
        breadId: parsed.data.breadId as BreadId,
        stack: parsed.data.stack,
        model: MODEL,
        traceId,
        latencyMs,
        usage,
        error: null,
      };
    } catch (err) {
      const latencyMs = Math.round(performance.now() - started);
      const message = err instanceof Error ? err.message : String(err);
      console.error("[toast-chat] generation failed", err);
      await emitPosthogAiGeneration({
        traceId,
        model: MODEL,
        input: data.messages,
        output: null,
        latencyMs,
        httpStatus: 500,
        errorMessage: message,
      });
      return {
        reply: null,
        breadId: null,
        stack: null,
        model: MODEL,
        traceId,
        latencyMs,
        usage: null,
        error: message,
      };
    }
  });
