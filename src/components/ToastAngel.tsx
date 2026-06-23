import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import angelToast from "@/assets/angel-toast.png";

type Heart = {
  id: number;
  x: number; // viewport px
  y: number; // viewport px (start)
  drift: number;
  rotate: number;
  duration: number;
  rise: number;
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
  const imgRef = useRef<HTMLImageElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const spawn = useCallback(() => {
    const el = imgRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height * 0.4;

    const burst = 4 + Math.floor(Math.random() * 3);
    const next: Heart[] = Array.from({ length: burst }).map(() => ({
      id: ++heartIdCounter,
      x: cx + (Math.random() * rect.width * 0.4 - rect.width * 0.2),
      y: cy,
      drift: Math.random() * 120 - 60,
      rotate: Math.random() * 60 - 30,
      duration: 5500 + Math.random() * 2500,
      rise: cy + 80, // travel from start up past the top of viewport
      emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
      size: 14 + Math.floor(Math.random() * 10),
    }));
    setHearts((prev) => [...prev, ...next]);
    const maxDuration = Math.max(...next.map((h) => h.duration));
    const ids = new Set(next.map((h) => h.id));
    window.setTimeout(() => {
      setHearts((prev) => prev.filter((h) => !ids.has(h.id)));
    }, maxDuration + 100);
  }, []);

  const overlay =
    mounted && hearts.length > 0
      ? createPortal(
          <div
            className="pointer-events-none fixed inset-0 overflow-hidden"
            style={{ zIndex: 9999 }}
          >
            {hearts.map((h) => (
              <span
                key={h.id}
                className="absolute"
                style={{
                  left: `${h.x}px`,
                  top: `${h.y}px`,
                  fontSize: `${h.size}px`,
                  transform: "translate(-50%, -50%)",
                  animation: `toast-angel-heart-rise ${h.duration}ms linear forwards`,
                  ["--drift" as never]: `${h.drift}px`,
                  ["--rotate" as never]: `${h.rotate}deg`,
                  ["--rise" as never]: `${h.rise}px`,
                }}
              >
                {h.emoji}
              </span>
            ))}
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <img
        ref={imgRef}
        src={angelToast}
        alt="Angel toast"
        title={title}
        width={width}
        height={height}
        className={`${className} cursor-pointer select-none`}
        loading={loading}
        draggable={false}
        onClick={spawn}
      />
      {overlay}
      <style>{`
        @keyframes toast-angel-heart-rise {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.5) rotate(0deg);
          }
          8% {
            opacity: 1;
            transform: translate(-50%, calc(-50% - 12px)) scale(1) rotate(calc(var(--rotate) * 0.15));
          }
          90% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translate(calc(-50% + var(--drift)), calc(-50% - var(--rise))) scale(1) rotate(var(--rotate));
          }
        }
      `}</style>
    </>
  );
}
