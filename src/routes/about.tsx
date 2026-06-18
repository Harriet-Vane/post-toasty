import { createFileRoute, Link } from "@tanstack/react-router";

import { ToastSprite } from "@/components/ToastSprite";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — PostToast" },
      { name: "description", content: "About PostToast — the toast-building arcade." },
      { property: "og:title", content: "About — PostToast" },
      { property: "og:description", content: "About PostToast — the toast-building arcade." },
      { property: "og:url", content: "https://post-toasty.lovable.app/about" },
    ],
    links: [{ rel: "canonical", href: "https://post-toasty.lovable.app/about" }],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <main className="min-h-screen w-full flex items-center justify-center p-3 sm:p-6">
      <div className="w-full max-w-[720px] arcade-cabinet p-3 sm:p-6">
        <div className="flex items-center justify-between gap-3 mb-3 sm:mb-4 px-2">
          <Link to="/" className="flex items-center gap-2 sm:gap-3">
            <ToastSprite size={28} />
            <h1
              className="font-pixel text-[var(--paper)] text-[14px] sm:text-[18px] leading-none"
              style={{ textShadow: "2px 2px 0 var(--tomato)" }}
            >
              PostToast
            </h1>
          </Link>
          <Link to="/" className="font-body text-[var(--paper)] opacity-80 text-xs sm:text-sm underline">
            Home
          </Link>
        </div>

        <div className="relative arcade-screen crt p-6 sm:p-10 min-h-[420px] flex flex-col">
          <header className="text-center mb-6">
            <p className="font-pixel text-[10px] text-[var(--toast-crust)]">{"\n"}</p>
          <h2 className="font-pixel text-[18px] sm:text-[24px] mt-3 text-[var(--ink)]">
            What's all this then?
          </h2>
          </header>

          <div className="font-body text-base text-[var(--ink)] max-w-xl mx-auto opacity-80 leading-relaxed text-center">
            <p>More about PostToast coming soon.</p>
          </div>

          <div className="flex justify-center mt-8">
            <Link to="/" className="pixel-btn-primary">
              BRING TOASTY BACK
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}