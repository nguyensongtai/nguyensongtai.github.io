import { createPlanets } from "./planets";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  LineSegments,
  Mesh,
  NoBlending,
  NormalBlending,
  OrthographicCamera,
  PlaneGeometry,
  Points,
  Scene,
  ShaderMaterial,
  Vector2,
  WebGLRenderTarget,
  type WebGLRenderer,
} from "three";

export type SceneTheme = "dark" | "light";

/**
 * The backdrop that makes the scene read as a multiverse: a drifting nebula,
 * a deep starfield that streaks into hyperspace while travelling between
 * sections, and the planets of the solar system drifting past.
 */
export interface Cosmos {
  update(f: { time: number; dt: number; warp: number; travel: number; planets: number; colorA: Color; colorB: Color }): void;
  /** Render the nebula into its low-res target; call before rendering the main scene. */
  prepare(renderer: WebGLRenderer): void;
  setTheme(theme: SceneTheme): void;
  setOffset(x: number, y: number): void;
  resize(width: number, height: number, pixelRatio: number): void;
  setQuality(q: number): void;
  dispose(): void;
}

const noise = /* glsl */ `
  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p = m * p;
      a *= 0.5;
    }
    return v;
  }
`;

const nebulaFragment = /* glsl */ `
  uniform float uTime;
  uniform float uWarp;
  uniform float uTravel;
  uniform float uAspect;
  uniform vec2 uFocus;
  uniform vec2 uOffset;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  varying vec2 vUv;
  ${noise}
  void main() {
    vec2 c = (vUv - uFocus) * vec2(uAspect, 1.0);
    c *= 1.0 - uWarp * 0.3;
    vec2 p = c * 1.5 + uOffset + vec2(uTravel * 0.004, 0.0);
    float t = uTime * 0.02;
    vec2 q = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(5.2, 1.3) - t));
    float f = fbm(p * 1.1 + q * 2.0 + vec2(t * 0.5, 0.0));
    float density = smoothstep(0.38, 0.88, f) * (0.3 + 0.95 * exp(-dot(c, c) * 1.3));
    float filament = smoothstep(0.56, 0.62, f) * smoothstep(0.7, 0.62, f);
    vec3 col = mix(uColorA, uColorB, smoothstep(0.3, 0.75, q.y)) + uColorB * filament * 0.35;
    gl_FragColor = vec4(col, clamp(density * (1.0 + uWarp * 0.7), 0.0, 1.0));
  }
`;

const fullscreenVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const compositeFragment = /* glsl */ `
  uniform sampler2D uTex;
  uniform float uGain;
  varying vec2 vUv;
  void main() {
    vec4 t = texture2D(uTex, vUv);
    // dither so the upscaled 8-bit gradient never bands
    float d = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5;
    gl_FragColor = vec4(t.rgb, max(t.a * uGain + d / 255.0, 0.0));
  }
`;

// Stars live in a 70-unit-deep slab that wraps, so travelling never runs out of space.
const starVertex = /* glsl */ `
  attribute vec2 aStar; // size, phase
  attribute float aEnd; // 0 = head, 1 = tail (streaks only)
  uniform float uTime;
  uniform float uTravel;
  uniform float uWarp;
  uniform float uPixelRatio;
  varying float vAlpha;
  void main() {
    vec3 p = position;
    p.z = mod(p.z + uTravel, 70.0) - 64.0;
    p.z -= aEnd * uWarp * (2.0 + 9.0 * aStar.x);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = max(1.0, aStar.x * uPixelRatio * 55.0 / -mv.z);
    float fade = smoothstep(-64.0, -42.0, p.z) * smoothstep(8.0, 2.0, p.z);
    vAlpha = fade * (0.55 + 0.45 * sin(uTime * 1.3 + aStar.y * 40.0)) * mix(1.0, 1.0 - aEnd, 0.85);
  }
`;

const starFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uAlpha;
  uniform float uRound;
  varying float vAlpha;
  void main() {
    float a = mix(1.0, smoothstep(0.5, 0.1, length(gl_PointCoord - 0.5)), uRound);
    gl_FragColor = vec4(uColor, a * vAlpha * uAlpha);
  }
`;

const THEMES = {
  dark: { blending: AdditiveBlending, nebula: 0.72, star: "#dfe6ff", starAlpha: 0.95, round: 1 },
  // On a pale page additive light vanishes, so everything turns to faint ink.
  light: { blending: NormalBlending, nebula: 0.24, star: "#1b2340", starAlpha: 0.4, round: 1 },
} as const;

export function createCosmos(
  scene: Scene,
  opts: { mobile: boolean; theme: SceneTheme; width: number; height: number; pixelRatio: number },
): Cosmos {
  // ---- nebula: drawn at quarter resolution, then upscaled (it is all low frequency) ----
  const rtSize = (w: number, h: number) => [Math.max(64, Math.round(w / 4)), Math.max(64, Math.round(h / 4))] as const;
  const target = new WebGLRenderTarget(...rtSize(opts.width, opts.height), { depthBuffer: false });
  const nebulaScene = new Scene();
  const ortho = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const quad = new PlaneGeometry(2, 2);
  const nebulaUniforms = {
    uTime: { value: 0 },
    uWarp: { value: 0 },
    uTravel: { value: 0 },
    uAspect: { value: opts.width / opts.height },
    uFocus: { value: opts.mobile ? new Vector2(0.5, 0.62) : new Vector2(0.7, 0.5) },
    uOffset: { value: new Vector2() },
    uColorA: { value: new Color() },
    uColorB: { value: new Color() },
  };
  const nebulaMaterial = new ShaderMaterial({
    vertexShader: fullscreenVertex,
    fragmentShader: nebulaFragment,
    uniforms: nebulaUniforms,
    blending: NoBlending,
    depthTest: false,
    depthWrite: false,
  });
  nebulaScene.add(new Mesh(quad, nebulaMaterial));

  const compositeMaterial = new ShaderMaterial({
    vertexShader: fullscreenVertex,
    fragmentShader: compositeFragment,
    uniforms: { uTex: { value: target.texture }, uGain: { value: THEMES[opts.theme].nebula } },
    transparent: true,
    depthTest: false,
    depthWrite: false,
    blending: THEMES[opts.theme].blending,
  });
  const backdrop = new Mesh(quad, compositeMaterial);
  backdrop.frustumCulled = false;
  backdrop.renderOrder = -10;
  scene.add(backdrop);

  // ---- starfield + hyperspace streaks (same stars, drawn as lines while warping) ----
  const starCount = opts.mobile ? 1000 : 2400;
  const starPos = new Float32Array(starCount * 3);
  const starData = new Float32Array(starCount * 2);
  for (let i = 0; i < starCount; i++) {
    const th = Math.random() * Math.PI * 2;
    const rad = 1.5 + Math.sqrt(Math.random()) * 34;
    starPos[i * 3] = Math.cos(th) * rad;
    starPos[i * 3 + 1] = Math.sin(th) * rad * 0.7;
    starPos[i * 3 + 2] = Math.random() * 70;
    starData[i * 2] = 0.6 + Math.random() ** 4 * 1.8;
    starData[i * 2 + 1] = Math.random();
  }
  const starUniforms = {
    uTime: { value: 0 },
    uTravel: { value: 0 },
    uWarp: { value: 0 },
    uPixelRatio: { value: opts.pixelRatio },
    uColor: { value: new Color(THEMES[opts.theme].star) },
    uAlpha: { value: THEMES[opts.theme].starAlpha },
    uRound: { value: 1 },
  };
  const starGeometry = new BufferGeometry();
  starGeometry.setAttribute("position", new BufferAttribute(starPos, 3));
  starGeometry.setAttribute("aStar", new BufferAttribute(starData, 2));
  starGeometry.setAttribute("aEnd", new BufferAttribute(new Float32Array(starCount), 1));
  const starMaterial = new ShaderMaterial({
    vertexShader: starVertex,
    fragmentShader: starFragment,
    uniforms: starUniforms,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    blending: THEMES[opts.theme].blending,
  });
  const stars = new Points(starGeometry, starMaterial);
  stars.frustumCulled = false;
  stars.renderOrder = -4;
  scene.add(stars);

  const streakPos = new Float32Array(starCount * 6);
  const streakData = new Float32Array(starCount * 4);
  const streakEnd = new Float32Array(starCount * 2);
  for (let i = 0; i < starCount; i++) {
    for (let k = 0; k < 2; k++) {
      const v = i * 2 + k;
      streakPos.set(starPos.subarray(i * 3, i * 3 + 3), v * 3);
      streakData.set(starData.subarray(i * 2, i * 2 + 2), v * 2);
      streakEnd[v] = k;
    }
  }
  const streakGeometry = new BufferGeometry();
  streakGeometry.setAttribute("position", new BufferAttribute(streakPos, 3));
  streakGeometry.setAttribute("aStar", new BufferAttribute(streakData, 2));
  streakGeometry.setAttribute("aEnd", new BufferAttribute(streakEnd, 1));
  const streakMaterial = starMaterial.clone();
  streakMaterial.uniforms = { ...starUniforms, uRound: { value: 0 } };
  const streaks = new LineSegments(streakGeometry, streakMaterial);
  streaks.frustumCulled = false;
  streaks.renderOrder = -3;
  streaks.visible = false;
  scene.add(streaks);

  // ---- the solar system ----
  const planets = createPlanets(scene, { mobile: opts.mobile, theme: opts.theme });

  return {
    update({ time, warp, travel, planets: planetGain, colorA, colorB }) {
      nebulaUniforms.uTime.value = time;
      nebulaUniforms.uWarp.value = warp;
      nebulaUniforms.uTravel.value = travel;
      nebulaUniforms.uColorA.value.copy(colorA);
      nebulaUniforms.uColorB.value.copy(colorB);
      starUniforms.uTime.value = time;
      starUniforms.uTravel.value = travel;
      starUniforms.uWarp.value = warp;
      streaks.visible = warp > 0.02;
      planets.update(time, travel, planetGain);
    },
    prepare(renderer) {
      renderer.setRenderTarget(target);
      renderer.render(nebulaScene, ortho);
      renderer.setRenderTarget(null);
    },
    setTheme(theme) {
      const t = THEMES[theme];
      compositeMaterial.uniforms.uGain.value = t.nebula;
      starUniforms.uColor.value.set(t.star);
      starUniforms.uAlpha.value = t.starAlpha;
      planets.setTheme(theme);
      for (const m of [compositeMaterial, starMaterial, streakMaterial]) {
        m.blending = t.blending;
        m.needsUpdate = true;
      }
    },
    setOffset(x, y) {
      nebulaUniforms.uOffset.value.set(x, y);
    },
    resize(width, height, pixelRatio) {
      target.setSize(...rtSize(width, height));
      nebulaUniforms.uAspect.value = width / height;
      starUniforms.uPixelRatio.value = pixelRatio;
    },
    setQuality(q) {
      const visible = Math.floor(starCount * q);
      starGeometry.setDrawRange(0, visible);
      streakGeometry.setDrawRange(0, visible * 2);
    },
    dispose() {
      target.dispose();
      quad.dispose();
      planets.dispose();
      starGeometry.dispose();
      streakGeometry.dispose();
      for (const m of [nebulaMaterial, compositeMaterial, starMaterial, streakMaterial]) m.dispose();
    },
  };
}
