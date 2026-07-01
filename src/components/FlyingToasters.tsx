import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import toasterImg from "@/assets/flying-toaster.png";
import toastImg from "@/assets/flying-toast.png";

type Flyer = {
  id: number;
  kind: "toaster" | "toast";
  top: number; // vh
  startLeft: number; // vw (start position, right of screen)
  size: number; // px
  delay: number; // s
  duration: number; // s
  bob: number; // px vertical bob amplitude
};

export function FlyingToasters({ onDone }: { onDone: () => void }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const t = setTimeout(onDone, 12000);
    return () => clearTimeout(t);
  }, [onDone]);

  const flyers = useMemo<Flyer[]>(() => {
    const arr: Flyer[] = [];
    let id = 0;
    for (let i = 0; i < 8; i++) {
      arr.push({
        id: id++,
        kind: "toaster",
        top: 5 + Math.random() * 80,
        startLeft: 100 + Math.random() * 60,
        size: 90 + Math.random() * 70,
        delay: Math.random() * 3,
        duration: 9 + Math.random() * 4,
        bob: 8 + Math.random() * 14,
      });
    }
    return arr;
  }, []);

  if (!mounted || typeof document === "undefined") return null;

  return createPortal(
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
        zIndex: 9999,
      }}
    >
      {flyers.map((f) => (
        <div
          key={f.id}
          style={{
            position: "absolute",
            top: `${f.top}vh`,
            left: 0,
            width: `${f.size}px`,
            height: `${f.size}px`,
            animation: `flyLeft ${f.duration}s linear ${f.delay}s forwards`,
            ["--start-left" as string]: `${f.startLeft}vw`,
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              animation: `flyBob ${0.6 + Math.random() * 0.4}s ease-in-out ${f.delay}s infinite alternate`,
              transform: `translateY(0)`,
              ["--bob" as string]: `${f.bob}px`,
            }}
          >
            <img
              src={f.kind === "toaster" ? toasterImg : toastImg}
              alt=""
              width={f.size}
              height={f.size}
              style={{
                width: "100%",
                height: "100%",
                imageRendering: "pixelated",
                display: "block",
              }}
            />
          </div>
        </div>
      ))}
      <style>{`
        @keyframes flyLeft {
          0% { transform: translateX(var(--start-left)); }
          100% { transform: translateX(-30vw); }
        }
        @keyframes flyBob {
          from { transform: translateY(calc(var(--bob) * -1)); }
          to { transform: translateY(var(--bob)); }
        }
      `}</style>
    </div>,
    document.body,
  );
}
