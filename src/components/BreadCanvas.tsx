import type { BreadId, Topping, ToppingId } from "@/lib/runchbase";
import { getTopping } from "@/lib/runchbase";

/* ---------------- Bread shapes & clip paths ---------------- */

const BREAD_PATH_STANDARD =
  "M30 55 Q30 25 75 25 H125 Q170 25 170 55 V160 Q170 175 155 175 H45 Q30 175 30 160 Z";

const SCONE_PATH =
  "M100 35 C70 35 52 70 45 130 Q100 168 155 130 C148 70 130 35 100 35 Z";

const BAGEL_RING_PATH =
  "M100 25 A75 75 0 1 0 100 175 A75 75 0 1 0 100 25 Z " +
  "M100 75 A25 25 0 1 1 100 125 A25 25 0 1 1 100 75 Z";

function breadShape(breadId: BreadId, fill: string, accent: string) {
  switch (breadId) {
    case "englishmuffin":
      return <circle cx="100" cy="100" r="75" fill={fill} stroke={accent} strokeWidth="4" />;
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
      return <path d={SCONE_PATH} fill={fill} stroke={accent} strokeWidth="4" />;
    default:
      return <path d={BREAD_PATH_STANDARD} fill={fill} stroke={accent} strokeWidth="4" />;
  }
}

function breadClipPath(breadId: BreadId) {
  switch (breadId) {
    case "englishmuffin":
      return <circle cx="100" cy="100" r="72" />;
    case "bagel":
      return <path d={BAGEL_RING_PATH} fillRule="evenodd" />;
    case "scone":
      return <path d={SCONE_PATH} />;
    default:
      return <path d={BREAD_PATH_STANDARD} />;
  }
}

/** Approximate front-edge drip anchor points (x, y) in local 200x200 coords. */
function frontEdgeAnchors(breadId: BreadId): { x: number; y: number }[] {
  switch (breadId) {
    case "englishmuffin":
      // bottom arc of circle r=75 at cy=100
      return [
        { x: 55, y: 168 },
        { x: 80, y: 174 },
        { x: 105, y: 174 },
        { x: 130, y: 170 },
        { x: 150, y: 160 },
      ];
    case "bagel":
      return [
        { x: 50, y: 165 },
        { x: 85, y: 174 },
        { x: 120, y: 174 },
        { x: 155, y: 165 },
      ];
    case "scone":
      return [
        { x: 55, y: 145 },
        { x: 85, y: 158 },
        { x: 115, y: 158 },
        { x: 145, y: 145 },
      ];
    default:
      return [
        { x: 50, y: 175 },
        { x: 78, y: 175 },
        { x: 105, y: 175 },
        { x: 132, y: 175 },
        { x: 158, y: 175 },
      ];
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
          {[{ x: 50 }, { x: 80 }, { x: 110 }, { x: 140 }].map((c, i) => (
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
      return { fill: "var(--toast-gold)", accent: "var(--toast-crust)" };
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

function scatterPositions(count: number, key: string, area = { x: 25, y: 30, w: 150, h: 145 }) {
  const seed = hash(key);
  const pts: { x: number; y: number; r: number }[] = [];
  const cols = Math.ceil(Math.sqrt(count * (area.w / area.h)));
  const rows = Math.ceil(count / cols);
  const cellW = area.w / cols;
  const cellH = area.h / rows;
  let i = 0;
  for (let r = 0; r < rows && i < count; r++) {
    for (let c = 0; c < cols && i < count; c++) {
      const jx = (rand(seed, i * 2) - 0.5) * cellW * 0.85;
      const jy = (rand(seed, i * 2 + 1) - 0.5) * cellH * 0.85;
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

/** Does this topping render large enough to extend past the bread edges? */
function isOverflowTopping(id: ToppingId): boolean {
  return id === "pineapple" || id === "banana" || id === "pickle";
}

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
        topping.id === "sprinkles" ? 70 : topping.id === "cinnamon" ? 80 : topping.id === "tomato" ? 9 : topping.id === "gummy" ? 55 : 18;
      if (topping.id === "pineapple") {
        // Rings extend past the bread edges (rendered outside the bread clip).
        const seed = hash(seedKey);
        const rings = [
          { cx: 60, cy: 60, r: 38 },
          { cx: 145, cy: 70, r: 36 },
          { cx: 70, cy: 145, r: 34 },
          { cx: 150, cy: 150, r: 38 },
          { cx: 105, cy: 105, r: 32 },
        ];
        return (
          <g>
            {rings.map((ring, idx) => {
              const inner = ring.r * 0.32;
              const ringPath =
                `M${ring.cx} ${ring.cy - ring.r} A${ring.r} ${ring.r} 0 1 0 ${ring.cx} ${ring.cy + ring.r} A${ring.r} ${ring.r} 0 1 0 ${ring.cx} ${ring.cy - ring.r} Z ` +
                `M${ring.cx} ${ring.cy - inner} A${inner} ${inner} 0 1 1 ${ring.cx} ${ring.cy + inner} A${inner} ${inner} 0 1 1 ${ring.cx} ${ring.cy - inner} Z`;
              const segCount = 10;
              const lines = [];
              for (let i = 0; i < segCount; i++) {
                const a = (i / segCount) * Math.PI * 2 + rand(seed, idx) * 0.5;
                lines.push(
                  <line
                    key={i}
                    x1={ring.cx + Math.cos(a) * inner}
                    y1={ring.cy + Math.sin(a) * inner}
                    x2={ring.cx + Math.cos(a) * ring.r}
                    y2={ring.cy + Math.sin(a) * ring.r}
                    stroke={topping.accent}
                    strokeWidth="1.6"
                    opacity="0.55"
                  />
                );
              }
              return (
                <g key={idx}>
                  <path
                    d={ringPath}
                    fill={topping.color}
                    stroke={topping.accent}
                    strokeWidth="2.5"
                    fillRule="evenodd"
                  />
                  {lines}
                </g>
              );
            })}
          </g>
        );
      }
      const pts = scatterPositions(count, seedKey, { x: 20, y: 25, w: 160, h: 150 });
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
              // Everything bagel seasoning: poppy seeds, sesame seeds, garlic/onion flakes, salt
              const variant = (i + hash(seedKey)) % 5;
              if (variant === 0) {
                // poppy seed - tiny black dot
                return <circle key={i} cx={p.x} cy={p.y} r="1.3" fill="#1a1a1a" />;
              }
              if (variant === 1) {
                // white sesame seed - small oval
                return (
                  <ellipse
                    key={i}
                    cx={p.x}
                    cy={p.y}
                    rx="2.2"
                    ry="1.2"
                    fill="#f4e4c1"
                    stroke="#a8946a"
                    strokeWidth="0.3"
                    transform={`rotate(${p.r} ${p.x} ${p.y})`}
                  />
                );
              }
              if (variant === 2) {
                // black sesame seed
                return (
                  <ellipse
                    key={i}
                    cx={p.x}
                    cy={p.y}
                    rx="2"
                    ry="1.1"
                    fill="#2a2a2a"
                    transform={`rotate(${p.r} ${p.x} ${p.y})`}
                  />
                );
              }
              if (variant === 3) {
                // dried garlic flake - irregular tan chip
                return (
                  <rect
                    key={i}
                    x={p.x - 2.2}
                    y={p.y - 1.4}
                    width="4.4"
                    height="2.6"
                    rx="0.8"
                    fill="#e6c98a"
                    stroke="#8a6f3a"
                    strokeWidth="0.4"
                    transform={`rotate(${p.r} ${p.x} ${p.y})`}
                  />
                );
              }
              // salt flake
              return (
                <rect
                  key={i}
                  x={p.x - 1.4}
                  y={p.y - 1.4}
                  width="2.8"
                  height="2.8"
                  fill="#fafafa"
                  stroke="#bdbdbd"
                  strokeWidth="0.4"
                  transform={`rotate(${p.r} ${p.x} ${p.y})`}
                />
              );
            }
            if (topping.id === "frosting") {
              // Pickled red onion ring
              return (
                <g key={i} transform={`translate(${p.x} ${p.y}) rotate(${p.r})`}>
                  <ellipse rx="11" ry="9" fill="none" stroke={topping.color} strokeWidth="3" opacity="0.9" />
                  <ellipse rx="7.5" ry="6" fill="none" stroke={topping.accent} strokeWidth="1.6" opacity="0.85" />
                  <ellipse rx="4" ry="3.2" fill="none" stroke={topping.color} strokeWidth="1.2" opacity="0.7" />
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
      const pts = scatterPositions(7, seedKey, { x: 45, y: 45, w: 110, h: 110 });
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
      // Cluster of oyster mushrooms — overlapping fan-shaped caps with short stems
      const caps: Array<{ x: number; y: number; r: number; s: number }> = [
        { x: 70, y: 110, r: -22, s: 1.0 },
        { x: 100, y: 96, r: -6, s: 1.15 },
        { x: 132, y: 108, r: 14, s: 1.0 },
        { x: 88, y: 124, r: -10, s: 0.85 },
        { x: 118, y: 126, r: 8, s: 0.9 },
      ];
      return (
        <g>
          {caps.map((c, i) => (
            <g key={i} transform={`translate(${c.x} ${c.y}) rotate(${c.r}) scale(${c.s})`}>
              {/* stem */}
              <path
                d="M-4 2 Q-3 14 -1 20 L5 20 Q7 14 6 2 Z"
                fill="#f3ead6"
                stroke={topping.accent}
                strokeWidth="1"
              />
              {/* cap — fan/oyster shape */}
              <path
                d="M-24 2 Q-26 -14 -10 -18 Q0 -22 12 -18 Q26 -14 22 2 Q14 6 0 6 Q-14 6 -24 2 Z"
                fill={topping.color}
                stroke={topping.accent}
                strokeWidth="1.4"
              />
              {/* gill lines under cap */}
              <path d="M-18 0 Q-14 4 -10 6" fill="none" stroke={topping.accent} strokeWidth="0.6" opacity="0.5" />
              <path d="M-10 -4 Q-8 2 -6 6" fill="none" stroke={topping.accent} strokeWidth="0.6" opacity="0.5" />
              <path d="M-2 -6 L-2 6" fill="none" stroke={topping.accent} strokeWidth="0.6" opacity="0.5" />
              <path d="M6 -6 Q6 0 6 6" fill="none" stroke={topping.accent} strokeWidth="0.6" opacity="0.5" />
              <path d="M14 -4 Q12 2 10 6" fill="none" stroke={topping.accent} strokeWidth="0.6" opacity="0.5" />
              {/* highlight */}
              <path d="M-14 -10 Q-4 -16 8 -14" fill="none" stroke="#fff8ea" strokeWidth="1.2" opacity="0.7" />
            </g>
          ))}
        </g>
      );
    }
    case "pickle": {
      const pts = scatterPositions(7, seedKey, { x: 30, y: 30, w: 140, h: 140 });
      return (
        <g>
          {pts.map((p, i) => {
            const scale = 0.9 + ((i % 3) * 0.15);
            return (
              <g key={i} transform={`translate(${p.x} ${p.y}) rotate(${p.r}) scale(${scale})`}>
                {/* Broad leaf body - spinach/kale shape */}
                <path
                  d="M0 -20 C12 -18, 18 -6, 14 8 C10 18, 4 22, 0 22 C-4 22, -10 18, -14 8 C-18 -6, -12 -18, 0 -20 Z"
                  fill={topping.color}
                  stroke={topping.accent}
                  strokeWidth="1.4"
                />
                {/* Lighter highlight */}
                <path d="M-6 -14 C-2 -16, 4 -14, 6 -8" fill="none" stroke="#a8d47a" strokeWidth="1.2" opacity="0.7" />
                {/* Central vein */}
                <path d="M0 -18 Q0 0 0 20" fill="none" stroke={topping.accent} strokeWidth="0.9" opacity="0.7" />
                {/* Side veins */}
                <path d="M0 -10 Q5 -8 10 -2" fill="none" stroke={topping.accent} strokeWidth="0.6" opacity="0.55" />
                <path d="M0 -10 Q-5 -8 -10 -2" fill="none" stroke={topping.accent} strokeWidth="0.6" opacity="0.55" />
                <path d="M0 0 Q6 2 11 8" fill="none" stroke={topping.accent} strokeWidth="0.6" opacity="0.55" />
                <path d="M0 0 Q-6 2 -11 8" fill="none" stroke={topping.accent} strokeWidth="0.6" opacity="0.55" />
              </g>
            );
          })}
        </g>
      );
    }
  }
}

/* ---------------- Drip renderer for spreads ---------------- */

function SpreadDrips({
  topping,
  breadId,
  spreadIndex,
}: {
  topping: Topping;
  breadId: BreadId;
  spreadIndex: number;
}) {
  const anchors = frontEdgeAnchors(breadId);
  const seed = hash(`${topping.id}-drip-${breadId}-${spreadIndex}`);
  // Pick 2-3 anchors per spread so multiple spreads end up dripping in different spots.
  const dripCount = 2 + (spreadIndex % 2);
  const startIdx = Math.floor(rand(seed, 1) * anchors.length);
  return (
    <g>
      {Array.from({ length: dripCount }).map((_, i) => {
        const a = anchors[(startIdx + i * 2) % anchors.length];
        const dripLen = 14 + rand(seed, i * 3 + 1) * 18;
        const width = 7 + rand(seed, i * 3 + 2) * 6;
        const xOff = (rand(seed, i * 3 + 3) - 0.5) * 8;
        const x = a.x + xOff;
        const y = a.y - 2;
        return (
          <g key={i}>
            {/* drip stem */}
            <path
              d={`M${x - width / 2} ${y} Q${x - width / 2} ${y + dripLen * 0.6} ${x} ${y + dripLen} Q${x + width / 2} ${y + dripLen * 0.6} ${x + width / 2} ${y} Z`}
              fill={topping.color}
              stroke={topping.accent ?? topping.color}
              strokeOpacity="0.4"
              strokeWidth="0.8"
            />
            {/* drop bead */}
            <circle
              cx={x}
              cy={y + dripLen}
              r={width * 0.55}
              fill={topping.color}
              stroke={topping.accent ?? topping.color}
              strokeOpacity="0.4"
              strokeWidth="0.8"
            />
            {/* tiny highlight */}
            <ellipse
              cx={x - width * 0.18}
              cy={y + dripLen - width * 0.3}
              rx={width * 0.18}
              ry={width * 0.35}
              fill="#ffffff"
              opacity="0.3"
            />
          </g>
        );
      })}
    </g>
  );
}

/* ---------------- Salt sprinkle ---------------- */

function SaltSprinkle({ breadId }: { breadId: BreadId }) {
  const pts = scatterPositions(55, `salt-${breadId}`, { x: 25, y: 30, w: 150, h: 140 });
  return (
    <g>
      {pts.map((p, i) => {
        const s = 1.2 + (i % 3) * 0.5;
        return (
          <g key={i} transform={`translate(${p.x} ${p.y}) rotate(${p.r})`}>
            <rect
              x={-s / 2}
              y={-s / 2}
              width={s}
              height={s}
              fill="#ffffff"
              stroke="#cfd6e2"
              strokeWidth="0.3"
            />
            {i % 4 === 0 && (
              <circle r={s * 0.9} fill="#ffffff" opacity="0.55" />
            )}
          </g>
        );
      })}
    </g>
  );
}

/* ---------------- Main component ---------------- */


export function BreadCanvas({
  breadId,
  toppings,
  size = 320,
  salted = false,
}: {
  breadId: BreadId;
  toppings: ToppingId[];
  size?: number;
  salted?: boolean;
}) {

  const { fill, accent } = breadFillColor(breadId);
  const clipId = `bread-clip-${breadId}`;

  // Per-spread offset so consecutive spread layers visually stack.
  const SPREAD_OFFSET = 8;

  // Resolve toppings with metadata so we can split overflow vs clipped.
  const resolved = toppings
    .map((tid, i) => ({ tid, t: getTopping(tid), i }))
    .filter((x): x is { tid: ToppingId; t: Topping; i: number } => !!x.t);

  // Pre-compute spread-layer index (only for spread/drizzle types) so the offset
  // counts only spread/drizzle layers — extras don't bump the stack.
  let spreadCounter = 0;
  const spreadIndexFor: Record<number, number> = {};
  resolved.forEach(({ t, i }) => {
    if (t.render === "spread" || t.render === "drizzle") {
      spreadIndexFor[i] = spreadCounter++;
    }
  });

  // Isometric tilt transform applied to the entire toast: small skew + vertical compression.
  // origin around (100,110) for a balanced look.
  const isoTransform =
    "matrix(1 0 -0.18 0.78 18 12)";

  return (
    <svg
      width={size}
      height={size}
      viewBox="-15 -10 230 230"
      role="img"
      aria-label={`Toast on ${breadId}`}
      style={{ display: "block", overflow: "visible" }}
    >
      <defs>
        <clipPath id={clipId}>{breadClipPath(breadId)}</clipPath>
      </defs>

      <g transform={isoTransform}>
        {/* Bread "side" / thickness: same shape offset down + slightly right, darker. */}
        <g transform="translate(3 14)" opacity="0.95">
          {breadShape(breadId, "oklch(0.45 0.07 50)", "oklch(0.3 0.05 40)")}
        </g>

        {/* Bread top face */}
        {breadShape(breadId, fill, accent)}

        {/* Clipped surface: texture + spreads + non-overflow toppings */}
        <g clipPath={`url(#${clipId})`}>
          {breadTexture(breadId)}

          {resolved.map(({ tid, t, i }) => {
            if (isOverflowTopping(tid)) return null;
            const sIdx = spreadIndexFor[i];
            const offset =
              sIdx !== undefined
                ? `translate(${-sIdx * SPREAD_OFFSET * 0.6} ${-sIdx * SPREAD_OFFSET})`
                : undefined;
            return (
              <g key={`${tid}-${i}`} transform={offset}>
                <ToppingLayer topping={t} index={i} breadId={breadId} />
              </g>
            );
          })}

          
        </g>


        {/* Spread drips: rendered OUTSIDE the top-surface clip so they hang
            down over the bread's side face. Each spread gets its own drips.
            Spiral (drizzle) toppings do not drip. */}
        {resolved.map(({ tid, t, i }) => {
          if (t.render !== "spread") return null;
          const sIdx = spreadIndexFor[i] ?? 0;
          return (
            <SpreadDrips
              key={`drip-${tid}-${i}`}
              topping={t}
              breadId={breadId}
              spreadIndex={sIdx}
            />
          );
        })}

        {/* Overflow toppings (e.g. pineapple rings) — render AFTER and
            OUTSIDE the bread clip so they stay round and extend over the edge. */}
        {resolved.map(({ tid, t, i }) => {
          if (!isOverflowTopping(tid)) return null;
          return <ToppingLayer key={`overflow-${tid}-${i}`} topping={t} index={i} breadId={breadId} />;
        })}

        {/* Salt always sits on top of the entire stack, including overflow toppings */}
        {salted && (
          <g clipPath={`url(#${clipId})`}>
            <SaltSprinkle breadId={breadId} />
          </g>
        )}

        {/* Edge highlight on the top face */}
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
      </g>
    </svg>
  );
}
