import { useEffect } from "react";
import posthog from "posthog-js";
import { useRouter } from "@tanstack/react-router";

const POSTHOG_KEY = "phc_yDPSEJTQgShjMvfjj96uDCHbRdAVuvuPcDyQWH7CWjs6";
const POSTHOG_HOST = "https://us.i.posthog.com";

// Marks this browser as internal (your own usage) so PostHog stops capturing.
// Visit the live site once with `?internal=1` to opt out, or `?internal=0` to
// opt back in. The choice is persisted in localStorage across visits.
const INTERNAL_FLAG = "ph_internal_user";

function applyInternalOptOut(ph: typeof posthog) {
  try {
    const params = new URLSearchParams(window.location.search);
    const flag = params.get("internal");
    if (flag === "1") localStorage.setItem(INTERNAL_FLAG, "1");
    else if (flag === "0") localStorage.removeItem(INTERNAL_FLAG);

    if (localStorage.getItem(INTERNAL_FLAG) === "1") {
      ph.opt_out_capturing();
    }
  } catch {
    /* localStorage unavailable (e.g. SSR) — skip */
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
          applyInternalOptOut(ph);
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
