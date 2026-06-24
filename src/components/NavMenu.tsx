import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";

type NavMenuProps = {
  /** Extra trailing items shown next to the menu (e.g., Start over button). */
  extras?: ReactNode;
  /** Links to render. */
  links: Array<{ to: string; label: string }>;
};

export function NavMenu({ extras, links }: NavMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="flex items-center gap-3 sm:gap-4">
      {/* Desktop links */}
      <div className="hidden sm:flex items-center gap-4">
        {links.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            className="font-body text-[var(--paper)] opacity-80 text-xs sm:text-sm underline"
          >
            {l.label}
          </Link>
        ))}
      </div>

      {extras}

      {/* Mobile hamburger */}
      <div className="relative sm:hidden" ref={rootRef}>
        <button
          type="button"
          aria-label="Open menu"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="grid place-items-center w-9 h-9 text-[var(--toast-gold)] bg-transparent active:translate-y-px"
        >
          <span className="sr-only">Menu</span>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
            {open ? (
              <>
                <line x1="5" y1="5" x2="19" y2="19" />
                <line x1="19" y1="5" x2="5" y2="19" />
              </>
            ) : (
              <>
                <line x1="4" y1="7" x2="20" y2="7" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="17" x2="20" y2="17" />
              </>
            )}
          </svg>
        </button>


        {open && (
          <div
            role="menu"
            className="absolute right-0 top-[calc(100%+6px)] z-50 min-w-[180px] rounded-md border-2 border-[var(--paper)] bg-[var(--ink)] p-2 shadow-[4px_4px_0_var(--tomato)]"
          >
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="block px-3 py-2 font-body text-sm text-[var(--paper)] hover:bg-white/10 rounded"
              >
                {l.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
