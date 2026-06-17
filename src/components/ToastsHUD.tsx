import { ToastSprite } from "./ToastSprite";

export function ToastsHUD({ count }: { count: number }) {
  const cap = 12;
  const shown = Math.min(count, cap);
  const overflow = count - cap;
  return (
    <div
      className="inline-flex flex-col gap-1 px-3 py-2 border-[3px] bg-[var(--paper)]"
      style={{
        borderColor: "var(--ink)",
        boxShadow: "3px 3px 0 0 var(--ink)",
      }}
      aria-label={`Toasts: ${count}`}
    >
      <div
        className="font-pixel text-[10px] flex items-center justify-between gap-3"
        style={{ color: "var(--ink)" }}
      >
        <span>TOASTS</span>
        <span style={{ color: "var(--toast-crust)" }}>×{count}</span>
      </div>
      <div className="flex items-center gap-[3px] flex-wrap max-w-[228px]">
        {Array.from({ length: shown }).map((_, i) => (
          <ToastSprite key={i} size={16} />
        ))}
        {overflow > 0 && (
          <span
            className="font-pixel text-[10px] ml-1"
            style={{ color: "var(--toast-crust)" }}
          >
            +{overflow}
          </span>
        )}
      </div>
    </div>
  );
}
