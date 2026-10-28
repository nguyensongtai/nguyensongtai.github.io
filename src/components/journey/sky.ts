import {
  BackSide,
  BufferAttribute,
  BufferGeometry,
  Color,
  Mesh,
  Points,
  ShaderMaterial,
  SphereGeometry,
  Vector3,
  AdditiveBlending,
} from "three";

/**
 * Time of day carries the story: night in the first room, blue hour while
 * building, sunrise at the summit. `tod` runs 0 (night) → 1 (morning).
 */
interface Key {
  tod: number;
  top: string;
  horizon: string;
  fog: string;
  glow: string;
  sun: string;
  sunI: number;
  sky: string;
  ground: string;
  hemiI: number;
  stars: number;
  elevation: number;
  exposure: number;
}

const KEYS: Key[] = [
  { tod: 0, top: "#060a24", horizon: "#2b2763", fog: "#141a42", glow: "#5b4cae", sun: "#aab8ff", sunI: 0.65, sky: "#5b68bd", ground: "#151a2e", hemiI: 1.25, stars: 1, elevation: 0.45, exposure: 1.02 },
  { tod: 0.3, top: "#0c1544", horizon: "#4d4196", fog: "#2b2a66", glow: "#8d62cc", sun: "#b9c3ff", sunI: 0.8, sky: "#6f79c8", ground: "#1f2238", hemiI: 1.2, stars: 0.6, elevation: 0.06, exposure: 1.05 },
  { tod: 0.55, top: "#1a2a70", horizon: "#ff9862", fog: "#6c5c9e", glow: "#ffa357", sun: "#ffbf7c", sunI: 1.35, sky: "#9b91d4", ground: "#3b3042", hemiI: 1.15, stars: 0.15, elevation: 0.03, exposure: 1.12 },
  { tod: 0.8, top: "#2a4aaa", horizon: "#ffc47e", fog: "#c8a0bd", glow: "#ffcd78", sun: "#ffe1b2", sunI: 1.8, sky: "#b9c6f2", ground: "#5a4a48", hemiI: 1.1, stars: 0, elevation: 0.1, exposure: 1.08 },
  { tod: 1, top: "#2c78e2", horizon: "#cfe7ff", fog: "#b7d1f2", glow: "#fff1cc", sun: "#fff6e8", sunI: 1.8, sky: "#c9dbff", ground: "#5f5e4c", hemiI: 1.0, stars: 0, elevation: 0.62, exposure: 1.0 },
];

const COLOR_KEYS = ["top", "horizon", "fog", "glow", "sun", "sky", "ground"] as const;
const parsed = KEYS.map((k) => ({
  ...k,
  colors: Object.fromEntries(COLOR_KEYS.map((c) => [c, new Color(k[c])])) as Record<(typeof COLOR_KEYS)[number], Color>,
}));

export interface Atmosphere {
  top: Color;
  horizon: Color;
  fog: Color;
  glow: Color;
  sun: Color;
  sky: Color;
  ground: Color;
  sunI: number;
  hemiI: number;
  stars: number;
  elevation: number;
  exposure: number;
}

export function createAtmosphere(): Atmosphere {
  return {
    top: new Color(),
    horizon: new Color(),
    fog: new Color(),
    glow: new Color(),
    sun: new Color(),
    sky: new Color(),
    ground: new Color(),
    sunI: 0,
    hemiI: 0,
    stars: 0,
    elevation: 0,
    exposure: 1,
  };
}

export function sampleAtmosphere(tod: number, out: Atmosphere) {
  const t = Math.min(1, Math.max(0, tod));
  let i = 0;
  while (i < parsed.length - 2 && t > parsed[i + 1].tod) i++;
  const a = parsed[i];
  const b = parsed[i + 1];
  const f = (t - a.tod) / (b.tod - a.tod);
  for (const c of COLOR_KEYS) out[c].copy(a.colors[c]).lerp(b.colors[c], f);
  out.sunI = a.sunI + (b.sunI - a.sunI) * f;
  out.hemiI = a.hemiI + (b.hemiI - a.hemiI) * f;
  out.stars = a.stars + (b.stars - a.stars) * f;
  out.elevation = a.elevation + (b.elevation - a.elevation) * f;
  out.exposure = a.exposure + (b.exposure - a.exposure) * f;
  return out;
}

const skyVertex = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = position;
    vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    gl_Position = p.xyww; // always at the far plane
  }
`;
const skyFragment = /* glsl */ `
  uniform vec3 uTop;
  uniform vec3 uHorizon;
  uniform vec3 uGlow;
  uniform vec3 uSun;
  uniform vec3 uSunDir;
  uniform float uDisk;
  varying vec3 vDir;
  void main() {
    vec3 d = normalize(vDir);
    float h = d.y;
    vec3 col = mix(uHorizon, uTop, smoothstep(-0.02, 0.5, h));
    col = mix(col, uHorizon * 0.55, smoothstep(0.0, -0.25, h));
    float s = max(dot(d, normalize(uSunDir)), 0.0);
    col += uGlow * (pow(s, 5.0) * 0.55 + pow(s, 48.0) * 0.6);
    col += uSun * smoothstep(0.9990, 0.9995, s) * uDisk;
    gl_FragColor = vec4(col, 1.0);
  }
`;

const starVertex = /* glsl */ `
  attribute float aSize;
  uniform float uPixelRatio;
  varying float vTw;
  void main() {
    vTw = fract(aSize * 17.0);
    vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    gl_Position = p.xyww;
    gl_PointSize = aSize * uPixelRatio;
  }
`;
const starFragment = /* glsl */ `
  uniform float uAlpha;
  uniform float uTime;
  varying float vTw;
  void main() {
    float a = smoothstep(0.5, 0.0, length(gl_PointCoord - 0.5));
    gl_FragColor = vec4(vec3(0.85, 0.9, 1.0), a * uAlpha * (0.7 + 0.3 * sin(uTime * 1.5 + vTw * 40.0)));
  }
`;

export function createSky(pixelRatio: number, starCount: number) {
  const uniforms = {
    uTop: { value: new Color() },
    uHorizon: { value: new Color() },
    uGlow: { value: new Color() },
    uSun: { value: new Color() },
    uSunDir: { value: new Vector3(0, 0.1, -1) },
    uDisk: { value: 0 },
  };
  const geometry = new SphereGeometry(1000, 32, 16);
  const material = new ShaderMaterial({
    vertexShader: skyVertex,
    fragmentShader: skyFragment,
    uniforms,
    side: BackSide,
    depthWrite: false,
  });
  const dome = new Mesh(geometry, material);
  dome.frustumCulled = false;
  dome.renderOrder = -100;

  const pos = new Float32Array(starCount * 3);
  const size = new Float32Array(starCount);
  for (let i = 0; i < starCount; i++) {
    const th = Math.random() * Math.PI * 2;
    const y = 0.05 + Math.random() ** 0.7 * 0.95;
    const r = Math.sqrt(1 - y * y);
    pos.set([Math.cos(th) * r * 900, y * 900, Math.sin(th) * r * 900], i * 3);
    size[i] = 0.8 + Math.random() ** 3 * 2.2;
  }
  const starGeometry = new BufferGeometry();
  starGeometry.setAttribute("position", new BufferAttribute(pos, 3));
  starGeometry.setAttribute("aSize", new BufferAttribute(size, 1));
  const starUniforms = { uAlpha: { value: 1 }, uTime: { value: 0 }, uPixelRatio: { value: pixelRatio } };
  const starMaterial = new ShaderMaterial({
    vertexShader: starVertex,
    fragmentShader: starFragment,
    uniforms: starUniforms,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  });
  const stars = new Points(starGeometry, starMaterial);
  stars.frustumCulled = false;
  stars.renderOrder = -99;

  return {
    dome,
    stars,
    sunDir: uniforms.uSunDir.value,
    apply(a: Atmosphere, time: number) {
      uniforms.uTop.value.copy(a.top);
      uniforms.uHorizon.value.copy(a.horizon);
      uniforms.uGlow.value.copy(a.glow);
      uniforms.uSun.value.copy(a.sun);
      uniforms.uDisk.value = Math.min(1, a.sunI) * (a.stars < 0.3 ? 1 : 0);
      starUniforms.uAlpha.value = a.stars;
      starUniforms.uTime.value = time;
      stars.visible = a.stars > 0.01;
    },
    setPixelRatio(pr: number) {
      starUniforms.uPixelRatio.value = pr;
    },
    /** Keep the dome centred on the camera so it never gets closer. */
    follow(p: Vector3) {
      dome.position.copy(p);
      stars.position.copy(p);
    },
    dispose() {
      geometry.dispose();
      material.dispose();
      starGeometry.dispose();
      starMaterial.dispose();
    },
  };
}
