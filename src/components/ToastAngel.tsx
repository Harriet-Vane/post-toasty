import { useCallback, useRef, useState } from "react";
import angelToast from "@/assets/angel-toast.png";

type Heart = {
  id: number;
  left: number;
  drift: number;
  rotate: number;
  duration: number;
  emoji: string;
  size: number;
};

const EMOJIS = ["❤️", "💖", "💕", "💗", "💝", "♥️"];

let heartIdCounter = 0;

type Props = {
  width?: number;
  height?: number;
  className?: string;
  title?: string;
  loading?: "lazy" | "eager";
};

export function ToastAngel({
  width = 96,
  height = 96,
  className = "opacity-80",
  title,
  loading = "lazy",
}: Props) {
  const [hearts, setHearts] = useState<Heart[]>([]);
  const wrapperRef = useRef<HTMLSpanElement>(null);

  const spawn = useCallback(() => {
    const burst = 4 + Math.floor(Math.random() * 3);
    const next: Heart[] = Array.from({ length: burst }).map(() => ({
      id: ++heartIdCounter,
      left: 50 + (Math.random() * 40 - 20),
      drift: Math.random() * 40 - 20,
      rotate: Math.random() * 40 - 20,
      duration: 1100 + Math.random() * 700,
      emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
      size: 12 + Math.floor(Math.random() * 8),
    }));
    setHearts((prev) => [...prev, ...next]);
    const maxDuration = Math.max(...next.map((h) => h.duration));
    const ids = new Set(next.map((h) => h.id));
    window.setTimeout(() => {
      setHearts((prev) => prev.filter((h) => !ids.has(h.id)));
    }, maxDuration + 50);
  }, []);

  return (
    <span
      ref={wrapperRef}
      className="relative inline-block cursor-pointer select-none"
      onClick={spawn}
      style={{ width, height, lineHeight: 0 }}
    >
      <img
        src={angelToast}
        alt="Angel toast"
        title={title}
        width={width}
        height={height}
        className={className}
        loading={loading}
        draggable={false}
      />
      <span className="pointer-events-none absolute inset-0 overflow-visible">
        {hearts.map((h) => (
          <span
            key={h.id}
            className="absolute"
            style={{
              left: `${h.left}%`,
              top: "40%",
              fontSize: `${h.size}px`,
              transform: "translate(-50%, -50%)",
              animation: `toast-angel-heart ${h.duration}ms ease-out forwards`,
              // CSS custom props consumed by the keyframes below
              ["--drift" as never]: `${h.drift}px`,
              ["--rotate" as never]: `${h.rotate}deg`,
            }}
          >
            {h.emoji}
          </span>
        ))}
      </span>
      <style>{`
        @keyframes toast-angel-heart {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.6) rotate(0deg);
          }
          15% {
            opacity: 1;
            transform: translate(calc(-50% + (var(--drift) * 0.15)), calc(-50% - 8px)) scale(1) rotate(calc(var(--rotate) * 0.2));
          }
          100% {
            opacity: 0;
            transform: translate(calc(-50% + var(--drift)), calc(-50% - 70px)) scale(0.9) rotate(var(--rotate));
          }
        }
      `}</style>
    </span>
  );
}
