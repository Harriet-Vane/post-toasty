import { useMemo } from "react";

export function SaltFall({ count = 90 }: { count?: number }) {
  const grains = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const left = Math.random() * 100;
        const size = 3 + Math.random() * 5;
        const duration = 3.0 + Math.random() * 2.5;
        const delay = Math.random() * 2.0;
        const rotate = Math.random() * 360;
        const sparkle = Math.random() < 0.5;
        return { i, left, size, duration, delay, rotate, sparkle };
      }),
    [count],
  );

  return (
    <div className="salt-overlay" aria-hidden="true">
      {grains.map((g) => (
        <span
          key={g.i}
          className={`salt-grain${g.sparkle ? " sparkle" : ""}`}
          style={{
            left: `${g.left}%`,
            width: `${g.size}px`,
            height: `${g.size}px`,
            animationDuration: `${g.duration}s`,
            animationDelay: `${g.delay}s`,
            transform: `rotate(${g.rotate}deg)`,
          }}
        />
      ))}
    </div>
  );
}
