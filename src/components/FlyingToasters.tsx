import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import toasterAsset from "@/assets/flying-toaster-pixel.png.asset.json";

type Flyer = {
  id: number;
  top: number;
  startOffset: number;
  size: number;
  delay: number;
  duration: number;
  bob: number;
};

export function FlyingToasters({ onDone }: { onDone: () => void }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const t = setTimeout(onDone, 15000);
    return () => clearTimeout(t);
  }, [onDone]);

  const flyers = useMemo<Flyer[]>(() => {
    const arr: Flyer[] = [];
    for (let i = 0; i < 3; i++) {
      arr.push({
        id: i,
        top: 10 + Math.random() * 70,
        startRight: 100 + Math.random() * 40,
        size: 100 + Math.random() * 60,
        delay: Math.random() * 2.5,
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
            right: 0,
            width: `${f.size}px`,
            height: `${f.size}px`,
            animation: `flyRight ${f.duration}s linear ${f.delay}s forwards`,
            ["--start-right" as string]: `${f.startRight}vw`,
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              animation: `flyBob ${0.6 + Math.random() * 0.4}s ease-in-out ${f.delay}s infinite alternate`,
              ["--bob" as string]: `${f.bob}px`,
            }}
          >
            <img
              src={toasterAsset.url}
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
        @keyframes flyRight {
          0% { transform: translateX(calc(var(--start-right) * -1)); }
          100% { transform: translateX(130vw); }
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
