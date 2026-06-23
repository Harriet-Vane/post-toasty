import { useServerFn } from "@tanstack/react-start";
import posthog from "posthog-js";
import { useEffect, useRef, useState } from "react";
import { toast as sonnerToast } from "sonner";

import angelToast from "@/assets/angel-toast.png";
import {
  chatToastBuilder,
  type ToastChatStackItem,
} from "@/lib/toast-chat.functions";
import {
  makeCustomToppingId,
  registerCustomTopping,
} from "@/lib/customToppings";
import {
  getTopping,
  type BreadId,
  type Sound,
  type Topping,
  type ToppingId,
} from "@/lib/runchbase";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  traceId?: string;
  feedback?: 1 | -1;
};

function friendlyError(raw: string | undefined | null): string {
  const msg = (raw ?? "").toLowerCase();
  if (!msg) return "Sorry, that message got stuck in my toaster. Care to try again?";
  if (msg.includes("rate") || msg.includes("429") || msg.includes("too many"))
    return "Too many slices at once — give me a sec and try again.";
  if (msg.includes("402") || msg.includes("credit") || msg.includes("quota"))
    return "The toaster's out of tokens for now. Try again later.";
  if (msg.includes("api_key") || msg.includes("unauthorized") || msg.includes("401"))
    return "Something burned in the back. Try again in a minute.";
  if (msg.includes("network") || msg.includes("fetch") || msg.includes("timeout"))
    return "Looks like the toaster unplugged itself. Try again?";
  if (msg.includes("invalid structure") || msg.includes("schema") || msg.includes("parse"))
    return "Sorry, that message got stuck in my toaster. Care to try again?";
  return "Sorry, that message got stuck in my toaster. Care to try again?";
}

function materializeStack(stack: ToastChatStackItem[]): ToppingId[] {
  const ids: ToppingId[] = [];
  stack.forEach((item, i) => {
    if (item.kind === "library") {
      ids.push(item.id);
      return;
    }
    const id = makeCustomToppingId(item.name, String(i));
    const sound = (item.name[0]?.toUpperCase() ?? "B") as Sound;
    const topping: Topping = {
      id,
      name: item.name,
      side: item.side,
      render: item.render,
      color: item.color,
      accent: item.accent ?? undefined,
      emoji: item.emoji,
      complimentName: item.name.toLowerCase(),
      sound,
    };
    registerCustomTopping(topping);
    ids.push(id);
  });
  return ids;
}

export function AngelChat({
  breadId,
  toppings,
  onApplyStack,
}: {
  breadId: BreadId;
  toppings: ToppingId[];
  onApplyStack: (breadId: BreadId, toppings: ToppingId[]) => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatFn = useServerFn(chatToastBuilder);

  const showTranscript = messages.length > 0;


  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, pending]);

  async function send() {
    const text = input.trim();
    if (!text || pending) return;
    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: text },
    ];
    setMessages(nextMessages);
    setInput("");
    setPending(true);
    posthog.capture("angel_message_sent", {
      stack_size: toppings.length,
      bread_id: breadId,
    });

    try {
      const currentToppings = toppings
        .map((id) => {
          const t = getTopping(id);
          return t ? { id, name: t.name } : null;
        })
        .filter((x): x is { id: string; name: string } => x !== null);

      const result = await chatFn({
        data: {
          messages: nextMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          currentBread: breadId,
          currentToppings,
        },
      });

      if (result.error || !result.reply || !result.stack || !result.breadId) {
        console.error("[angel] server error", result.error);
        const friendly = friendlyError(result.error);
        sonnerToast.error(friendly);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: friendly,
            traceId: result.traceId,
          },
        ]);
        return;
      }

      const newToppings = materializeStack(result.stack);
      onApplyStack(result.breadId, newToppings);
      posthog.capture("angel_stack_applied", {
        stack_size: newToppings.length,
        bread_id: result.breadId,
        trace_id: result.traceId,
        model: result.model,
      });

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: result.reply!,
          traceId: result.traceId,
        },
      ]);
    } catch (err) {
      console.error("[angel] send failed", err);
      const friendly = friendlyError(err instanceof Error ? err.message : String(err));
      sonnerToast.error(friendly);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: friendly,
        },
      ]);
    } finally {
      setPending(false);
    }
  }

  function vote(idx: number, value: 1 | -1) {
    const msg = messages[idx];
    if (!msg?.traceId || msg.feedback) return;
    setMessages((prev) =>
      prev.map((m, i) => (i === idx ? { ...m, feedback: value } : m)),
    );
    posthog.capture("$ai_feedback", {
      $ai_trace_id: msg.traceId,
      $ai_feedback: value,
    });
    posthog.capture("angel_feedback", {
      trace_id: msg.traceId,
      value,
    });
  }

  return (
    <div
      className="flex flex-col bg-[var(--card)] p-2 sm:p-3 w-full"
      style={{
        border: "3px solid var(--ink)",
        boxShadow: "3px 3px 0 0 var(--ink)",
      }}
    >
      <div className="flex items-center gap-2">
        <img src={angelToast} alt="" width={20} height={20} />
        <p
          className="font-pixel text-[9px]"
          style={{ color: "var(--toast-crust)" }}
        >
          ASK TOAST ANGEL
        </p>
      </div>

        <span
          className="font-pixel text-[9px]"
          style={{ color: "var(--toast-crust)" }}
          aria-hidden
        >
          {showTranscript ? "▾" : "▸"}
        </span>
      </button>

      {showTranscript && (
        <div
          ref={scrollRef}
          className="overflow-y-auto space-y-2 pr-1 mt-2"
          style={{ maxHeight: 280, minHeight: 140 }}
        >
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${
              m.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`font-body text-[12px] leading-snug max-w-[90%] ${
                m.role === "user" ? "px-2 py-1" : ""
              }`}
              style={
                m.role === "user"
                  ? {
                      background: "var(--toast-crust)",
                      color: "var(--paper)",
                      border: "1.5px solid var(--ink)",
                    }
                  : { color: "var(--ink)" }
              }
            >
              {m.content}
              {m.role === "assistant" && m.traceId && (
                <div className="flex gap-1 mt-1">
                  <button
                    onClick={() => vote(i, 1)}
                    disabled={!!m.feedback}
                    className="text-[12px] leading-none px-1"
                    style={{
                      opacity: m.feedback === 1 ? 1 : 0.5,
                      cursor: m.feedback ? "default" : "pointer",
                    }}
                    aria-label="Helpful"
                    title="Helpful"
                  >
                    👍
                  </button>
                  <button
                    onClick={() => vote(i, -1)}
                    disabled={!!m.feedback}
                    className="text-[12px] leading-none px-1"
                    style={{
                      opacity: m.feedback === -1 ? 1 : 0.5,
                      cursor: m.feedback ? "default" : "pointer",
                    }}
                    aria-label="Not helpful"
                    title="Not helpful"
                  >
                    👎
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {pending && (
          <div className="font-body text-[12px] opacity-70 italic">
            Toast Angel is thinking…
          </div>
        )}
        </div>
      )}

      <div className="flex gap-1 mt-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => setExpanded(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          rows={showTranscript ? 2 : 1}
          placeholder="Describe your dream toast…"
          disabled={pending}
          className="flex-1 font-body text-[12px] p-1.5 resize-none"
          style={{
            background: "var(--paper)",
            border: "2px solid var(--ink)",
            color: "var(--ink)",
          }}
        />
        <button
          onClick={send}
          disabled={pending || !input.trim()}
          className="pixel-btn-primary text-[10px] px-2"
          style={{ alignSelf: "stretch" }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
