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
        loaded: (ph) => {
          if (process.env.NODE_ENV === "development") ph.debug();
        },
      });
      initialized = true;
    }
  }, []);

  useEffect(() => {
    const unsub = router.subscribe("onResolved", () => {
      posthog.capture("$pageview");
    });
    return () => unsub();
  }, [router]);
}
