// Deterministic per-sticker "hand-cut" variation. Same key, same output, on every build and reload.
const hash = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
};
const rng = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const n = (x: number) => +x.toFixed(2);

interface Opts {
  rot?: number;     // centre rotation in deg, jittered by +-0.6
  die?: number;     // average white cut margin in px, each side varies
  radius?: number;  // base corner radius in px
  round?: boolean;  // percent radii for circles
  mis?: number;     // chance the colour fill is misregistered against the ink
  scuff?: number;   // chance of a hairline scuff
  peel?: number;    // chance of a lifted corner at rest
}

/** Inline custom properties consumed by the .st recipe in global.css. */
export function sk(key: string, o: Opts = {}): string {
  const { rot = 0, die = 6, radius = 12, round = false, mis = 0.5, scuff = 0, peel = 0 } = o;
  const r = rng(hash(key));
  const u = (a: number, b: number) => a + (b - a) * r();
  const v = [`--rot:${n(rot + u(-0.6, 0.6))}deg`];
  for (const k of ["dt", "dr", "db", "dl"]) v.push(`--${k}:${n(die * u(0.85, 1.4))}px`);
  const side = () => Array.from({ length: 4 }, () => (round ? `${n(u(46, 54))}%` : `${n(radius * u(0.75, 1.3))}px`)).join(" ");
  v.push(`--br:${side()} / ${side()}`);
  v.push(`--wob:url(#wob${1 + Math.floor(r() * 3)})`);
  if (r() < mis) v.push(`--mx:${n((r() < 0.5 ? -1 : 1) * u(0.7, 1.6))}px`, `--my:${n((r() < 0.5 ? -1 : 1) * u(0.7, 1.6))}px`);
  if (r() < scuff) v.push(`--scuff:var(--scuffimg) ${n(u(8, 80))}% ${n(u(15, 85))}% / 26px 7px no-repeat border-box`);
  if (r() < peel) v.push(`--peel:${Math.round(u(20, 26))}px`);
  return v.join(";");
}

/** Reading card: uneven margins plus a jittered clip-path polygon (cheap on huge elements, unlike an SVG filter). */
export function card(key: string, die = 8, rad = 14): string {
  const r = rng(hash("card:" + key));
  const u = (a: number, b: number) => a + (b - a) * r();
  const j = () => u(-1.5, 1.5);
  const R = rad + die;
  const pt = (xp: number, xo: number, yp: number, yo: number) => `calc(${xp}% + ${n(xo + j())}px) calc(${yp}% + ${n(yo + j())}px)`;
  const pts: string[] = [];
  const arc = (from: number, cx: [number, number], cy: [number, number]) => {
    for (let t = 0; t <= 4; t++) {
      const a = ((from + t * 22.5) * Math.PI) / 180;
      pts.push(pt(cx[0], cx[1] + R * Math.cos(a), cy[0], cy[1] + R * Math.sin(a)));
    }
  };
  arc(180, [0, R], [0, R]);
  for (let i = 1; i <= 6; i++) pts.push(pt((100 * i) / 7, 0, 0, 0));
  arc(270, [100, -R], [0, R]);
  for (let i = 1; i <= 12; i++) pts.push(pt(100, 0, (100 * i) / 13, 0));
  arc(0, [100, -R], [100, -R]);
  for (let i = 6; i >= 1; i--) pts.push(pt((100 * i) / 7, 0, 100, 0));
  arc(90, [0, R], [100, -R]);
  for (let i = 12; i >= 1; i--) pts.push(pt(0, 0, (100 * i) / 13, 0));
  const m = () => n(die * u(0.85, 1.4));
  const side = () => Array.from({ length: 4 }, () => `${n(rad * u(0.8, 1.25))}px`).join(" ");
  return `--rot:${n(u(-0.35, 0.35))}deg;--dt:${m()}px;--dr:${m()}px;--db:${m()}px;--dl:${m()}px;--br:${side()} / ${side()};--poly:polygon(${pts.join(",")})`;
}
