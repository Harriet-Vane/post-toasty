import { useCallback, useEffect, useRef, useState } from "react";
import angelToast from "@/assets/angel-toast.png";
import { FlyingToasters } from "@/components/FlyingToasters";

type Props = {
  width?: number;
  height?: number;
  className?: string;
  title?: string;
  loading?: "lazy" | "eager";
};

const IDLE_MS = 10000;
const HOP_MS = 600;

export function ToastAngel({
  width = 96,
  height = 96,
  className = "opacity-80",
  title,
  loading = "lazy",
}: Props) {
  const [flying, setFlying] = useState(false);
  const [hopping, setHopping] = useState(false);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hoppedThisIdleRef = useRef(false);

  const handleClick = useCallback(() => {
    setFlying(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const triggerHop = () => {
      if (hoppedThisIdleRef.current) return;
      hoppedThisIdleRef.current = true;
      setHopping(true);
      if (hopTimerRef.current) clearTimeout(hopTimerRef.current);
      hopTimerRef.current = setTimeout(() => setHopping(false), HOP_MS);
    };

    const resetIdle = () => {
      hoppedThisIdleRef.current = false;
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(triggerHop, IDLE_MS);
    };

    const events: (keyof WindowEventMap)[] = [
      "mousemove",
      "keydown",
      "touchstart",
      "scroll",
      "click",
    ];
    events.forEach((e) =>
      window.addEventListener(e, resetIdle, { passive: true }),
    );
    resetIdle();

    return () => {
      events.forEach((e) => window.removeEventListener(e, resetIdle));
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (hopTimerRef.current) clearTimeout(hopTimerRef.current);
    };
  }, []);

  return (
    <>
      <img
        src={angelToast}
        alt="Angel toast"
        title={title}
        width={width}
        height={height}
        className={`${className} cursor-pointer select-none`}
        loading={loading}
        draggable={false}
        onClick={handleClick}
        style={{
          animation: hopping ? `angel-hop ${HOP_MS}ms ease-out 1` : undefined,
          transformOrigin: "50% 100%",
        }}
      />
      {flying && <FlyingToasters onDone={() => setFlying(false)} />}
      <style>{`
        @keyframes angel-hop {
          0%   { transform: translateY(0) scaleY(1); }
          20%  { transform: translateY(0) scaleY(0.92); }
          50%  { transform: translateY(-10px) scaleY(1.02); }
          80%  { transform: translateY(0) scaleY(0.96); }
          100% { transform: translateY(0) scaleY(1); }
        }
      `}</style>
    </>
  );
}
