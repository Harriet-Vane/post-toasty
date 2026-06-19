import { useEffect } from "react";
import posthog from "posthog-js";
import { useRouter } from "@tanstack/react-router";

const POSTHOG_KEY = "phc_vckhM8o2VPsu6q3MDGKwDSCQUpXdVeVvAsJT8BphC2BY";
const POSTHOG_HOST = "https://us.i.posthog.com";

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
