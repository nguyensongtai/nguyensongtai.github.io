import {
  AdditiveBlending,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  CylinderGeometry,
  Float32BufferAttribute,
  Group,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshLambertMaterial,
  Object3D,
  PlaneGeometry,
  Points,
  RepeatWrapping,
  ShaderMaterial,
  SRGBColorSpace,
  Sprite,
  SpriteMaterial,
  Vector3,
  type Texture,
} from "three";
import { CITY, ROAD_LENGTH, STOPS, roadFrame, roadPoint, roadX, roadY, terrainHeight } from "./path";
import { cloudTexture, windowsTexture } from "./textures";
import type { Atmosphere } from "./sky";

export interface Quality {
  terrain: [number, number];
  clouds: number;
  buildings: number;
  stars: number;
}

/** Hand the main thread back, so building the world never blocks input (keeps TBT/INP low). */
export const yieldToMain = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

const WHITE = new Color("#ffffff");
const disposables: { dispose(): void }[] = [];
const keep = <T extends { dispose(): void }>(x: T) => {
  disposables.push(x);
  return x;
};

async function terrain(q: Quality) {
  const W = 620;
  const D = 960;
  const geometry = keep(new PlaneGeometry(W, D, q.terrain[0], q.terrain[1]));
  geometry.rotateX(-Math.PI / 2);
  geometry.translate(0, 0, -D / 2 + 70);
  const pos = geometry.attributes.position as BufferAttribute;
  const colors = new Float32Array(pos.count * 3);
  const grass = new Color("#3f7d47");
  const meadow = new Color("#7aa957");
  const rock = new Color("#7b6f8c");
  const snow = new Color("#f1f3fb");
  const valley = new Color("#2a2f3d");
  const c = new Color();
  let slice = performance.now();
  for (let i = 0; i < pos.count; i++) {
    if ((i & 255) === 0 && performance.now() - slice > 8) {
      await yieldToMain();
      slice = performance.now();
    }
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const h = terrainHeight(x, z);
    pos.setY(i, h);
    const rel = h - roadY(z);
    c.copy(grass).lerp(meadow, Math.max(0, Math.min(1, Math.sin(x * 0.05) * 0.5 + 0.5)) * 0.5);
    if (rel > 18) c.lerp(rock, Math.min(1, (rel - 18) / 22));
    if (h > 62) c.lerp(snow, Math.min(1, (h - 62) / 14));
    if (-z > 640 && h < 1) c.copy(valley);
    colors.set([c.r, c.g, c.b], i * 3);
  }
  geometry.setAttribute("color", new BufferAttribute(colors, 3));
  geometry.computeVertexNormals();
  const material = keep(new MeshLambertMaterial({ vertexColors: true, flatShading: true }));
  return new Mesh(geometry, material);
}

function roadTextures() {
  const make = (linesOnly: boolean) => {
    const cv = document.createElement("canvas");
    cv.width = 64;
    cv.height = 256;
    const g = cv.getContext("2d")!;
    g.fillStyle = linesOnly ? "#000" : "#454b5c";
    g.fillRect(0, 0, 64, 256);
    g.fillStyle = linesOnly ? "#8aa0e6" : "#aab3c8";
    g.fillRect(2, 0, 4, 256);
    g.fillRect(58, 0, 4, 256);
    g.fillStyle = linesOnly ? "#ffb46b" : "#e0c99a";
    g.fillRect(30, 0, 4, 110);
    const t = new CanvasTexture(cv);
    t.colorSpace = SRGBColorSpace;
    t.wrapS = t.wrapT = RepeatWrapping;
    t.anisotropy = 8;
    return keep(t);
  };
  return { map: make(false), glow: make(true) };
}

function road() {
  const segments = 900;
  const width = 3.4;
  const positions = new Float32Array((segments + 1) * 2 * 3);
  const uvs = new Float32Array((segments + 1) * 2 * 2);
  const index: number[] = [];
  let dist = 0;
  let prev = roadPoint(0);
  for (let i = 0; i <= segments; i++) {
    const s = i / segments;
    const { p, side } = roadFrame(s);
    dist += p.distanceTo(prev);
    prev = p;
    for (let k = 0; k < 2; k++) {
      const o = (k === 0 ? -1 : 1) * (width / 2);
      positions.set([p.x + side.x * o, p.y + 0.06, p.z + side.z * o], (i * 2 + k) * 3);
      uvs.set([k, dist / 9], (i * 2 + k) * 2);
    }
    if (i < segments) {
      const a = i * 2;
      index.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); // counter-clockwise from above
    }
  }
  const geometry = keep(new BufferGeometry());
  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new BufferAttribute(uvs, 2));
  geometry.setIndex(index);
  geometry.computeVertexNormals();
  const { map, glow } = roadTextures();
  const material = keep(new MeshLambertMaterial({ map, emissiveMap: glow, emissive: new Color("#ffffff"), emissiveIntensity: 0.5 }));
  return { mesh: new Mesh(geometry, material), material };
}

/** Street lamps along the road: instanced poles plus one points cloud for the glow. */
function lamps(glow: Texture) {
  const spacing = 16;
  const count = Math.floor(ROAD_LENGTH / spacing);
  const pole = keep(new CylinderGeometry(0.05, 0.07, 3.2, 6));
  pole.translate(0, 1.6, 0);
  const poles = new InstancedMesh(pole, keep(new MeshLambertMaterial({ color: "#2b2f3a" })), count);
  const glowPos = new Float32Array(count * 3);
  const m = new Matrix4();
  // keep the camera's view of each stop clear of poles
  const clear = [STOPS.start, STOPS.room, STOPS.workshop, STOPS.city, STOPS.summit];
  let placed = 0;
  for (let i = 0; i < count; i++) {
    const s = (i + 0.5) / count;
    if (clear.some((c) => Math.abs(s - c) < 0.03)) continue;
    const { p, side } = roadFrame(s);
    const sign = i % 2 ? 1 : -1;
    const x = p.x + side.x * 2.4 * sign;
    const z = p.z + side.z * 2.4 * sign;
    m.makeTranslation(x, p.y, z);
    poles.setMatrixAt(placed, m);
    glowPos.set([x, p.y + 3.25, z], placed * 3);
    placed++;
  }
  poles.count = placed;
  const g = keep(new BufferGeometry());
  g.setAttribute("position", new BufferAttribute(glowPos.subarray(0, placed * 3), 3));
  const material = keep(
    new ShaderMaterial({
      uniforms: { uMap: { value: glow }, uColor: { value: new Color("#ffc46b") }, uAlpha: { value: 1 }, uScale: { value: 420 } },
      vertexShader: /* glsl */ `
        uniform float uScale;
        void main() {
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = clamp(uScale / -mv.z, 2.0, 64.0);
        }`,
      fragmentShader: /* glsl */ `
        uniform sampler2D uMap;
        uniform vec3 uColor;
        uniform float uAlpha;
        void main() { gl_FragColor = vec4(uColor, texture2D(uMap, gl_PointCoord).a * uAlpha); }`,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
    }),
  );
  const lights = new Points(g, material);
  lights.frustumCulled = false;
  return { poles, lights, material };
}

/** Career milestones: a warm floating light over each stop, visible from the start of the road. */
function beacons(glow: Texture) {
  const group = new Group();
  const glowMat = keep(new SpriteMaterial({ map: glow, color: "#ffc27a", blending: AdditiveBlending, depthWrite: false, fog: false }));
  const anchors: Vector3[] = [];
  for (const s of [STOPS.room, STOPS.town, STOPS.workshop, STOPS.city, STOPS.summit]) {
    const { p, side } = roadFrame(s);
    const at = p.clone().addScaledVector(side, -2.6);
    const sprite = new Sprite(glowMat);
    sprite.position.copy(at).setY(at.y + 6.2);
    sprite.scale.setScalar(2.4);
    group.add(sprite);
    anchors.push(sprite.position.clone());
  }
  return { group, anchors };
}

const cloudVertex = /* glsl */ `
  attribute vec3 aOffset;
  attribute float aScale;
  attribute float aSeed;
  uniform float uTime;
  varying vec2 vUv;
  varying float vDepth;
  varying float vSeed;
  void main() {
    vUv = uv;
    vSeed = aSeed;
    vec3 right = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);
    vec3 up = vec3(0.0, 1.0, 0.0);
    vec3 c = aOffset + vec3(sin(uTime * 0.02 + aSeed * 6.0) * 6.0, 0.0, 0.0);
    vec3 p = c + right * position.x * aScale * 2.0 + up * position.y * aScale;
    vec4 mv = viewMatrix * vec4(p, 1.0);
    vDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;
const cloudFragment = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec3 uLight;
  uniform vec3 uShade;
  uniform vec3 uFog;
  uniform float uFogDensity;
  uniform float uOpacity;
  varying vec2 vUv;
  varying float vDepth;
  varying float vSeed;
  void main() {
    float a = texture2D(uMap, vUv).a;
    vec3 col = mix(uShade, uLight, smoothstep(0.2, 0.9, vUv.y) * 0.8 + 0.2 * vSeed);
    float fog = 1.0 - exp(-pow(uFogDensity * vDepth, 2.0));
    col = mix(col, uFog, fog * 0.85);
    // fade clouds the camera flies through
    float near = smoothstep(4.0, 22.0, vDepth);
    gl_FragColor = vec4(col, a * uOpacity * near);
  }
`;

function clouds(count: number, map: Texture) {
  const base = keep(new PlaneGeometry(1, 1));
  const geometry = keep(new InstancedBufferGeometry());
  geometry.index = base.index;
  geometry.setAttribute("position", base.attributes.position);
  geometry.setAttribute("uv", base.attributes.uv);
  const offsets = new Float32Array(count * 3);
  const scales = new Float32Array(count);
  const seeds = new Float32Array(count);
  let seed = 9;
  const r = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  for (let i = 0; i < count; i++) {
    const low = i % 4 === 0; // valley mist hugging the road
    const sea = !low && i % 2 === 1; // a sea of clouds between the ridges
    const z = 30 - r() * 820;
    const side = r() < 0.5 ? -1 : 1;
    const x = roadX(z) + side * (low ? 14 + r() * 30 : sea ? 40 + r() * 170 : 25 + r() * 160);
    // the sea sits in the valleys, below an aerial camera; the rest drift high in the sky
    const y = low ? terrainHeight(x, z) + 3 + r() * 5 : sea ? Math.max(terrainHeight(x, z), 0) + 5 + r() * 8 : 48 + r() * 46;
    offsets.set([x, y, z], i * 3);
    scales[i] = low ? 10 + r() * 10 : sea ? 26 + r() * 30 : 18 + r() * 30;
    seeds[i] = r();
  }
  geometry.setAttribute("aOffset", new InstancedBufferAttribute(offsets, 3));
  geometry.setAttribute("aScale", new InstancedBufferAttribute(scales, 1));
  geometry.setAttribute("aSeed", new InstancedBufferAttribute(seeds, 1));
  geometry.instanceCount = count;
  const uniforms = {
    uMap: { value: map },
    uLight: { value: new Color() },
    uShade: { value: new Color() },
    uFog: { value: new Color() },
    uFogDensity: { value: 0.002 },
    uOpacity: { value: 0.8 },
    uTime: { value: 0 },
  };
  const material = keep(
    new ShaderMaterial({ vertexShader: cloudVertex, fragmentShader: cloudFragment, uniforms, transparent: true, depthWrite: false }),
  );
  const mesh = new Mesh(geometry, material);
  mesh.frustumCulled = false;
  mesh.renderOrder = 5;
  return { mesh, uniforms };
}

/** The digital city in the valley beyond the summit: the destination seen from the very first frame. */
function city(count: number, glow: Texture) {
  const windows = keep(windowsTexture());
  windows.repeat.set(1, 3);
  const box = keep(new BoxGeometry(1, 1, 1));
  box.translate(0, 0.5, 0);
  const material = keep(
    new MeshLambertMaterial({ color: "#161b2c", emissive: new Color("#ffffff"), emissiveMap: windows, emissiveIntensity: 1.1 }),
  );
  const mesh = new InstancedMesh(box, material, count);
  const dummy = new Object3D();
  const tops: number[] = [];
  let seed = 41;
  const r = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  for (let i = 0; i < count; i++) {
    const a = r() * Math.PI * 2;
    const d = Math.sqrt(r()) * CITY.radius;
    const x = CITY.x + Math.cos(a) * d;
    const z = CITY.z + Math.sin(a) * d * 0.8;
    const core = 1 - d / CITY.radius;
    const h = 3 + r() ** 2 * 14 + core ** 2.2 * 38 * (0.4 + r() * 0.6);
    const w = 3 + r() * 5;
    dummy.position.set(x, -1.6, z);
    dummy.scale.set(w, h, w * (0.7 + r() * 0.6));
    dummy.rotation.y = Math.round(r() * 4) * (Math.PI / 8);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
    if (h > 22 && tops.length < 240) tops.push(x, h - 1.4, z);
  }
  // aircraft-warning lights on the tall towers
  const g = keep(new BufferGeometry());
  g.setAttribute("position", new Float32BufferAttribute(tops, 3));
  const lightMat = keep(
    new ShaderMaterial({
      uniforms: { uMap: { value: glow }, uTime: { value: 0 } },
      vertexShader: /* glsl */ `
        varying float vBlink;
        uniform float uTime;
        void main() {
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = clamp(900.0 / -mv.z, 2.0, 14.0);
          vBlink = step(0.5, fract(uTime * 0.5 + position.x * 0.13));
        }`,
      fragmentShader: /* glsl */ `
        uniform sampler2D uMap;
        varying float vBlink;
        void main() { gl_FragColor = vec4(1.0, 0.35, 0.3, texture2D(uMap, gl_PointCoord).a * (0.35 + 0.65 * vBlink)); }`,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
    }),
  );
  const lights = new Points(g, lightMat);
  lights.frustumCulled = false;

  // a glowing street grid on the valley floor
  const gridGeo = keep(new PlaneGeometry(CITY.radius * 2.6, CITY.radius * 2.2));
  gridGeo.rotateX(-Math.PI / 2);
  const gridMat = keep(
    new ShaderMaterial({
      uniforms: { uColor: { value: new Color("#5b7bff") }, uAlpha: { value: 0.6 } },
      vertexShader: /* glsl */ `
        varying vec2 vP;
        void main() { vP = position.xz; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor;
        uniform float uAlpha;
        varying vec2 vP;
        void main() {
          vec2 g = abs(fract(vP / 14.0) - 0.5);
          float line = smoothstep(0.47, 0.5, max(g.x, g.y));
          float fade = 1.0 - smoothstep(120.0, 200.0, length(vP * vec2(1.0, 1.15)));
          gl_FragColor = vec4(uColor, line * fade * uAlpha);
        }`,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
    }),
  );
  const grid = new Mesh(gridGeo, gridMat);
  grid.position.set(CITY.x, -1.45, CITY.z);

  const group = new Group();
  group.add(mesh, lights, grid);
  return { group, material, lightMat, gridMat };
}

export async function createLandscape(q: Quality, glow: Texture) {
  const group = new Group();
  const ground = await terrain(q);
  await yieldToMain();
  const r = road();
  const l = lamps(glow);
  const b = beacons(glow);
  await yieldToMain();
  const cl = clouds(q.clouds, keep(cloudTexture()));
  const c = city(q.buildings, glow);
  group.add(ground, r.mesh, l.poles, l.lights, b.group, cl.mesh, c.group);
  const night = { value: 1 };

  return {
    group,
    beaconAnchors: b.anchors,
    apply(a: Atmosphere, time: number, fogDensity: number) {
      // lights matter less as the sun comes up
      night.value = 1 - Math.min(1, a.sunI / 1.6);
      r.material.emissiveIntensity = 0.15 + night.value * 0.55;
      l.material.uniforms.uAlpha.value = 0.25 + night.value * 0.85;
      c.material.emissiveIntensity = 0.45 + night.value * 0.9;
      c.gridMat.uniforms.uAlpha.value = 0.15 + night.value * 0.55;
      c.lightMat.uniforms.uTime.value = time;
      cl.uniforms.uLight.value.copy(a.horizon).lerp(a.sun, 0.4).lerp(WHITE, 0.25).multiplyScalar(0.95 + a.sunI * 0.12);
      cl.uniforms.uShade.value.copy(a.top).lerp(a.fog, 0.6);
      cl.uniforms.uFog.value.copy(a.fog);
      cl.uniforms.uFogDensity.value = fogDensity;
      cl.uniforms.uTime.value = time;
      cl.uniforms.uOpacity.value = 0.7 + a.sunI * 0.1;
    },
    dispose() {
      for (const d of disposables.splice(0)) d.dispose();
    },
  };
}

