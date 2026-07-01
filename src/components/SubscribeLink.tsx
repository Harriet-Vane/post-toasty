import { useState } from "react";
import { createPortal } from "react-dom";
import posthog from "posthog-js";
import { toast as sonnerToast } from "sonner";
import { createHubSpotContact } from "@/lib/hubspot.functions";
import { FlyingToasters } from "./FlyingToasters";

export function SubscribeLink({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [flying, setFlying] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  function reportSyncFailure(reason: string) {
    try {
      posthog.capture("hubspot_sync_failed", {
        reason,
        share_method: "subscribe_link",
      });
    } catch {
      /* posthog not initialized yet */
    }
    console.error("HubSpot sync failed", reason);
  }

  function reportSyncSuccess(existed: boolean) {
    try {
      posthog.capture("hubspot_sync_succeeded", {
        existed,
        share_method: "subscribe_link",
      });
    } catch {
      /* posthog not initialized yet */
    }
  }

  function submit() {
    const value = email.trim();
    if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      sonnerToast.error("Hmm, that email looks off.");
      return;
    }
    try {
      posthog.identify(value, { email: value });
      posthog.capture("share_email_captured", { share_method: "subscribe_link" });
    } catch {
      /* posthog not initialized yet */
    }
    createHubSpotContact({ data: { email: value, source: "subscribe_link" } })
      .then((result) => {
        if (result?.ok) reportSyncSuccess(result.existed ?? false);
        else reportSyncFailure(result?.reason ?? "unknown");
      })
      .catch((err) => {
        reportSyncFailure("exception");
        console.error("HubSpot sync threw", err);
      });
    setEmail("");
    setOpen(false);
    setFlying(true);
    setShowConfirm(true);
    setTimeout(() => setShowConfirm(false), 3000);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={className ?? "font-body text-xs hover:underline"}
      >
        Subscribe
      </button>

      {open && typeof document !== "undefined" && createPortal(
        <div
          className="share-modal-backdrop"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Subscribe to toasty updates"
        >
          <div className="share-modal" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-3">
              <h4 className="font-pixel text-[13px] mt-2 text-[var(--ink)]">
                SUBSCRIBE TO UPDATES
              </h4>
              <button
                onClick={() => setOpen(false)}
                className="pixel-btn-ghost text-xl flex items-center justify-center w-10 h-10"
                aria-label="Close subscribe dialog"
              >
                ✕
              </button>
            </div>
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") submit();
                }}
                placeholder="you@example.com"
                aria-label="Your email"
                className="flex-1 min-w-0 font-body text-xs text-[var(--ink)] bg-[var(--paper)] px-2 py-2"
                style={{ border: "2px solid var(--ink)" }}
              />
              <button type="button" className="pixel-btn" onClick={submit}>
                Submit
              </button>
            </div>
            <p className="font-body text-[11px] text-[var(--ink)] opacity-70 mt-1">
              Totally optional. Unsubscribe anytime.
            </p>
          </div>
        </div>,
        document.body,
      )}

      {flying && <FlyingToasters onDone={() => setFlying(false)} />}
      {showConfirm && typeof document !== "undefined" && createPortal(
        <div
          aria-live="polite"
          style={{
            position: "fixed",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
            zIndex: 2147483647,
          }}
        >
          <div
            className="font-pixel text-[13px] text-[var(--ink)] bg-[var(--paper)] px-4 py-3"
            style={{ border: "2px solid var(--ink)", boxShadow: "4px 4px 0 var(--ink)" }}
          >
            YOU'RE SUBSCRIBED
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
