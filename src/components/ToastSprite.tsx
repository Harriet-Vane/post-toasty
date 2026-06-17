/**
 * A blocky 8x8 bitmap pixel-art toast sprite, rendered as inline SVG rects.
 * 0 = empty, 1 = crust outline, 2 = golden fill, 3 = highlight.
 */
const SPRITE: number[][] = [
  [0, 1, 1, 1, 1, 1, 1, 0],
  [1, 2, 2, 2, 2, 2, 2, 1],
  [1, 2, 3, 2, 2, 2, 2, 1],
  [1, 2, 2, 2, 2, 2, 2, 1],
  [1, 2, 2, 2, 2, 2, 2, 1],
  [1, 2, 2, 2, 2, 2, 3, 1],
  [1, 2, 2, 2, 2, 2, 2, 1],
  [0, 1, 1, 1, 1, 1, 1, 0],
];

const PALETTE: Record<number, string> = {
  1: "var(--toast-crust)",
  2: "var(--toast-gold)",
  3: "oklch(0.95 0.08 90)",
};

export function ToastSprite({ size = 24 }: { size?: number }) {
  const px = size / 8;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 8 8"
      className="pixelated"
      aria-hidden="true"
    >
      {SPRITE.map((row, y) =>
        row.map((cell, x) =>
          cell === 0 ? null : (
            <rect
              key={`${x}-${y}`}
              x={x}
              y={y}
              width={1}
              height={1}
              fill={PALETTE[cell]}
            />
          ),
        ),
      )}
      {/* prevent unused var warning */}
      <desc data-px={px} />
    </svg>
  );
}
