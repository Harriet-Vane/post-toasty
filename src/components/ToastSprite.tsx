/**
 * A chunky toast-shaped logo icon for the PostToast marquee.
 * Rounded top, flat bottom with a crust outline, drawn with the same
 * palette used throughout the app.
 */
export function ToastSprite({ size = 28 }: { size?: number }) {
  const width = size;
  const height = Math.round((size * 26) / 32); // preserve 32:26 ratio
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 32 26"
      className="pixelated"
      aria-hidden="true"
      fill="none"
    >
      {/* crust shadow / thickness */}
      <path
        d="M4 20 V12 Q4 4 12 4 H20 Q28 4 28 12 V20 Q28 23 25 23 H7 Q4 23 4 20 Z"
        fill="var(--toast-crust)"
      />
      {/* golden bread face */}
      <path
        d="M6 20 V12 Q6 6 12 6 H20 Q26 6 26 12 V20 Q26 21 25 21 H7 Q6 21 6 20 Z"
        fill="var(--toast-gold)"
      />
      {/* highlight */}
      <path
        d="M8 10 Q12 8 16 8"
        stroke="oklch(0.95 0.08 90)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M20 10 Q22 9 23 10"
        stroke="oklch(0.95 0.08 90)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
