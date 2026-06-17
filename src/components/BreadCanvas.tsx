import type { BreadId, Topping, ToppingId } from "@/lib/runchbase";
import { getTopping } from "@/lib/runchbase";

/* ---------------- Bread shapes & clip paths ---------------- */

const BREAD_PATH_STANDARD =
  "M30 55 Q30 25 75 25 H125 Q170 25 170 55 V160 Q170 175 155 175 H45 Q30 175 30 160 Z";

const SCONE_PATH =
  "M100 35 C70 35 52 70 45 130 Q100 168 155 130 C148 70 130 35 100 35 Z";

const BAGEL_RING_PATH =
  // outer circle + inner hole using even-odd
  "M100 25 A75 75 0 1 0 100 175 A75 75 0 1 0 100 25 Z " +
  "M100 75 A25 25 0 1 1 100 125 A25 25 0 1 1 100 75 Z";

function breadShape(breadId: BreadId, fill: string, accent: string) {
  switch (breadId) {
    case "englishmuffin":
      return (
        <>
          <circle cx="100" cy="100" r="75" fill={fill} stroke={accent} strokeWidth="4" />
        </>
      );
    case "bagel":
      return (
        <>
          <path
            d={BAGEL_RING_PATH}
            fill={fill}
            stroke={accent}
            strokeWidth="4"
            fillRule="evenodd"
          />
          {/* inner hole edge */}
          <circle
            cx="100"
            cy="100"
            r="25"
            fill="none"
            stroke={accent}
            strokeWidth="3"
          />
        </>
      );
    case "scone":
      return (
        <path d={SCONE_PATH} fill={fill} stroke={accent} strokeWidth="4" />
      );
    default:
      return (
        <path d={BREAD_PATH_STANDARD} fill={fill} stroke={accent} strokeWidth="4" />
      );
  }
}

function breadClipPath(breadId: BreadId) {
  switch (breadId) {
    case "englishmuffin":
      return <circle cx="100" cy="100" r="72" />;
    case "bagel":
      // annulus via evenodd
      return <path d={BAGEL_RING_PATH} fillRule="evenodd" />;
    case "scone":
      return <path d={SCONE_PATH} />;
    default:
      return <path d={BREAD_PATH_STANDARD} />;
  }
}

const SOURDOUGH_SWIRL = (() => {
  const cx = 100;
  const cy = 100;
  const turns = 2.5;
  const steps = 80;
  const maxR = 38;
  let d = "";
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const angle = -Math.PI / 2 + t * turns * Math.PI * 2;
    const r = t * maxR;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    d += `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return d;
})();

function breadTexture(breadId: BreadId) {
  switch (breadId) {
    case "sourdough":
      return (
        <g stroke="var(--toast-crust)" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d={SOURDOUGH_SWIRL} />
        </g>
      );
    case "wholewheat":
      return (
        <g fill="var(--toast-crust)">
          {scatterPositions(14, "wholewheat").map((p, i) => (
            <ellipse key={i} cx={p.x} cy={p.y} rx="2.2" ry="1.2" transform={`rotate(${p.r} ${p.x} ${p.y})`} opacity="0.85" />
          ))}
        </g>
      );
    case "rye":
      return (
        <g fill="oklch(0.25 0.04 40)">
          {scatterPositions(34, "rye").map((p, i) => (
            <ellipse key={i} cx={p.x} cy={p.y} rx="1.4" ry="0.7" transform={`rotate(${p.r} ${p.x} ${p.y})`} opacity="0.85" />
          ))}
        </g>
      );
    case "englishmuffin":
      return (
        <g fill="var(--toast-crust)" opacity="0.7">
          {scatterPositions(28, "muffin").map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={0.8 + (i % 3) * 0.6} />
          ))}
        </g>
      );
    case "mystery":
      return (
        <g>
          {/* icicles hanging from top */}
          {[
            { x: 50 }, { x: 80 }, { x: 110 }, { x: 140 },
          ].map((c, i) => (
            <polygon
              key={i}
              points={`${c.x - 4},25 ${c.x + 4},25 ${c.x},${36 + (i % 2) * 5}`}
              fill="oklch(0.92 0.04 230)"
              stroke="oklch(0.55 0.08 230)"
              strokeWidth="1.5"
            />
          ))}
          <text
            x="100"
            y="118"
            textAnchor="middle"
            fontFamily="var(--font-pixel)"
            fontSize="58"
            fill="var(--toast-crust)"
            fontWeight="bold"
          >
            ?
          </text>
        </g>
      );
    default:
      return null;
  }
}

function breadFillColor(breadId: BreadId): { fill: string; accent: string } {
  switch (breadId) {
    case "rye":
      return { fill: "oklch(0.55 0.07 55)", accent: "oklch(0.3 0.05 40)" };
    case "wholewheat":
      return { fill: "oklch(0.7 0.1 60)", accent: "var(--toast-crust)" };
    case "scone":
      return { fill: "oklch(0.84 0.07 75)", accent: "oklch(0.55 0.09 60)" };
    case "mystery":
      return { fill: "oklch(0.78 0.05 70)", accent: "var(--toast-crust)" };
    default:
      return { fill: "var(--toast-gold)", accent: "var(--toast-crust)" };
  }
}

/* ---------------- Deterministic pseudo-random positions ---------------- */

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = (h * 16777619) >>> 0;
  }
  return h;
}

function rand(seed: number, salt: number) {
  const x = Math.sin(seed * 9301 + salt * 49297) * 233280;
  return x - Math.floor(x);
}

function scatterPositions(count: number, key: string, area = { x: 35, y: 35, w: 130, h: 130 }) {
  const seed = hash(key);
  const pts: { x: number; y: number; r: number }[] = [];
  // poisson-ish jittered grid
  const cols = Math.ceil(Math.sqrt(count * (area.w / area.h)));
  const rows = Math.ceil(count / cols);
  const cellW = area.w / cols;
  const cellH = area.h / rows;
  let i = 0;
  for (let r = 0; r < rows && i < count; r++) {
    for (let c = 0; c < cols && i < count; c++) {
      const jx = (rand(seed, i * 2) - 0.5) * cellW * 0.7;
      const jy = (rand(seed, i * 2 + 1) - 0.5) * cellH * 0.7;
      pts.push({
        x: area.x + cellW * (c + 0.5) + jx,
        y: area.y + cellH * (r + 0.5) + jy,
        r: rand(seed, i * 2 + 7) * 360,
      });
      i++;
    }
  }
  return pts;
}

/* ---------------- Topping renderers ---------------- */

function ToppingLayer({
  topping,
  index,
  breadId,
}: {
  topping: Topping;
  index: number;
  breadId: BreadId;
}) {
  const key = `${topping.id}-${index}`;
  const seedKey = `${topping.id}-${breadId}-${index}`;

  switch (topping.render) {
    case "spread": {
      // full coverage with gradient + knife swirl marks
      const gradId = `g-${key}`;
      return (
        <g>
          <defs>
            <radialGradient id={gradId} cx="50%" cy="40%" r="70%">
              <stop offset="0%" stopColor={topping.color} stopOpacity="1" />
              <stop offset="100%" stopColor={topping.accent ?? topping.color} stopOpacity="0.95" />
            </radialGradient>
          </defs>
          <rect x="0" y="0" width="200" height="200" fill={`url(#${gradId})`} opacity="0.92" />
          {/* knife swirl marks */}
          <g
            fill="none"
            stroke={topping.accent ?? topping.color}
            strokeOpacity="0.55"
            strokeWidth="6"
            strokeLinecap="round"
          >
            <path d="M45 75 Q100 55 155 80" />
            <path d="M50 120 Q100 100 150 125" />
          </g>
          <g
            fill="none"
            stroke="#ffffff"
            strokeOpacity="0.35"
            strokeWidth="4"
            strokeLinecap="round"
          >
            <path d="M55 95 Q100 80 145 100" />
          </g>
        </g>
      );
    }
    case "drizzle": {
      // spiral squeeze pattern (like a squirt of honey/ketchup spinning down)
      const seed = hash(seedKey);
      const cx = 100 + (rand(seed, 1) - 0.5) * 18;
      const cy = 100 + (rand(seed, 2) - 0.5) * 18;
      const turns = 3 + rand(seed, 3) * 1.2;
      const startAngle = rand(seed, 4) * Math.PI * 2;
      const maxR = 58;
      const steps = 90;
      const pts: string[] = [];
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const angle = startAngle + t * turns * Math.PI * 2;
        const r = 4 + t * maxR;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        pts.push(`${x.toFixed(2)} ${y.toFixed(2)}`);
      }
      const path = `M${pts[0]} L${pts.slice(1).join(" L")}`;
      return (
        <g>
          <path
            d={path}
            fill="none"
            stroke={topping.color}
            strokeWidth="11"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.95"
          />
          <path
            d={path}
            fill="none"
            stroke="#ffffff"
            strokeOpacity="0.4"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            transform="translate(-2 -2)"
          />
        </g>
      );
    }
    case "scatter": {
      const count =
        topping.id === "sprinkles" ? 55 : topping.id === "cinnamon" ? 60 : topping.id === "tomato" ? 7 : 14;
      const pts = scatterPositions(count, seedKey);
      return (
        <g>
          {pts.map((p, i) => {
            if (topping.id === "sprinkles") {
              const colors = ["#ff5fb4", "#2db6ff", "#ffd23f", "#56e07a", "#ff7a3a", "#a96bff"];
              const color = colors[(i + hash(seedKey)) % colors.length];
              return (
                <rect
                  key={i}
                  x={p.x - 4}
                  y={p.y - 1.4}
                  width="8"
                  height="2.8"
                  rx="1.4"
                  fill={color}
                  stroke="#222"
                  strokeWidth="0.4"
                  transform={`rotate(${p.r} ${p.x} ${p.y})`}
                />
              );
            }
            if (topping.id === "cinnamon") {
              return (
                <circle
                  key={i}
                  cx={p.x}
                  cy={p.y}
                  r={1.8 + (i % 3) * 0.8}
                  fill={i % 4 === 0 ? topping.accent : topping.color}
                  opacity="0.95"
                />
              );
            }
            if (topping.id === "tomato") {
              return (
                <g key={i} transform={`translate(${p.x} ${p.y})`}>
                  <circle r="14" fill={topping.color} stroke={topping.accent} strokeWidth="2.5" />
                  <circle r="4" fill="#ffc9b8" opacity="0.7" cx="-3" cy="-3" />
                  <circle r="2.2" fill="#fff4d8" cx="4" cy="0" />
                  <circle r="2.2" fill="#fff4d8" cx="-1" cy="4" />
                </g>
              );
            }
            if (topping.id === "gummy") {
              const colors = ["#f04e8a", "#34a85a", "#ffd23f", "#ff7a3a", "#56b3ff"];
              const color = colors[(i + hash(seedKey)) % colors.length];
              return (
                <g key={i} transform={`translate(${p.x} ${p.y}) rotate(${p.r})`}>
                  <ellipse rx="7.5" ry="9" fill={color} stroke="#222" strokeWidth="1.2" />
                  <circle cx="-2.4" cy="-4" r="1.1" fill="#222" />
                  <circle cx="2.4" cy="-4" r="1.1" fill="#222" />
                </g>
              );
            }
            if (topping.id === "sardines") {
              return (
                <g key={i} transform={`translate(${p.x} ${p.y}) rotate(${p.r})`}>
                  <ellipse rx="13" ry="4" fill={topping.color} stroke={topping.accent} strokeWidth="1.4" />
                  <polygon points="13,0 19,-5 19,5" fill={topping.color} stroke={topping.accent} strokeWidth="1.4" />
                  <circle cx="-8" cy="-0.8" r="1.2" fill={topping.accent} />
                </g>
              );
            }
            if (topping.id === "cereal") {
              return (
                <g key={i} transform={`translate(${p.x} ${p.y})`}>
                  <circle r="7" fill={topping.color} stroke={topping.accent} strokeWidth="1.8" />
                  <circle r="2.4" fill="var(--paper)" />
                </g>
              );
            }
            return <circle key={i} cx={p.x} cy={p.y} r="5" fill={topping.color} stroke="#222" strokeWidth="0.6" />;
          })}
        </g>
      );
    }
    case "banana": {
      const pts = scatterPositions(7, seedKey);
      return (
        <g>
          {pts.map((p, i) => (
            <g key={i} transform={`translate(${p.x} ${p.y})`}>
              <circle r="18" fill={topping.color} stroke={topping.accent} strokeWidth="2.6" />
              <g stroke={topping.accent} strokeWidth="1.4" fill="none" opacity="0.7">
                <circle r="5" />
                <line x1="-2.5" y1="-2.5" x2="2.5" y2="2.5" />
                <line x1="2.5" y1="-2.5" x2="-2.5" y2="2.5" />
              </g>
            </g>
          ))}
        </g>
      );
    }
    case "egg": {
      // full white layer with yolk
      return (
        <g>
          <path
            d="M30 70 Q40 50 70 55 Q95 45 120 55 Q155 50 165 75 Q175 105 160 130 Q150 160 110 158 Q70 165 50 145 Q25 120 30 70 Z"
            fill={topping.color}
            stroke="#e4d9b8"
            strokeWidth="2"
          />
          <circle cx="105" cy="105" r="22" fill={topping.accent} />
          <circle cx="98" cy="98" r="6" fill="#fff5a8" opacity="0.7" />
        </g>
      );
    }
    case "hotdog": {
      return (
        <g transform="translate(100 100) rotate(-18) translate(-100 -100)">
          <rect x="35" y="92" width="130" height="22" rx="11" fill={topping.color} stroke={topping.accent} strokeWidth="2.2" />
          <path d="M40 103 Q100 99 160 103" fill="none" stroke={topping.accent} strokeOpacity="0.5" strokeWidth="1.2" />
        </g>
      );
    }
    case "pickle": {
      return (
        <g transform="translate(100 100) rotate(-25) translate(-100 -100)">
          <ellipse cx="100" cy="100" rx="55" ry="16" fill={topping.color} stroke={topping.accent} strokeWidth="2.2" />
          {/* bumps */}
          {[-40, -20, 0, 20, 40].map((dx, i) => (
            <ellipse key={i} cx={100 + dx} cy="92" rx="6" ry="3" fill={topping.accent} opacity="0.45" />
          ))}
          {[-30, -10, 10, 30].map((dx, i) => (
            <ellipse key={`b${i}`} cx={100 + dx} cy="108" rx="5" ry="2.5" fill={topping.accent} opacity="0.45" />
          ))}
          <ellipse cx="80" cy="96" rx="6" ry="2" fill="#ffffff" opacity="0.35" />
        </g>
      );
    }
  }
}

/* ---------------- Main component ---------------- */

export function BreadCanvas({
  breadId,
  toppings,
  size = 320,
}: {
  breadId: BreadId;
  toppings: ToppingId[];
  size?: number;
}) {
  const { fill, accent } = breadFillColor(breadId);
  const clipId = `bread-clip-${breadId}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      role="img"
      aria-label={`Toast on ${breadId}`}
      style={{ display: "block" }}
    >
      <defs>
        <clipPath id={clipId}>{breadClipPath(breadId)}</clipPath>
      </defs>

      {/* Bread base */}
      {breadShape(breadId, fill, accent)}

      {/* All bread-surface content clipped to the bread shape */}
      <g clipPath={`url(#${clipId})`}>
        {/* Bread texture beneath toppings */}
        {breadTexture(breadId)}

        {/* Toppings layered in add order */}
        {toppings.map((tid, i) => {
          const t = getTopping(tid);
          if (!t) return null;
          return <ToppingLayer key={`${tid}-${i}`} topping={t} index={i} breadId={breadId} />;
        })}
      </g>

      {/* Edge highlight */}
      {breadId !== "bagel" && breadId !== "englishmuffin" && (
        <path
          d="M40 38 Q75 32 105 36"
          fill="none"
          stroke="oklch(0.98 0.05 90)"
          strokeOpacity="0.55"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}
