import {
  ACESFilmicToneMapping,
  Color,
  DirectionalLight,
  FogExp2,
  HemisphereLight,
  PerspectiveCamera,
  PointLight,
  Scene,
  Vector3,
  WebGLRenderer,
} from "three";
import { CITY, STOPS, roadFrame, roadPoint, terrainHeight } from "./path";
import { createAtmosphere, createSky, sampleAtmosphere } from "./sky";
import { createLandscape, yieldToMain, type Quality } from "./landscape";
import { createStages, type Stop } from "./stages";
import { glowTexture } from "./textures";
import { disposeCharacters } from "./character";

export type JourneyTheme = "dark" | "light";

export interface LabelTarget {
  key: string;
  el: HTMLElement;
}

export interface JourneyHandle {
  /** `u` is a float over the shots: 0 = hero, 1…5 = stops, 6 = contact. */
  setProgress(u: number): void;
  setTheme(theme: JourneyTheme): void;
  dispose(): void;
}

interface Shot {
  /** a fixed camera position; otherwise the camera rides the road */
  at?: Vector3;
  s: number; // where along the road the camera sits
  side: number; // metres to the right of the road
  height: number;
  back: number; // metres behind `s`
  focus: Vector3;
  /** horizontal composition: >0 pushes the subject toward the right of the frame */
  frame: number;
  tod: number;
  fog: number;
  fov: number;
}

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function quality(): Quality & { dpr: number; ambientFps: number } {
  const w = window.innerWidth;
  const cores = navigator.hardwareConcurrency || 8;
  if (w < 768) return { terrain: [90, 140], clouds: 40, buildings: 150, stars: 600, dpr: 1.25, ambientFps: 0 };
  if (w < 1100 || cores <= 4) return { terrain: [140, 220], clouds: 70, buildings: 260, stars: 900, dpr: 1.5, ambientFps: 20 };
  return { terrain: [200, 310], clouds: 110, buildings: 420, stars: 1500, dpr: 1.75, ambientFps: 30 };
}

export async function createJourney(
  canvas: HTMLCanvasElement,
  opts: { reduceMotion: boolean; theme: JourneyTheme; labels: LabelTarget[]; onReady: () => void },
): Promise<JourneyHandle | null> {
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  } catch {
    return null; // no WebGL: the illustrated fallback stays visible
  }
  const q = quality();
  const mobile = window.innerWidth < 768;
  const baseDpr = Math.min(window.devicePixelRatio || 1, q.dpr);
  let dpr = baseDpr;
  renderer.setPixelRatio(dpr);
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  renderer.toneMapping = ACESFilmicToneMapping;

  const scene = new Scene();
  const fog = new FogExp2(new Color(), 0.002);
  scene.fog = fog;
  const camera = new PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1600);

  const glow = glowTexture();
  const sky = createSky(dpr, q.stars);
  // built in slices with yields in between, so loading the world never freezes the page
  const land = await createLandscape(q, glow);
  await yieldToMain();
  const stages = createStages();
  await yieldToMain();
  scene.add(sky.dome, sky.stars, land.group, stages.group);

  const hemi = new HemisphereLight(0xffffff, 0x000000, 1);
  const sun = new DirectionalLight(0xffffff, 1);
  // a soft fill from behind the camera, so slopes facing us never go fully black
  const fill = new DirectionalLight(0xffffff, 0.4);
  const key = new PointLight(0xffffff, 0, 20, 2);
  scene.add(hemi, sun, sun.target, fill, fill.target, key);

  // ---- the camera's shots, one per section of the page ----
  const st = stages.stops;
  const summitEnd = roadPoint(1);
  const cityLook = new Vector3(CITY.x, 8, CITY.z);
  // look down the road, a little left of the traveller, so they stand on the right third
  const s0 = roadFrame(STOPS.start);
  const heroLook = s0.p.clone().addScaledVector(s0.tangent, 70).addScaledVector(s0.side, -6).setY(s0.p.y + 2);
  const across = new Vector3(-stages.summitToCity.z, 0, stages.summitToCity.x);
  /** A point behind the figure on the summit, on the line toward the city. */
  const behind = (dist: number, up: number, sideways: number) =>
    stages.summitStanding.clone().addScaledVector(stages.summitToCity, -dist).addScaledVector(across, sideways).setY(stages.summitStanding.y + up);
  const shots: Shot[] = [
    // behind the traveller at the start, the road winding toward the city on the horizon
    { s: 0, side: -3.5, height: 6.5, back: 9, focus: heroLook, frame: 0.35, tod: 0.6, fog: 0.0016, fov: 44 },
    // straight into the open side of the room
    { at: stages.roomCamera, s: STOPS.room, side: 0, height: 0, back: 0, focus: st.room.focus, frame: 0.45, tod: 0, fog: 0.004, fov: 42 },
    { s: STOPS.town - 0.024, side: -1.2, height: 2.4, back: 0, focus: st.town.focus, frame: 0.42, tod: 1, fog: 0.0022, fov: 46 },
    { s: STOPS.workshop + 0.004, side: 3, height: 5.5, back: 0, focus: st.workshop.focus, frame: 0.5, tod: 0.2, fog: 0.003, fov: 44 },
    { s: STOPS.city, side: 8, height: 5, back: 0, focus: st.city.focus, frame: 0.45, tod: 0.56, fog: 0.0022, fov: 50 },
    // over the shoulder at the summit, then pulling up and back for the whole city at sunrise
    { at: behind(10, 5.5, -2.6), s: 1, side: 0, height: 0, back: 0, focus: cityLook.clone().setY(-6), frame: 0.5, tod: 0.78, fog: 0.0014, fov: 44 },
    { at: behind(17, 9, -6), s: 1, side: 0, height: 0, back: 0, focus: cityLook.clone().setY(-2), frame: 0.5, tod: 0.84, fog: 0.0011, fov: 46 },
  ];

  // on phones the copy stacks below, so the subject sits centred and higher in the frame
  if (mobile) for (const s of shots) s.frame = 0;

  const atm = createAtmosphere();
  const camPos = new Vector3();
  const look = new Vector3();
  const tmp = new Vector3();
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  let theme = opts.theme;
  let target = 0;
  let current = 0;
  let intro = opts.reduceMotion ? 1 : 0;

  const roadCamera = (s: number, sideOff: number, height: number, back: number, out: Vector3) => {
    const { p, tangent, side } = roadFrame(Math.min(1, Math.max(0, s)));
    out.copy(p).addScaledVector(side, sideOff).addScaledVector(tangent, -back);
    out.y = p.y + height;
    return out;
  };
  const posB = new Vector3();
  const pose = (u: number) => {
    const i = Math.min(shots.length - 2, Math.max(0, Math.floor(u)));
    const f = ease(Math.min(1, Math.max(0, u - i)));
    const a = shots[i];
    const b = shots[i + 1];
    if (a.at || b.at) {
      // into or between fixed shots: glide in a straight line
      if (a.at) camPos.copy(a.at);
      else roadCamera(a.s, a.side, a.height, a.back, camPos);
      if (b.at) posB.copy(b.at);
      else roadCamera(b.s, b.side, b.height, b.back, posB);
      camPos.lerp(posB, f);
    } else {
      roadCamera(lerp(a.s, b.s, f), lerp(a.side, b.side, f), lerp(a.height, b.height, f), lerp(a.back, b.back, f), camPos);
    }
    // never dip into a hillside mid-transition
    camPos.y = Math.max(camPos.y, terrainHeight(camPos.x, camPos.z) + 1.6);
    look.copy(a.focus).lerp(b.focus, f);
    return {
      frame: lerp(a.frame, b.frame, f),
      tod: lerp(a.tod, b.tod, f),
      fog: lerp(a.fog, b.fog, f),
      fov: lerp(a.fov, b.fov, f),
    };
  };

  // the key light follows whichever stop is closest
  const stopForShot: (Stop | undefined)[] = [st.start, st.room, st.town, st.workshop, st.city, st.summit, undefined];
  const labelPositions = new Map<string, { at: Vector3; from: number; to: number }>();
  land.beaconAnchors.forEach((at, i) => labelPositions.set(`beacon-${i}`, { at, from: -1, to: 0.55 }));
  stages.labelAnchors.forEach((at, i) => labelPositions.set(`tag-${i}`, { at, from: 3.55, to: 4.5 }));

  const placeLabels = (u: number) => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    for (const { key: k, el } of opts.labels) {
      const l = labelPositions.get(k);
      if (!l) continue;
      const fade = Math.min(1, (u - l.from) * 4, (l.to - u) * 4);
      tmp.copy(l.at).project(camera);
      const visible = fade > 0 && tmp.z < 1 && Math.abs(tmp.x) < 1.1 && Math.abs(tmp.y) < 1.1;
      el.style.opacity = visible ? String(Math.min(1, fade)) : "0";
      if (visible) el.style.transform = `translate3d(${((tmp.x + 1) / 2) * w}px, ${((1 - tmp.y) / 2) * h}px, 0)`;
    }
  };

  const sunDir = new Vector3();
  const cityDir = new Vector3(CITY.x - summitEnd.x, 0, CITY.z - summitEnd.z).normalize();

  const render = (time: number, animate: boolean) => {
    const shot = pose(current);
    // the first seconds bring the light up from darkness to the first glow of dawn
    const story = shot.tod * ease(intro);
    sampleAtmosphere(theme === "light" ? 0.55 + story * 0.45 : story, atm);

    camPos.x += pointer.x * 0.6;
    camPos.y += pointer.y * 0.35;
    camera.position.copy(camPos);
    camera.lookAt(look);
    camera.fov = shot.fov;
    camera.filmOffset = -shot.frame * (camera.aspect > 1 ? 9 : 0);
    camera.updateProjectionMatrix();

    sunDir.set(cityDir.x * Math.cos(atm.elevation), Math.sin(atm.elevation), cityDir.z * Math.cos(atm.elevation));
    sky.sunDir.copy(sunDir);
    sky.follow(camera.position);
    sky.apply(atm, time);
    fog.color.copy(atm.fog);
    fog.density = shot.fog;
    hemi.color.copy(atm.sky);
    hemi.groundColor.copy(atm.ground);
    hemi.intensity = atm.hemiI;
    sun.color.copy(atm.sun);
    sun.intensity = atm.sunI;
    sun.position.copy(camera.position).addScaledVector(sunDir, 200);
    sun.target.position.copy(camera.position);
    fill.color.copy(atm.sky);
    fill.intensity = 0.5 + (1 - Math.min(1, atm.sunI / 1.6)) * 0.7;
    fill.position.copy(camera.position).add(tmp.copy(camera.position).sub(look).setY(0).normalize().multiplyScalar(60)).setY(camera.position.y + 50);
    fill.target.position.copy(look);
    renderer.toneMappingExposure = atm.exposure;

    const nearest = Math.round(current);
    const stop = stopForShot[nearest];
    const closeness = Math.max(0, 1 - Math.abs(current - nearest) * 2);
    if (stop?.light) {
      key.position.copy(stop.light.position);
      key.color.set(stop.light.color);
      key.intensity = stop.light.intensity * closeness;
    } else key.intensity = 0;

    const night = 1 - Math.min(1, atm.sunI / 1.6);
    land.apply(atm, time, shot.fog);
    stages.update(time, night, animate);
    renderer.render(scene, camera);
    placeLabels(current);
  };

  // ---- loop: render only while something is changing ----
  let raf = 0;
  let last = performance.now();
  let clock = 0;
  let lastAmbient = 0;
  let dirty = true;
  let ready = false;
  let slow = 0;
  let frames = 0;

  const tick = (now: number) => {
    raf = requestAnimationFrame(tick);
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    clock += dt;

    const moving = Math.abs(target - current) > 0.0005;
    if (opts.reduceMotion) current = target;
    else if (moving) current += (target - current) * (1 - Math.exp(-dt * 3.2));
    else current = target;
    if (intro < 1) intro = Math.min(1, intro + dt / 3.5);
    pointer.x += (pointer.tx - pointer.x) * Math.min(1, dt * 3);
    pointer.y += (pointer.ty - pointer.y) * Math.min(1, dt * 3);
    const pointerMoving = Math.abs(pointer.tx - pointer.x) + Math.abs(pointer.ty - pointer.y) > 0.002;

    const active = moving || intro < 1 || pointerMoving || dirty;
    const ambientDue = !opts.reduceMotion && q.ambientFps > 0 && clock - lastAmbient > 1 / q.ambientFps;
    if (!active && !ambientDue) return;
    lastAmbient = clock;
    dirty = false;
    render(clock, !opts.reduceMotion);
    if (!ready) {
      ready = true;
      opts.onReady();
    }
    // adaptive resolution: if moving frames are slow, render fewer pixels
    if (moving) {
      frames++;
      if (dt > 1 / 40) slow++;
      if (frames === 45) {
        if (slow > 25 && dpr > baseDpr * 0.6) {
          dpr = Math.max(baseDpr * 0.6, dpr * 0.85);
          renderer.setPixelRatio(dpr);
          renderer.setSize(window.innerWidth, window.innerHeight, false);
        }
        frames = slow = 0;
      }
    }
  };

  const onPointer = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.ty = -((e.clientY / window.innerHeight) * 2 - 1);
  };
  const onResize = () => {
    renderer.setPixelRatio(dpr);
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    sky.setPixelRatio(dpr);
    camera.aspect = window.innerWidth / window.innerHeight;
    dirty = true;
  };
  const onVisibility = () => {
    cancelAnimationFrame(raf);
    if (!document.hidden) {
      last = performance.now();
      dirty = true;
      raf = requestAnimationFrame(tick);
    }
  };

  if (!opts.reduceMotion) window.addEventListener("pointermove", onPointer, { passive: true });
  window.addEventListener("resize", onResize);
  document.addEventListener("visibilitychange", onVisibility);
  // compile shaders off the main thread where the driver supports it
  pose(0);
  camera.position.copy(camPos);
  camera.lookAt(look);
  await renderer.compileAsync(scene, camera);
  raf = requestAnimationFrame(tick);

  return {
    setProgress(u) {
      target = Math.min(shots.length - 1, Math.max(0, u));
    },
    setTheme(next) {
      theme = next;
      dirty = true;
    },
    dispose() {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      sky.dispose();
      land.dispose();
      stages.dispose();
      disposeCharacters();
      glow.dispose();
      renderer.dispose();
    },
  };
}
