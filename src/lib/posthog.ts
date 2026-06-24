import { useEffect } from "react";
import posthog from "posthog-js";
import { useRouter } from "@tanstack/react-router";

const POSTHOG_KEY = "phc_yDPSEJTQgShjMvfjj96uDCHbRdAVuvuPcDyQWH7CWjs6";
const POSTHOG_HOST = "https://us.i.posthog.com";

// The app also runs inside the Lovable editor/preview on *.lovable.app and
// *.lovableproject.com. That traffic is just us building the app, not real
// visitors, so we opt out of capturing there. Real visits to posttoasty.com
// (including our own) are still captured — that's the data we want to learn from.
function applyPreviewOptOut(ph: typeof posthog) {
  try {
    if (window.location.hostname.includes("lovable")) {
      ph.opt_out_capturing();
    }
  } catch {
    /* window unavailable (e.g. SSR) — skip */
  }
}

export function track(event: string, props?: Record<string, unknown>) {
  try {
    posthog.capture(event, props);
  } catch {
    /* posthog not initialized yet */
  }
}

let initialized = false;

export function usePostHogInit() {
  const router = useRouter();

  useEffect(() => {
    if (!initialized) {
      posthog.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST,
        capture_pageview: false,
        // Pageviews are captured manually below, but pageleave defaults to
        // 'if_capture_pageview' — so it stays off unless we opt in explicitly.
        capture_pageleave: true,
        loaded: (ph) => {
          if (process.env.NODE_ENV === "development") ph.debug();
          applyPreviewOptOut(ph);
        },
      });
      initialized = true;
    }
  }, []);

  useEffect(() => {
    let lastPath: string | null = null;

    const capturePageview = () => {
      const path = window.location.pathname + window.location.search;
      // Guard against duplicate captures for the same URL (e.g. the initial
      // load firing both here and via onResolved).
      if (path === lastPath) return;
      lastPath = path;
      posthog.capture("$pageview");
    };

    // Capture the initial pageview — the route is already resolved by the time
    // this effect runs, so onResolved won't fire for it on first load.
    capturePageview();

    const unsub = router.subscribe("onResolved", capturePageview);
    return () => unsub();
  }, [router]);
}
