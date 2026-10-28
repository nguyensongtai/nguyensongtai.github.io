import { Vector3 } from "three";

/**
 * The road is a function of depth: it winds left and right as it heads into
 * the distance and climbs to a summit at the end. Everything else in the world
 * (terrain, stops, camera) is laid out against it.
 */
export const ROAD_LENGTH = 600;
export const SUMMIT_Z = -ROAD_LENGTH;
export const CITY = { x: 70, z: -760, radius: 150 };

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export const roadX = (z: number) => 20 * Math.sin(z * 0.012) + 7 * Math.sin(z * 0.031 + 1.3);
/** Gentle undulation, then a long climb to the summit. */
export const roadY = (z: number) => 1.5 * Math.sin(z * 0.02) + 52 * smooth(430, 590, -z);

/** s ∈ [0, 1] from the start of the road to the summit. */
export function roadPoint(s: number, out = new Vector3()) {
  const z = -s * ROAD_LENGTH;
  return out.set(roadX(z), roadY(z), z);
}

export function roadFrame(s: number) {
  const p = roadPoint(s);
  const q = roadPoint(Math.min(1, s + 0.002));
  if (s >= 0.998) q.copy(p).add(roadPoint(s).sub(roadPoint(s - 0.002)));
  const tangent = q.sub(p).normalize();
  const side = new Vector3(-tangent.z, 0, tangent.x).normalize(); // to the right of travel
  return { p, tangent, side };
}

/** Where the five career stops sit along the road (0 = start, 1 = summit). */
export const STOPS = {
  start: 0.015,
  room: 0.15,
  town: 0.33,
  workshop: 0.5,
  city: 0.67,
  summit: 0.985,
} as const;

// ---- value noise, deterministic so the world is identical on every visit ----
function hash(x: number, y: number) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}
function noise(x: number, y: number) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  const a = hash(ix, iy);
  const b = hash(ix + 1, iy);
  const c = hash(ix, iy + 1);
  const d = hash(ix + 1, iy + 1);
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}
export function fbm(x: number, y: number, octaves = 4) {
  let v = 0;
  let a = 0.5;
  for (let i = 0; i < octaves; i++) {
    v += a * noise(x, y);
    x = x * 2.03 + 17.1;
    y = y * 2.03 + 9.2;
    a *= 0.5;
  }
  return v;
}
function ridged(x: number, y: number) {
  let v = 0;
  let a = 0.55;
  for (let i = 0; i < 4; i++) {
    v += a * (1 - Math.abs(noise(x, y) * 2 - 1)) ** 2;
    x *= 2.1;
    y *= 2.1;
    a *= 0.5;
  }
  return v;
}

/** Level pads where a stop's diorama stands, so no hillside hides it from the road. */
let pads: { x: number; z: number; y: number; r: number }[] | null = null;
function stopPads() {
  if (!pads)
    pads = [
      { s: STOPS.room, offset: 9, r: 10 },
      { s: STOPS.workshop, offset: -11, r: 10 },
      { s: STOPS.city, offset: -18, r: 26 },
    ].map(({ s, offset, r }) => {
      const { p, side } = roadFrame(s);
      return { x: p.x + side.x * offset, z: p.z + side.z * offset, y: p.y - 0.5, r };
    });
  return pads;
}

/** Terrain height: hills and ranges away from the road, flat valley around the city. */
export function terrainHeight(x: number, z: number) {
  const rx = roadX(z);
  // past the summit the ridge drops away toward the city valley
  const ry = roadY(z) - Math.max(0, -z - ROAD_LENGTH - 6) * 0.9;
  const d = Math.abs(x - rx);
  const hills = (fbm(x * 0.018, z * 0.018) - 0.45) * 16 + 2;
  const mountains = ridged(x * 0.007 + 3, z * 0.007) ** 1.5 * 95 * smooth(30, 150, d);
  let far = hills + mountains;
  // near the summit the land falls away from the ridge the road climbs
  const climb = smooth(430, 520, -z);
  far = far * (1 - climb * 0.6) + climb * (ry - d * 0.35 + hills * 0.4);
  let h = ry - 0.55 + (far - (ry - 0.55)) * smooth(5, 18, d);
  // the city sits in a wide valley beyond the summit
  const valley = smooth(640, 700, -z) * (1 - smooth(CITY.radius * 0.8, CITY.radius * 1.4, Math.hypot(x - CITY.x, (z - CITY.z) * 0.8)));
  h = h * (1 - valley) - 1.5 * valley;
  for (const pad of stopPads()) {
    const w = 1 - smooth(pad.r * 0.6, pad.r * 1.4, Math.hypot(x - pad.x, z - pad.z));
    if (w > 0) h = h * (1 - w) + pad.y * w;
  }
  return h;
}
