/**
 * Particle formations, one per page section. Each particle travels from A to B
 * (both vec3); a particle with A == B sits still. The shader animates t along
 * A→B, which reads as data flowing through the shape.
 */
// Case studies get their own shapes, so observe the articles rather than the #work wrapper.
export const SECTION_IDS = ["hero", "moso", "salon", "okxe", "approach", "ai", "experience", "contact"] as const;
export type SectionId = (typeof SECTION_IDS)[number];

export interface Formation {
  a: Float32Array;
  b: Float32Array;
}

interface Placement {
  x: number;
  y: number;
  z: number;
  scale: number;
  rotX: number;
  rotY: number;
}

type V3 = [number, number, number];

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

class Writer {
  readonly a: Float32Array;
  readonly b: Float32Array;
  private cx: number;
  private sx: number;
  private cy: number;
  private sy: number;

  constructor(
    n: number,
    private p: Placement,
  ) {
    this.a = new Float32Array(n * 3);
    this.b = new Float32Array(n * 3);
    this.cx = Math.cos(p.rotX);
    this.sx = Math.sin(p.rotX);
    this.cy = Math.cos(p.rotY);
    this.sy = Math.sin(p.rotY);
  }

  private put(arr: Float32Array, i: number, [x, y, z]: V3) {
    // rotate around Y, then X, then scale and place
    const x1 = x * this.cy + z * this.sy;
    const z1 = -x * this.sy + z * this.cy;
    const y2 = y * this.cx - z1 * this.sx;
    const z2 = y * this.sx + z1 * this.cx;
    arr[i * 3] = x1 * this.p.scale + this.p.x;
    arr[i * 3 + 1] = y2 * this.p.scale + this.p.y;
    arr[i * 3 + 2] = z2 * this.p.scale + this.p.z;
  }

  set(i: number, a: V3, b: V3 = a) {
    this.put(this.a, i, a);
    this.put(this.b, i, b);
  }
}

const add = (p: V3, q: V3): V3 => [p[0] + q[0], p[1] + q[1], p[2] + q[2]];
const lerp = (p: V3, q: V3, t: number): V3 => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t, p[2] + (q[2] - p[2]) * t];

function gauss(r: () => number, s: number): V3 {
  const g = () => Math.sqrt(-2 * Math.log(r() + 1e-9)) * Math.cos(2 * Math.PI * r());
  return [g() * s, g() * s, g() * s];
}

function pickWeighted(r: () => number, cumulative: number[]) {
  const x = r() * cumulative[cumulative.length - 1];
  let lo = 0;
  let hi = cumulative.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (cumulative[mid] < x) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

/** Hero: a spiral galaxy; data streams inward along its arms toward a bright core. */
function galaxy(w: Writer, n: number, r: () => number) {
  const ARMS = 3;
  const twist = 2.4;
  const at = (rad: number, ang: number, lift: number): V3 => [Math.cos(ang) * rad, lift, Math.sin(ang) * rad];
  for (let i = 0; i < n; i++) {
    const roll = r();
    if (roll < 0.16) {
      // bulge
      const g = gauss(r, 0.26);
      w.set(i, [g[0], g[1] * 0.5, g[2]]);
    } else if (roll < 0.86) {
      // follow the arm inward, so the stream stays on the spiral
      const arm = Math.floor(r() * ARMS);
      const rad = 0.3 + r() ** 0.85 * 2.7;
      const spread = gauss(r, 0.05 + rad * 0.035);
      const ang = (arm / ARMS) * Math.PI * 2 + rad * twist + spread[0] * 0.6;
      const inner = Math.max(0.2, rad - 0.35);
      const lift = spread[1] * 0.25;
      w.set(i, at(rad + spread[2] * 0.5, ang, lift), at(inner + spread[2] * 0.5, ang - (rad - inner) * twist, lift));
    } else {
      // faint disc dust between the arms
      const rad = 0.4 + Math.sqrt(r()) * 3.2;
      const ang = r() * Math.PI * 2;
      w.set(i, at(rad, ang, gauss(r, 0.06)[1]), at(rad, ang + 0.18, 0));
    }
  }
}

/** MOSO: a map-like city grid with three density clusters; data rises up the columns. */
function city(w: Writer, n: number, r: () => number) {
  const G = 14;
  const step = 0.38;
  const half = ((G - 1) * step) / 2;
  const peaks: V3[] = [
    [-0.9, 0, -0.6],
    [1.1, 0, 0.5],
    [-0.2, 0, 1.3],
  ];
  const cells: { x: number; z: number; h: number }[] = [];
  const cumulative: number[] = [];
  let acc = 0;
  for (let gx = 0; gx < G; gx++)
    for (let gz = 0; gz < G; gz++) {
      const x = gx * step - half;
      const z = gz * step - half;
      let h = 0.12 + r() * 0.22;
      for (const p of peaks) h += 1.5 * Math.exp(-((x - p[0]) ** 2 + (z - p[2]) ** 2) / 0.55);
      cells.push({ x, z, h });
      acc += h;
      cumulative.push(acc);
    }
  const base = -1.0;
  for (let i = 0; i < n; i++) {
    if (r() < 0.8) {
      const c = cells[pickWeighted(r, cumulative)];
      const jx = (r() - 0.5) * 0.04;
      const jz = (r() - 0.5) * 0.04;
      w.set(i, [c.x + jx, base, c.z + jz], [c.x + jx, base + c.h, c.z + jz]);
    } else {
      // street grid on the ground plane
      const along = (r() - 0.5) * 2 * half;
      const line = Math.round((r() - 0.5) * (G - 1)) * step + step / 2;
      w.set(i, r() < 0.5 ? [along, base, line] : [line, base, along]);
    }
  }
}

/** Salon CRM: a week of booking-calendar cells; booked slots glow. */
function calendar(w: Writer, n: number, r: () => number) {
  const cols = 7;
  const rows = 5;
  const cw = 0.62;
  const ch = 0.5;
  const gap = 0.09;
  const x0 = -((cols * (cw + gap)) - gap) / 2;
  const y0 = ((rows * (ch + gap)) - gap) / 2;
  const booked = new Set<number>();
  for (let k = 0; k < cols * rows; k++) if (r() < 0.38) booked.add(k);
  const bookedList = [...booked];
  for (let i = 0; i < n; i++) {
    const roll = r();
    if (roll < 0.42 || bookedList.length === 0) {
      // cell outlines
      const k = Math.floor(r() * cols * rows);
      const cx = x0 + (k % cols) * (cw + gap);
      const cy = y0 - Math.floor(k / cols) * (ch + gap);
      const t = r() * 2 * (cw + ch);
      const p: V3 =
        t < cw ? [cx + t, cy, 0] : t < cw + ch ? [cx + cw, cy - (t - cw), 0] : t < 2 * cw + ch ? [cx + cw - (t - cw - ch), cy - ch, 0] : [cx, cy - ch + (t - 2 * cw - ch), 0];
      w.set(i, p);
    } else {
      // booked cells fill with a slow shimmer
      const k = bookedList[Math.floor(r() * bookedList.length)];
      const cx = x0 + (k % cols) * (cw + gap) + r() * cw;
      const cy = y0 - Math.floor(k / cols) * (ch + gap) - r() * ch;
      w.set(i, [cx, cy, 0.04], [cx, cy - 0.05, 0.04]);
    }
  }
}

/** OKXE: a speed tunnel, particles rushing toward the viewer (faster page loads). */
function tunnel(w: Writer, n: number, r: () => number) {
  for (let i = 0; i < n; i++) {
    const th = r() * Math.PI * 2;
    const rad = 1.3 + r() * 0.9;
    const x = Math.cos(th) * rad;
    const y = Math.sin(th) * rad * 0.8;
    w.set(i, [x, y, -7], [x * 1.15, y * 1.15, 2.4]);
  }
}

/** Approach: four architecture layers with data pipes between them. */
function layers(w: Writer, n: number, r: () => number) {
  const levels = [-1.2, -0.4, 0.4, 1.2];
  const size = 2.3;
  const grid = 22;
  for (let i = 0; i < n; i++) {
    const k = Math.floor(r() * levels.length);
    if (r() < 0.74 || k === levels.length - 1) {
      const gx = (Math.floor(r() * grid) / (grid - 1) - 0.5) * size;
      const gz = (r() - 0.5) * size;
      w.set(i, r() < 0.5 ? [gx, levels[k], gz] : [gz, levels[k], gx]);
    } else {
      const px = (Math.floor(r() * 6) / 5 - 0.5) * size * 0.8;
      const pz = (Math.floor(r() * 6) / 5 - 0.5) * size * 0.8;
      const up = r() < 0.5;
      const from: V3 = [px, levels[k], pz];
      const to: V3 = [px, levels[k + 1], pz];
      w.set(i, up ? from : to, up ? to : from);
    }
  }
}

/** AI: an agent at the centre, tool nodes around it, requests and results streaming both ways. */
function agent(w: Writer, n: number, r: () => number) {
  const tools: V3[] = Array.from({ length: 6 }, (_, k) => {
    const a = (k / 6) * Math.PI * 2 + 0.3;
    return [Math.cos(a) * 2.5, Math.sin(a * 2) * 0.5, Math.sin(a) * 2.5];
  });
  const centre: V3 = [0, 0, 0];
  for (let i = 0; i < n; i++) {
    const roll = r();
    if (roll < 0.24) {
      const g = gauss(r, 1);
      const len = Math.hypot(...g) || 1;
      const rad = 0.5 + (r() - 0.5) * 0.08;
      w.set(i, [(g[0] / len) * rad, (g[1] / len) * rad, (g[2] / len) * rad]);
    } else if (roll < 0.4) {
      w.set(i, add(tools[Math.floor(r() * tools.length)], gauss(r, 0.13)));
    } else {
      const t = tools[Math.floor(r() * tools.length)];
      const j = gauss(r, 0.03);
      const out = r() < 0.5;
      w.set(i, add(out ? centre : t, j), add(out ? t : centre, j));
    }
  }
}

/** Experience: a rising helix with four milestone clusters, one per role. */
function timeline(w: Writer, n: number, r: () => number) {
  // nearly vertical, so it can run up the right edge without crossing the copy
  const S: V3 = [-0.4, -2.4, 0];
  const E: V3 = [0.4, 2.4, 0];
  const d = [E[0] - S[0], E[1] - S[1], E[2] - S[2]];
  const dl = Math.hypot(d[0], d[1], d[2]);
  const n1: V3 = [-d[1] / dl, d[0] / dl, 0];
  const n2: V3 = [0, 0, 1];
  const P = (s: number): V3 => {
    const a = s * Math.PI * 2 * 3;
    const base = lerp(S, E, s);
    return [
      base[0] + 0.55 * (Math.cos(a) * n1[0] + Math.sin(a) * n2[0]),
      base[1] + 0.55 * (Math.cos(a) * n1[1] + Math.sin(a) * n2[1]),
      base[2] + 0.55 * (Math.cos(a) * n1[2] + Math.sin(a) * n2[2]),
    ];
  };
  const milestones = [0.12, 0.38, 0.63, 0.88];
  for (let i = 0; i < n; i++) {
    if (r() < 0.7) {
      const s = r() * 0.97;
      w.set(i, P(s), P(s + 0.03));
    } else {
      w.set(i, add(P(milestones[Math.floor(r() * milestones.length)]), gauss(r, 0.15)));
    }
  }
}

/** Contact: a portal to the next universe, an accretion disc wrapped by a glowing photon ring. */
function portal(w: Writer, n: number, r: () => number) {
  const ring = (rad: number, ang: number, tilt: number): V3 => [Math.cos(ang) * rad, Math.sin(ang) * rad * tilt, Math.sin(ang) * rad * (1 - tilt)];
  for (let i = 0; i < n; i++) {
    const roll = r();
    const ang = r() * Math.PI * 2;
    if (roll < 0.6) {
      // the disc: inner orbits run faster
      const rad = 1.12 + r() ** 2.4 * 1.5;
      const step = 0.9 / rad;
      const j = gauss(r, 0.03);
      w.set(i, add([Math.cos(ang) * rad, j[1], Math.sin(ang) * rad], j), add([Math.cos(ang + step) * rad, j[1], Math.sin(ang + step) * rad], j));
    } else if (roll < 0.86) {
      // photon ring, seen face-on around the dark centre
      const rad = 1 + (r() - 0.5) * 0.06;
      w.set(i, ring(rad, ang, 1), ring(rad, ang + 0.6, 1));
    } else {
      // faint halo of escaping light
      const rad = 1.1 + r() * 2.4;
      const g = gauss(r, 0.5);
      const p: V3 = [Math.cos(ang) * rad, g[1] * 0.6, Math.sin(ang) * rad];
      w.set(i, p, [p[0] * 1.25, p[1] * 1.25, p[2] * 1.25]);
    }
  }
}

const builders: Record<SectionId, (w: Writer, n: number, r: () => number) => void> = {
  hero: galaxy,
  moso: city,
  salon: calendar,
  okxe: tunnel,
  approach: layers,
  ai: agent,
  experience: timeline,
  contact: portal,
};

const desktop: Record<SectionId, Placement> = {
  hero: { x: 2.6, y: 0.1, z: 0, scale: 1.1, rotX: 0.78, rotY: 0.3 },
  moso: { x: 2.5, y: -0.1, z: 0, scale: 1.0, rotX: 0.5, rotY: -0.6 },
  salon: { x: 2.4, y: 0.1, z: 0, scale: 1.0, rotX: 0.18, rotY: -0.45 },
  okxe: { x: 2.4, y: 0, z: 0, scale: 1.0, rotX: 0, rotY: 0 },
  approach: { x: 2.6, y: 0, z: 0, scale: 0.95, rotX: 0.38, rotY: 0.7 },
  ai: { x: 2.5, y: 0, z: 0, scale: 0.95, rotX: 0.32, rotY: 0.2 },
  experience: { x: 4.6, y: 0, z: -0.5, scale: 0.85, rotX: 0.1, rotY: -0.3 },
  // centred on the portrait card, so the photon ring frames it
  contact: { x: 3.13, y: -0.25, z: 0, scale: 1.5, rotX: 0.22, rotY: 0 },
};

export function buildFormation(id: SectionId, n: number, mobile: boolean): Formation {
  const d = desktop[id];
  // On phones the scene sits behind the copy, centred and smaller.
  const placement: Placement = mobile
    ? { ...d, x: 0, y: id === "hero" ? 1.2 : 0.4, z: -1.5, scale: d.scale * 0.62 }
    : d;
  const w = new Writer(n, placement);
  builders[id](w, n, mulberry32(0x5eed + SECTION_IDS.indexOf(id) * 977));
  return { a: w.a, b: w.b };
}
