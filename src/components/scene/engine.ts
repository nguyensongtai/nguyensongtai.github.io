import {
  AdditiveBlending,
  NormalBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  PerspectiveCamera,
  Plane,
  Points,
  Raycaster,
  Scene,
  ShaderMaterial,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
import { createCosmos, type SceneTheme } from "./cosmos";
import { buildFormation, SECTION_IDS, type Formation, type SectionId } from "./formations";

export type { SceneTheme };

export interface SceneHandle {
  setSection(id: SectionId): void;
  setTheme(theme: SceneTheme): void;
  dispose(): void;
}

/** Glowing light on dark; deep ink on light (additive blending vanishes on a pale page). */
const THEME = {
  dark: { blending: AdditiveBlending, alpha: 1 },
  light: { blending: NormalBlending, alpha: 0.6 },
} as const;

/** Every section is its own universe with its own light: [base, glow, highlight]. */
const UNIVERSES: Record<SectionId, Record<SceneTheme, readonly [string, string, string]>> = {
  hero: { dark: ["#5b45ff", "#7fc8ff", "#ffffff"], light: ["#3a1fd6", "#2f6bff", "#120a4a"] },
  moso: { dark: ["#139fc9", "#7ff5e0", "#ffffff"], light: ["#0a7891", "#0d9488", "#06323d"] },
  salon: { dark: ["#d63a8a", "#ffb0d8", "#ffffff"], light: ["#b81f6a", "#d63a8a", "#4a0a28"] },
  okxe: { dark: ["#ff6a2a", "#ffcf7a", "#ffffff"], light: ["#d24a0f", "#e07b12", "#4a1a05"] },
  approach: { dark: ["#1fbf78", "#a3f7cc", "#ffffff"], light: ["#0f8a52", "#16a34a", "#063d24"] },
  ai: { dark: ["#9a4dff", "#e29bff", "#ffffff"], light: ["#6a22d6", "#a33fe0", "#2a0a55"] },
  experience: { dark: ["#d9a521", "#ffe9a6", "#ffffff"], light: ["#a8780a", "#c98a0c", "#3d2a03"] },
  contact: { dark: ["#3e5bff", "#8fd3ff", "#ffffff"], light: ["#1f3cff", "#4d86ff", "#0b1a4a"] },
};

const vertexShader = /* glsl */ `
  attribute vec3 aFromA;
  attribute vec3 aFromB;
  attribute vec3 aToA;
  attribute vec3 aToB;
  attribute vec4 aData; // phase, speed, size, tint

  uniform float uTime;
  uniform float uMorph;
  uniform float uFromSpeed;
  uniform float uToSpeed;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform float uIntensity;
  uniform vec3 uPointer;
  uniform float uPointerStrength;

  varying float vAlpha;
  varying float vTint;

  vec3 flow(vec3 a, vec3 b, float speed) {
    return mix(a, b, fract(aData.x + uTime * aData.y * speed));
  }

  void main() {
    // stagger the morph per particle so shapes dissolve and re-form organically
    float m = smoothstep(0.0, 1.0, clamp(uMorph * 1.7 - aData.x * 0.7, 0.0, 1.0));
    vec3 p = mix(flow(aFromA, aFromB, uFromSpeed), flow(aToA, aToB, uToSpeed), m);
    float swirl = sin(m * 3.14159);
    p += swirl * vec3(sin(aData.x * 41.0), cos(aData.x * 29.0), sin(aData.x * 17.0)) * 0.7;
    p += 0.035 * vec3(
      sin(uTime * 0.6 + aData.x * 6.283 + p.y),
      cos(uTime * 0.5 + aData.x * 6.283 + p.x),
      sin(uTime * 0.4 + aData.x * 12.0));

    // the cursor gently pulls nearby particles in
    vec3 toPointer = uPointer - p;
    float dist = length(toPointer.xy);
    float pull = uPointerStrength * smoothstep(1.7, 0.0, dist);
    p += normalize(toPointer + 1e-5) * pull * 0.4;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * aData.z * uPixelRatio / -mv.z;

    float twinkle = 0.78 + 0.22 * sin(uTime * 1.6 + aData.x * 23.0);
    vAlpha = uIntensity * twinkle * (1.0 + pull * 1.6);
    vTint = aData.w;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;
  uniform float uAlpha;
  varying float vAlpha;
  varying float vTint;

  void main() {
    float r = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, r);
    a *= a;
    vec3 col = mix(uColorA, uColorB, smoothstep(0.0, 0.85, vTint));
    col = mix(col, uColorC, smoothstep(0.9, 1.0, vTint));
    gl_FragColor = vec4(col, a * vAlpha * uAlpha);
  }
`;

const INTENSITY: Record<SectionId, number> = {
  hero: 1,
  moso: 0.78,
  salon: 0.9,
  okxe: 0.9,
  approach: 0.9,
  ai: 0.9,
  experience: 0.4,
  contact: 0.8,
};
/** How fast each shape streams. The OKXE tunnel rushes. */
const SPEED: Record<SectionId, number> = {
  hero: 1,
  moso: 0.7,
  salon: 0.6,
  okxe: 3.2,
  approach: 1,
  ai: 1.3,
  experience: 1,
  contact: 0.6,
};
const MORPH_SECONDS = 2.2;
const PLANET_GAIN: Record<SectionId, number> = {
  hero: 0.9,
  moso: 0.4,
  salon: 0.4,
  okxe: 0.4,
  approach: 0.4,
  ai: 0.4,
  experience: 0.35,
  contact: 0.5,
};

function particleCount(mobile: boolean) {
  const base = mobile ? 6000 : window.innerWidth < 1280 ? 11000 : 16000;
  const cores = navigator.hardwareConcurrency || 8;
  return cores <= 4 ? Math.round(base * 0.6) : base;
}

export function createScene(
  canvas: HTMLCanvasElement,
  opts: { reduceMotion: boolean; theme: SceneTheme; onReady: () => void },
): SceneHandle | null {
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: "high-performance" });
  } catch {
    return null; // no WebGL: the CSS fallback stays visible
  }

  const mobile = window.innerWidth < 768;
  const n = particleCount(mobile);
  const dpr = () => Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 1.75);
  renderer.setPixelRatio(dpr());
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  renderer.setClearColor(0x000000, 0);

  const scene = new Scene();
  const camera = new PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 90);
  camera.position.set(0, 0, 9.5);
  let theme = opts.theme;
  const cosmos = createCosmos(scene, {
    mobile,
    theme,
    width: window.innerWidth,
    height: window.innerHeight,
    pixelRatio: dpr(),
  });

  // Formations are cheap but not free: build the first now, the rest when idle.
  const formations = new Map<SectionId, Formation>();
  const get = (id: SectionId) => {
    let f = formations.get(id);
    if (!f) {
      f = buildFormation(id, n, mobile);
      formations.set(id, f);
    }
    return f;
  };
  const hero = get("hero");

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(new Float32Array(n * 3), 3));
  const fromA = new BufferAttribute(hero.a.slice(), 3);
  const fromB = new BufferAttribute(hero.b.slice(), 3);
  const toA = new BufferAttribute(hero.a.slice(), 3);
  const toB = new BufferAttribute(hero.b.slice(), 3);
  geometry.setAttribute("aFromA", fromA);
  geometry.setAttribute("aFromB", fromB);
  geometry.setAttribute("aToA", toA);
  geometry.setAttribute("aToB", toB);
  const data = new Float32Array(n * 4);
  for (let i = 0; i < n; i++) {
    data[i * 4] = Math.random();
    data[i * 4 + 1] = 0.06 + Math.random() * 0.16;
    data[i * 4 + 2] = 0.55 + Math.random() ** 3 * 1.6;
    data[i * 4 + 3] = Math.random() < 0.08 ? 0.95 + Math.random() * 0.05 : Math.random() * 0.85;
  }
  geometry.setAttribute("aData", new BufferAttribute(data, 4));

  const uniforms = {
    uTime: { value: 0 },
    uMorph: { value: 0 },
    uFromSpeed: { value: SPEED.hero },
    uToSpeed: { value: SPEED.hero },
    uSize: { value: mobile ? 32 : 30 },
    uPixelRatio: { value: dpr() },
    uIntensity: { value: INTENSITY.hero },
    uPointer: { value: new Vector3(99, 99, 0) },
    uPointerStrength: { value: 0 },
    uColorA: { value: new Color(UNIVERSES.hero[theme][0]) },
    uColorB: { value: new Color(UNIVERSES.hero[theme][1]) },
    uColorC: { value: new Color(UNIVERSES.hero[theme][2]) },
    uAlpha: { value: THEME[theme].alpha },
  };
  const material = new ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THEME[theme].blending,
  });

  // Colours ease toward the current universe's palette.
  const palette = [new Color(), new Color(), new Color()];
  const colours = [uniforms.uColorA.value, uniforms.uColorB.value, uniforms.uColorC.value];
  const setPalette = (id: SectionId, snap: boolean) => {
    UNIVERSES[id][theme].forEach((hex, i) => {
      palette[i].set(hex);
      if (snap) colours[i].copy(palette[i]);
    });
  };
  const applyTheme = (next: SceneTheme, id: SectionId) => {
    theme = next;
    setPalette(id, true);
    uniforms.uAlpha.value = THEME[theme].alpha;
    material.blending = THEME[theme].blending;
    material.needsUpdate = true;
    cosmos.setTheme(theme);
  };
  setPalette("hero", true);
  const points = new Points(geometry, material);
  points.frustumCulled = false;
  scene.add(points);

  // ---- section morphing ----
  let current: SectionId = "hero";
  let target: SectionId = "hero";
  let morphing = false;
  let progress = 0;
  let intensityTarget = INTENSITY.hero;
  // hyperspace: 0 at rest, peaks halfway through a morph
  let warp = 0;
  let travel = 0;
  let rollDir = 1;

  const startMorph = (id: SectionId) => {
    const f = get(id);
    (toA.array as Float32Array).set(f.a);
    (toB.array as Float32Array).set(f.b);
    toA.needsUpdate = toB.needsUpdate = true;
    uniforms.uToSpeed.value = SPEED[id];
    morphing = true;
    progress = 0;
    intensityTarget = INTENSITY[id];
    setPalette(id, false);
    rollDir = Math.random() < 0.5 ? -1 : 1;
  };
  const finishMorph = () => {
    (fromA.array as Float32Array).set(toA.array as Float32Array);
    (fromB.array as Float32Array).set(toB.array as Float32Array);
    fromA.needsUpdate = fromB.needsUpdate = true;
    uniforms.uFromSpeed.value = uniforms.uToSpeed.value;
    uniforms.uMorph.value = 0;
    morphing = false;
  };

  // ---- pointer ----
  const ndc = new Vector2(10, 10);
  const smoothNdc = new Vector2();
  const centre = new Vector2();
  let lastPointer = -1e9;
  const raycaster = new Raycaster();
  const plane = new Plane(new Vector3(0, 0, 1), 0);
  const hit = new Vector3();
  const onPointerMove = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    ndc.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
    lastPointer = performance.now();
  };

  const render = () => {
    cosmos.prepare(renderer);
    renderer.render(scene, camera);
  };
  const onResize = () => {
    renderer.setPixelRatio(dpr());
    uniforms.uPixelRatio.value = dpr();
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    cosmos.resize(window.innerWidth, window.innerHeight, dpr());
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    if (opts.reduceMotion) render();
  };
  // Planets shine on the hero and while travelling, then recede behind the copy you are reading.
  let planetGain = PLANET_GAIN.hero;
  const updateCosmos = (dt: number) => {
    const target = Math.max(PLANET_GAIN[current], warp);
    planetGain = dt ? planetGain + (target - planetGain) * Math.min(1, dt * 2) : target;
    cosmos.update({ time: uniforms.uTime.value, dt, warp, travel, planets: planetGain, colorA: colours[0], colorB: colours[1] });
  };

  // ---- reduced motion: one still frame per section, no loop ----
  if (opts.reduceMotion) {
    uniforms.uTime.value = 12;
    travel = 6;
    updateCosmos(0);
    render();
    opts.onReady();
    window.addEventListener("resize", onResize);
    return {
      setSection(id) {
        if (id === current) return;
        current = id;
        startMorph(id);
        finishMorph();
        setPalette(id, true);
        uniforms.uIntensity.value = INTENSITY[id];
        updateCosmos(0);
        render();
      },
      setTheme(next) {
        applyTheme(next, current);
        updateCosmos(0);
        render();
      },
      dispose() {
        window.removeEventListener("resize", onResize);
        cosmos.dispose();
        geometry.dispose();
        material.dispose();
        renderer.dispose();
      },
    };
  }

  // Build the remaining formations in idle time so the first scroll never stalls.
  const idle: (cb: () => void) => number =
    (window as Window & { requestIdleCallback?: (cb: () => void) => number }).requestIdleCallback ??
    ((cb) => window.setTimeout(cb, 120));
  const queue = SECTION_IDS.filter((id) => id !== "hero");
  const buildNext = () => {
    const id = queue.shift();
    if (!id) return;
    get(id);
    idle(buildNext);
  };
  idle(buildNext);

  // ---- loop ----
  let raf = 0;
  let last = performance.now();
  let ready = false;
  let frames = 0;
  let slowWindow = 0;
  let quality = 1;

  const tick = (now: number) => {
    raf = requestAnimationFrame(tick);
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    uniforms.uTime.value += dt;

    if (!morphing && target !== current) {
      current = target;
      startMorph(target);
    }
    if (morphing) {
      progress = Math.min(1, progress + dt / MORPH_SECONDS);
      uniforms.uMorph.value = progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
      if (progress >= 1) finishMorph();
    }
    const warpTarget = morphing ? Math.sin(progress * Math.PI) : 0;
    warp += (warpTarget - warp) * Math.min(1, dt * 6);
    travel += dt * (0.6 + warp * 26);
    uniforms.uIntensity.value += (intensityTarget - uniforms.uIntensity.value) * Math.min(1, dt * 2.5);
    const ease = Math.min(1, dt * 1.4);
    for (let i = 0; i < 3; i++) colours[i].lerp(palette[i], ease);

    // camera parallax + pointer pull
    const active = now - lastPointer < 2500;
    smoothNdc.lerp(active ? ndc : centre, Math.min(1, dt * 2.2));
    camera.position.x = smoothNdc.x * 0.45;
    camera.position.y = smoothNdc.y * 0.3;
    camera.position.z = 9.5 + Math.sin(uniforms.uTime.value * 0.12) * 0.25;
    // punch the field of view and roll a little while jumping between universes
    const roll = warp * 0.09 * rollDir;
    camera.up.set(Math.sin(roll), Math.cos(roll), 0);
    camera.lookAt(0, 0, 0);
    camera.fov = 42 + warp * 12;
    camera.updateProjectionMatrix();
    cosmos.setOffset(smoothNdc.x * 0.08, smoothNdc.y * 0.05);
    uniforms.uPointerStrength.value += ((active ? 1 : 0) - uniforms.uPointerStrength.value) * Math.min(1, dt * 3);
    if (active) {
      raycaster.setFromCamera(ndc, camera);
      if (raycaster.ray.intersectPlane(plane, hit)) uniforms.uPointer.value.copy(hit);
    }

    updateCosmos(dt);
    render();
    if (!ready) {
      ready = true;
      opts.onReady();
    }

    // Adaptive quality: if we can't hold ~35fps, draw fewer particles.
    frames++;
    slowWindow += dt > 1 / 35 ? 1 : 0;
    if (frames === 90) {
      if (slowWindow > 45 && quality > 0.4) {
        quality = Math.max(0.4, quality - 0.3);
        geometry.setDrawRange(0, Math.floor(n * quality));
        cosmos.setQuality(quality);
      }
      frames = 0;
      slowWindow = 0;
    }
  };

  const onVisibility = () => {
    cancelAnimationFrame(raf);
    if (!document.hidden) {
      last = performance.now();
      raf = requestAnimationFrame(tick);
    }
  };

  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("resize", onResize);
  document.addEventListener("visibilitychange", onVisibility);
  raf = requestAnimationFrame(tick);

  return {
    setSection(id) {
      target = id;
    },
    setTheme(next) {
      applyTheme(next, current);
    },
    dispose() {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      cosmos.dispose();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    },
  };
}
