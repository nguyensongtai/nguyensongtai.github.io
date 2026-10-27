import {
  DoubleSide,
  Group,
  Mesh,
  NormalBlending,
  RingGeometry,
  ShaderMaterial,
  SphereGeometry,
  Vector3,
  type Scene,
} from "three";
import type { SceneTheme } from "./cosmos";

/**
 * The eight planets of the solar system, drifting past as you travel through
 * the page. Surfaces are procedural (3D noise in the shader), so there are no
 * textures to download.
 */
export interface Planets {
  /** `gain` dims the whole system (1 = full). */
  update(time: number, travel: number, gain: number): void;
  setTheme(theme: SceneTheme): void;
  dispose(): void;
}

const planetVertex = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  varying vec3 vLocal;
  void main() {
    vLocal = position;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

const planetFragment = /* glsl */ `
  uniform int uKind;
  uniform float uTime;
  uniform float uOpacity;
  uniform float uAmbient;
  uniform vec3 uSun;
  varying vec3 vNormal;
  varying vec3 vView;
  varying vec3 vLocal;

  float hash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }
  float noise(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash(i), hash(i + vec3(1, 0, 0)), f.x), mix(hash(i + vec3(0, 1, 0)), hash(i + vec3(1, 1, 0)), f.x), f.y),
      mix(mix(hash(i + vec3(0, 0, 1)), hash(i + vec3(1, 0, 1)), f.x), mix(hash(i + vec3(0, 1, 1)), hash(i + vec3(1, 1, 1)), f.x), f.y),
      f.z);
  }
  float fbm(vec3 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p = p * 2.03 + 17.1;
      a *= 0.5;
    }
    return v;
  }
  float bands(float lat, float freq, float warp) {
    return 0.5 + 0.5 * sin(lat * freq + warp);
  }

  void main() {
    vec3 p = normalize(vLocal);
    vec3 col;
    vec3 atmo = vec3(0.0);
    float atmoStrength = 0.0;

    if (uKind == 0) { // Mercury: grey, cratered
      float f = fbm(p * 5.0);
      float craters = smoothstep(0.62, 0.7, noise(p * 14.0)) * 0.25;
      col = mix(vec3(0.33, 0.31, 0.3), vec3(0.68, 0.65, 0.6), f) - craters;
    } else if (uKind == 1) { // Venus: thick sulphur clouds
      float f = fbm(p * vec3(2.0, 6.0, 2.0) + vec3(uTime * 0.02, 0.0, 0.0));
      col = mix(vec3(0.82, 0.66, 0.4), vec3(0.98, 0.9, 0.7), f);
      atmo = vec3(1.0, 0.85, 0.55); atmoStrength = 0.6;
    } else if (uKind == 2) { // Earth: oceans, continents, ice caps, clouds
      float h = fbm(p * 2.2 + 3.0);
      float land = smoothstep(0.5, 0.53, h);
      vec3 ocean = mix(vec3(0.02, 0.1, 0.32), vec3(0.05, 0.28, 0.55), smoothstep(0.3, 0.5, h));
      vec3 ground = mix(vec3(0.16, 0.36, 0.12), vec3(0.55, 0.45, 0.26), smoothstep(0.55, 0.7, h));
      col = mix(ocean, ground, land);
      col = mix(col, vec3(0.95), smoothstep(0.8, 0.88, abs(p.y) + h * 0.12));
      float clouds = smoothstep(0.52, 0.75, fbm(p * 3.5 + vec3(uTime * 0.015, 0.0, 0.0)));
      col = mix(col, vec3(1.0), clouds * 0.8);
      atmo = vec3(0.35, 0.62, 1.0); atmoStrength = 1.1;
    } else if (uKind == 3) { // Mars: rust, dark plains, polar cap
      float f = fbm(p * 3.0);
      col = mix(vec3(0.5, 0.18, 0.08), vec3(0.8, 0.42, 0.22), f);
      col *= 0.75 + 0.25 * smoothstep(0.35, 0.55, fbm(p * 1.6 + 9.0));
      col = mix(col, vec3(0.95, 0.92, 0.9), smoothstep(0.9, 0.94, p.y));
      atmo = vec3(1.0, 0.55, 0.35); atmoStrength = 0.35;
    } else if (uKind == 4) { // Jupiter: belts, zones and the Great Red Spot
      float w = fbm(p * vec3(3.0, 9.0, 3.0)) * 2.4;
      float b = bands(p.y, 22.0, w);
      col = mix(vec3(0.58, 0.4, 0.27), vec3(0.92, 0.84, 0.7), b);
      col = mix(col, vec3(0.42, 0.28, 0.2), smoothstep(0.7, 0.95, bands(p.y, 9.0, w * 0.5)) * 0.4);
      vec3 spot = normalize(vec3(0.75, -0.36, 0.55));
      float s = length((p - spot) * vec3(1.0, 2.2, 1.0));
      col = mix(col, vec3(0.78, 0.34, 0.2), smoothstep(0.2, 0.1, s));
    } else if (uKind == 5) { // Saturn: soft golden bands
      float w = fbm(p * vec3(2.0, 7.0, 2.0)) * 1.4;
      col = mix(vec3(0.72, 0.6, 0.4), vec3(0.94, 0.85, 0.62), bands(p.y, 16.0, w));
    } else if (uKind == 6) { // Uranus: pale cyan, almost featureless
      col = mix(vec3(0.55, 0.82, 0.86), vec3(0.68, 0.9, 0.92), bands(p.y, 8.0, fbm(p * 2.0)));
      atmo = vec3(0.6, 0.95, 1.0); atmoStrength = 0.7;
    } else { // Neptune: deep blue with a dark storm
      float w = fbm(p * vec3(2.0, 6.0, 2.0)) * 1.8;
      col = mix(vec3(0.12, 0.24, 0.7), vec3(0.28, 0.45, 0.92), bands(p.y, 12.0, w));
      vec3 spot = normalize(vec3(-0.5, -0.3, 0.8));
      col *= 1.0 - smoothstep(0.22, 0.12, length((p - spot) * vec3(1.0, 1.8, 1.0))) * 0.45;
      atmo = vec3(0.35, 0.55, 1.0); atmoStrength = 0.8;
    }

    vec3 n = normalize(vNormal);
    float ndl = dot(n, normalize(uSun));
    float light = smoothstep(-0.12, 0.65, ndl);
    float rim = pow(1.0 - max(dot(n, normalize(vView)), 0.0), 3.0);
    col = col * (light * 0.9 + uAmbient) + atmo * rim * atmoStrength * (0.25 + light);
    gl_FragColor = vec4(col, uOpacity);
  }
`;

const ringVertex = /* glsl */ `
  varying float vR;
  void main() {
    vR = length(position.xy);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Saturn's rings, with the Cassini division as a dark gap.
const ringFragment = /* glsl */ `
  uniform float uOpacity;
  uniform float uAmbient;
  varying float vR;
  void main() {
    float t = (vR - 1.3) / 0.95;
    float grain = 0.65 + 0.35 * sin(vR * 90.0) * sin(vR * 37.0);
    float cassini = 1.0 - smoothstep(0.012, 0.0, abs(t - 0.68) - 0.03) * 0.9;
    float edge = smoothstep(0.0, 0.08, t) * smoothstep(1.0, 0.9, t);
    vec3 col = mix(vec3(0.62, 0.52, 0.36), vec3(0.92, 0.84, 0.66), t) * (0.75 + uAmbient);
    gl_FragColor = vec4(col, grain * cassini * edge * 0.85 * uOpacity);
  }
`;

const KIND = { mercury: 0, venus: 1, earth: 2, mars: 3, jupiter: 4, saturn: 5, uranus: 6, neptune: 7 } as const;

/** Sizes are stylised (true scale would make Mercury a speck next to Jupiter). */
const PLANETS: {
  kind: keyof typeof KIND;
  x: number;
  y: number;
  z0: number;
  s: number;
  tilt: number;
  spin: number;
}[] = [
  { kind: "earth", x: -8.5, y: 4.2, z0: 4, s: 1.05, tilt: 0.41, spin: 0.12 },
  { kind: "saturn", x: 10, y: -4.2, z0: 11, s: 1.35, tilt: 0.47, spin: 0.2 },
  { kind: "mars", x: 3.5, y: 6.2, z0: 17, s: 0.8, tilt: 0.44, spin: 0.12 },
  { kind: "mercury", x: -13, y: 6.5, z0: 21, s: 0.6, tilt: 0.0, spin: 0.04 },
  { kind: "jupiter", x: -12, y: -5.5, z0: 25, s: 2.0, tilt: 0.05, spin: 0.25 },
  { kind: "neptune", x: 12.5, y: 5, z0: 30, s: 1.15, tilt: 0.49, spin: 0.16 },
  { kind: "venus", x: -4.5, y: -8, z0: 36, s: 0.95, tilt: 0.05, spin: -0.03 },
  { kind: "uranus", x: 9, y: 2.6, z0: 42, s: 1.05, tilt: 1.7, spin: 0.14 },
];
const SPAN = 46;

const THEMES = {
  // on a pale page the night side would be a dark hole, so it is lifted
  dark: { opacity: 0.92, ambient: 0.03 },
  light: { opacity: 0.7, ambient: 0.42 },
} as const;

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export function createPlanets(scene: Scene, opts: { mobile: boolean; theme: SceneTheme }): Planets {
  // Side light from an off-screen sun: most of each disc stays in shadow, so text over it stays legible.
  const sun = new Vector3(1, 0.3, 0.2).normalize();
  const sphere = new SphereGeometry(1, 48, 32);
  const ringGeometry = new RingGeometry(1.3, 2.25, 128, 1);
  const materials: ShaderMaterial[] = [];
  let themeOpacity: number = THEMES[opts.theme].opacity;

  const planetMaterial = (kind: number) => {
    const m = new ShaderMaterial({
      vertexShader: planetVertex,
      fragmentShader: planetFragment,
      uniforms: {
        uKind: { value: kind },
        uTime: { value: 0 },
        uOpacity: { value: 0 },
        uAmbient: { value: THEMES[opts.theme].ambient },
        uSun: { value: sun },
      },
      transparent: true,
      blending: NormalBlending,
    });
    materials.push(m);
    return m;
  };

  const bodies = PLANETS.map((def) => {
    const group = new Group();
    group.position.set(opts.mobile ? def.x * 0.55 : def.x, def.y, 0);
    group.scale.setScalar(opts.mobile ? def.s * 0.7 : def.s);
    group.rotation.z = def.tilt;
    const body = new Mesh(sphere, planetMaterial(KIND[def.kind]));
    body.renderOrder = -2;
    group.add(body);
    const fading: ShaderMaterial[] = [body.material as ShaderMaterial];

    if (def.kind === "saturn") {
      const ringMaterial = new ShaderMaterial({
        vertexShader: ringVertex,
        fragmentShader: ringFragment,
        uniforms: { uOpacity: { value: 0 }, uAmbient: { value: THEMES[opts.theme].ambient } },
        transparent: true,
        depthWrite: false,
        side: DoubleSide,
        blending: NormalBlending,
      });
      materials.push(ringMaterial);
      const ring = new Mesh(ringGeometry, ringMaterial);
      ring.rotation.x = -Math.PI / 2 + 0.32; // tipped toward us so the rings open up
      ring.renderOrder = -1;
      group.add(ring);
      fading.push(ringMaterial);
    }

    let moon: Mesh | null = null;
    if (def.kind === "earth") {
      moon = new Mesh(sphere, planetMaterial(KIND.mercury));
      moon.scale.setScalar(0.27);
      moon.renderOrder = -2;
      group.add(moon);
      fading.push(moon.material as ShaderMaterial);
    }

    scene.add(group);
    return { group, body, moon, fading, def };
  });

  return {
    update(time, travel, gain) {
      for (const { group, body, moon, fading, def } of bodies) {
        // planets drift past at a quarter of the star speed, for parallax
        const z = ((((def.z0 + travel * 0.25) % SPAN) + SPAN) % SPAN) - 40;
        group.position.z = z;
        group.position.y = def.y + Math.sin(time * 0.15 + def.z0) * 0.2;
        body.rotation.y = time * def.spin;
        if (moon) {
          const a = time * 0.25;
          moon.position.set(Math.cos(a) * 1.9, Math.sin(a) * 0.25, Math.sin(a) * 1.9);
        }
        // fade out before a planet gets close enough to sprawl across the copy
        const opacity = smoothstep(-40, -31, z) * smoothstep(-6, -12, z) * themeOpacity * gain;
        for (const m of fading) {
          m.uniforms.uOpacity.value = opacity;
          if (m.uniforms.uTime) m.uniforms.uTime.value = time;
        }
      }
    },
    setTheme(theme) {
      themeOpacity = THEMES[theme].opacity;
      for (const m of materials) m.uniforms.uAmbient.value = THEMES[theme].ambient;
    },
    dispose() {
      sphere.dispose();
      ringGeometry.dispose();
      for (const m of materials) m.dispose();
    },
  };
}
