import {
  AdditiveBlending,
  BoxGeometry,
  CatmullRomCurve3,
  Color,
  CylinderGeometry,
  DodecahedronGeometry,
  DoubleSide,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  PlaneGeometry,
  ShaderMaterial,
  TorusGeometry,
  TubeGeometry,
  Vector3,
  type Material,
  type Texture,
  type BufferGeometry,
} from "three";
import { CITY, STOPS, roadFrame, terrainHeight } from "./path";
import { OUTFITS, createCharacter, type Character } from "./character";
import {
  chartScreen,
  codeScreen,
  dashboardScreen,
  formScreen,
  mapScreen,
  productScreen,
  windowsTexture,
} from "./textures";

/**
 * The five stops of the journey, each a small diorama beside the road. Every
 * stop exposes a focus point for the camera and an optional key light.
 */
export interface Stop {
  focus: Vector3;
  light?: { position: Vector3; color: string; intensity: number };
}

const owned: { dispose(): void }[] = [];
function own<T extends Material | BufferGeometry | Texture>(x: T): T {
  owned.push(x);
  return x;
}
const lambert = (color: string, extra: Partial<MeshLambertMaterial> = {}) =>
  own(new MeshLambertMaterial({ color, flatShading: true, ...extra }));
const box = (w: number, h: number, d: number) => own(new BoxGeometry(w, h, d));
const screenMat = (map: Texture, intensity = 1) =>
  own(new MeshBasicMaterial({ map, color: new Color(intensity, intensity, intensity), toneMapped: false }));

/** Place a group beside the road at `s`, `offset` units to the right (negative = left), facing the road. */
function besideRoad(group: Group, s: number, offset: number) {
  const { p, side } = roadFrame(s);
  const at = p.clone().addScaledVector(side, offset);
  at.y = Math.max(terrainHeight(at.x, at.z), p.y - 0.4);
  group.position.copy(at);
  const toRoad = side.clone().multiplyScalar(-Math.sign(offset));
  group.rotation.y = Math.atan2(toRoad.x, toRoad.z);
  return at;
}

function faceAlongRoad(obj: Group, s: number) {
  const { tangent } = roadFrame(s);
  obj.rotation.y = Math.atan2(tangent.x, tangent.z);
}

// ---------------------------------------------------------------- stop 1
function room(characters: Character[]) {
  const g = new Group();
  const at = besideRoad(g, STOPS.room, 9);
  const wall = lambert("#5b6380");
  const floor = lambert("#7a6450");
  const base = new Mesh(box(7, 0.4, 5.6), floor);
  base.position.y = 0.2;
  const back = new Mesh(box(7, 3.4, 0.25), wall);
  back.position.set(0, 2.1, -2.7);
  const left = new Mesh(box(0.25, 3.4, 5.6), wall);
  left.position.set(3.4, 2.1, 0);
  const roof = new Mesh(box(7.6, 0.25, 6.2), lambert("#2a2f40"));
  roof.position.set(0.6, 4.05, -0.3);
  roof.rotation.z = -0.06;
  // night window with a moon
  const windowPane = new Mesh(own(new PlaneGeometry(1.8, 1.2)), own(new MeshBasicMaterial({ color: "#16224a" })));
  windowPane.position.set(-1.9, 2.4, -2.56);
  const moon = new Mesh(own(new PlaneGeometry(0.22, 0.22)), own(new MeshBasicMaterial({ color: "#e9ecff" })));
  moon.position.set(-1.45, 2.7, -2.55);
  // desk, chair, monitor, lamp, shelf
  const wood = lambert("#8a6a4f");
  const desk = new Mesh(box(2.6, 0.1, 1), wood);
  desk.position.set(-0.4, 1.15, -2.0);
  for (const x of [-1.6, 0.8])
    for (const z of [-2.4, -1.6]) {
      const leg = new Mesh(box(0.08, 1.1, 0.08), wood);
      leg.position.set(x, 0.6, z);
      g.add(leg);
    }
  const monitor = new Mesh(box(1.25, 0.8, 0.06), lambert("#1b1e27"));
  monitor.position.set(-0.4, 1.75, -2.25);
  const code = codeScreen();
  own(code.texture);
  const screen = new Mesh(own(new PlaneGeometry(1.15, 0.72)), screenMat(code.texture, 1.15));
  screen.position.set(-0.4, 1.75, -2.215);
  const keyboard = new Mesh(box(0.7, 0.03, 0.22), lambert("#2b2f3c"));
  keyboard.position.set(-0.4, 1.22, -1.75);
  const lampBase = new Mesh(own(new CylinderGeometry(0.08, 0.12, 0.5, 8)), lambert("#c9a36a"));
  lampBase.position.set(0.6, 1.45, -2.2);
  const shade = new Mesh(own(new CylinderGeometry(0.1, 0.22, 0.2, 10, 1, true)), own(new MeshBasicMaterial({ color: "#ffd59a", side: DoubleSide })));
  shade.position.set(0.6, 1.75, -2.2);
  const seat = new Mesh(box(0.6, 0.08, 0.6), lambert("#2c3550"));
  seat.position.set(-0.4, 0.62, -1.0);
  const seatBack = new Mesh(box(0.6, 0.7, 0.08), lambert("#2c3550"));
  seatBack.position.set(-0.4, 1.0, -0.72);
  const shelf = new Mesh(box(0.35, 0.06, 1.6), wood);
  shelf.position.set(3.1, 2.3, -1.2);
  g.add(base, back, left, roof, windowPane, moon, desk, monitor, screen, keyboard, lampBase, shade, seat, seatBack, shelf);
  ["#d96c4f", "#4f7bd9", "#e0b84f", "#5fbf8f", "#9a6ad9"].forEach((c, i) => {
    const book = new Mesh(box(0.28, 0.42 + (i % 2) * 0.1, 0.14), lambert(c));
    book.position.set(3.1, 2.55, -1.8 + i * 0.22);
    g.add(book);
  });
  const student = createCharacter(OUTFITS.student, "sit");
  student.group.position.set(-0.4, 0.4, -1.05);
  student.group.rotation.y = Math.PI; // facing the screen
  g.add(student.group);
  characters.push(student);

  const toWorld = (v: Vector3) => g.localToWorld(v);
  g.updateMatrixWorld();
  return {
    group: g,
    code,
    camera: toWorld(new Vector3(0.9, 2.5, 6.6)),
    stop: {
      focus: toWorld(new Vector3(-0.4, 1.4, -1.6)),
      light: { position: toWorld(new Vector3(0.4, 2.6, -0.6)), color: "#ffc58a", intensity: 40 },
    } satisfies Stop,
    at,
  };
}

// ---------------------------------------------------------------- stop 2
function town(characters: Character[], windows: Texture) {
  const g = new Group();
  const material = lambert("#56627f", { emissive: new Color("#ffffff"), emissiveMap: windows, emissiveIntensity: 0.9 });
  const roofMat = lambert("#3a4258");
  const shops = [productScreen(3), productScreen(8), productScreen(13)].map((t) => screenMat(own(t), 1.05));
  let shop = 0;
  for (let i = 0; i < 14; i++) {
    const s = STOPS.town - 0.035 + (i / 13) * 0.07;
    const sideSign = i % 2 ? 1 : -1;
    const { p, side } = roadFrame(s);
    const w = 4.5 + ((i * 37) % 7) * 0.5;
    const h = 5 + ((i * 53) % 9) * 1.1;
    const d = 5 + ((i * 29) % 5) * 0.6;
    const offset = sideSign * (6.5 + w / 2 + ((i * 17) % 4));
    const b = new Group();
    const at = p.clone().addScaledVector(side, offset);
    b.position.set(at.x, Math.min(terrainHeight(at.x, at.z), p.y) - 0.3, at.z);
    const toRoad = side.clone().multiplyScalar(-sideSign);
    b.rotation.y = Math.atan2(toRoad.x, toRoad.z);
    const body = new Mesh(box(w, h, d), material);
    body.position.y = h / 2;
    const roof = new Mesh(box(w + 0.3, 0.3, d + 0.3), roofMat);
    roof.position.y = h + 0.15;
    b.add(body, roof);
    if (i % 4 === 1 && shop < shops.length) {
      // a storefront screen on the facade facing the road
      const screen = new Mesh(own(new PlaneGeometry(2.4, 3)), shops[shop++]);
      screen.position.set(0, 2.2, d / 2 + 0.03);
      b.add(screen);
    }
    g.add(b);
  }
  const junior = createCharacter(OUTFITS.junior, "walk");
  const { p, side } = roadFrame(STOPS.town);
  junior.group.position.copy(p).addScaledVector(side, 0.9);
  junior.group.userData.baseY = p.y + 0.06;
  faceAlongRoad(junior.group, STOPS.town);
  g.add(junior.group);
  characters.push(junior);
  return { group: g, material, stop: { focus: p.clone().setY(p.y + 2.5) } satisfies Stop };
}

// ---------------------------------------------------------------- stop 3
function workshop(characters: Character[]) {
  const g = new Group();
  const at = besideRoad(g, STOPS.workshop, -11);
  const platform = new Mesh(own(new CylinderGeometry(6.5, 6.8, 0.6, 40)), lambert("#2b3247"));
  platform.position.y = 0.3;
  const rim = new Mesh(own(new TorusGeometry(6.6, 0.06, 6, 80)), own(new MeshBasicMaterial({ color: "#6f8cff", toneMapped: false })));
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.62;
  const desk = new Mesh(box(3.6, 0.1, 1.1), lambert("#3a4260"));
  desk.position.set(0, 1.25, -1.2);
  const deskLegs = new Mesh(box(3.4, 1.1, 0.9), lambert("#232a3d"));
  deskLegs.position.set(0, 0.7, -1.2);
  g.add(platform, rim, desk, deskLegs);
  const screens = [dashboardScreen(), codeScreen().texture, mapScreen()];
  screens.forEach((t, i) => {
    own(t);
    const frame = new Mesh(box(1.3, 0.82, 0.05), lambert("#151821"));
    const x = (i - 1) * 1.25;
    const yaw = (1 - i) * 0.32;
    frame.position.set(x, 1.85, -1.55 + Math.abs(i - 1) * 0.18);
    frame.rotation.y = yaw;
    const screen = new Mesh(own(new PlaneGeometry(1.2, 0.74)), screenMat(t, 1.1));
    screen.position.set(0, 0, 0.03);
    frame.add(screen);
    g.add(frame);
  });
  // floating panels: dashboards, maps, charts and forms of real business apps
  const panels = [dashboardScreen(), chartScreen(), formScreen(), mapScreen()].map((t, i) => {
    own(t);
    const panel = new Mesh(own(new PlaneGeometry(3.2, 2)), own(new MeshBasicMaterial({ map: t, transparent: true, opacity: 0.92, side: DoubleSide, toneMapped: false })));
    const a = -0.95 + i * 0.63;
    panel.position.set(Math.sin(a) * 5, 3.4 + (i % 2) * 1.5, -Math.cos(a) * 4.2);
    panel.rotation.y = -a;
    g.add(panel);
    return panel;
  });
  const builder = createCharacter(OUTFITS.builder, "stand");
  builder.group.position.set(0.2, 0.6, -0.35);
  builder.group.rotation.y = Math.PI;
  g.add(builder.group);
  characters.push(builder);
  g.updateMatrixWorld();
  return {
    group: g,
    panels,
    stop: {
      focus: g.localToWorld(new Vector3(0, 2.4, -1.2)),
      light: { position: g.localToWorld(new Vector3(0, 3.2, 0.8)), color: "#8fa8ff", intensity: 18 },
    } satisfies Stop,
    at,
  };
}

// ---------------------------------------------------------------- stop 4
const streamVertex = /* glsl */ `
  varying float vT;
  void main() {
    vT = uv.x;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const streamFragment = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColor;
  uniform float uSeed;
  varying float vT;
  void main() {
    float pulse = smoothstep(0.75, 1.0, fract(vT * 6.0 - uTime * 0.6 + uSeed));
    gl_FragColor = vec4(uColor, 0.18 + pulse * 0.9);
  }
`;

function techCity(characters: Character[], windows: Texture) {
  const g = new Group();
  const { p, side, tangent } = roadFrame(STOPS.city);
  const towerMat = lambert("#1e2539", { emissive: new Color("#ffffff"), emissiveMap: windows, emissiveIntensity: 1 });
  const glass = own(new MeshBasicMaterial({ color: "#7b93ff", transparent: true, opacity: 0.18, blending: AdditiveBlending, depthWrite: false }));
  const tops: Vector3[] = [];
  const towers = [
    [-19, -8],
    [-24, 4],
    [-18, 15],
    [-31, -3],
    [-33, 12],
    [-15, 25],
    [-27, 24],
    [-38, 22],
  ];
  towers.forEach(([off, along], i) => {
    const at = p.clone().addScaledVector(side, off).addScaledVector(tangent, along);
    const h = 12 + ((i * 41) % 5) * 3.5;
    const w = 4 + (i % 3);
    const t = new Mesh(box(w, h, w), towerMat);
    t.position.set(at.x, terrainHeight(at.x, at.z) + h / 2 - 0.5, at.z);
    g.add(t);
    tops.push(new Vector3(at.x, t.position.y + h / 2, at.z));
  });
  // architecture layers floating over the plaza
  const plaza = p.clone().addScaledVector(side, -7);
  const layers = [0, 1, 2, 3].map((k) => {
    const plate = new Mesh(box(5, 0.08, 3.4), glass);
    plate.position.set(plaza.x, plaza.y + 2.2 + k * 1.15, plaza.z);
    plate.rotation.y = Math.atan2(tangent.x, tangent.z) + 0.3;
    g.add(plate);
    return plate;
  });
  // data streams between the towers and the plaza
  const streams: ShaderMaterial[] = [];
  const hub = plaza.clone().setY(plaza.y + 5.6);
  tops.forEach((top, i) => {
    const mid = top.clone().lerp(hub, 0.5);
    mid.y += 2;
    const curve = new CatmullRomCurve3([top, mid, hub]);
    const geometry = own(new TubeGeometry(curve, 40, 0.07, 5, false));
    const material = own(
      new ShaderMaterial({
        vertexShader: streamVertex,
        fragmentShader: streamFragment,
        uniforms: { uTime: { value: 0 }, uColor: { value: new Color(i % 3 ? "#7b93ff" : "#ffb46b") }, uSeed: { value: i * 0.37 } },
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
      }),
    );
    streams.push(material);
    g.add(new Mesh(geometry, material));
  });
  const engineer = createCharacter(OUTFITS.engineer, "stand");
  const stand = plaza.clone().addScaledVector(side, 3);
  engineer.group.position.copy(stand).setY(p.y + 0.06);
  engineer.group.rotation.y = Math.atan2(-side.x, -side.z) + 0.4;
  g.add(engineer.group);
  characters.push(engineer);
  const labelAnchors = [
    layers[3].position.clone().add(new Vector3(0, 0.9, 0)),
    layers[1].position.clone().addScaledVector(tangent, -3.2),
    tops[0].clone(),
    tops[3].clone(),
    tops[4].clone(),
    hub.clone().add(new Vector3(0, 3, 0)),
  ];
  return {
    group: g,
    streams,
    layers,
    labelAnchors,
    material: towerMat,
    stop: { focus: plaza.clone().setY(plaza.y + 4.5), light: { position: hub.clone(), color: "#7b93ff", intensity: 30 } } satisfies Stop,
  };
}

// ---------------------------------------------------------------- stop 5
function summit(characters: Character[]) {
  const g = new Group();
  const { p, tangent } = roadFrame(STOPS.summit);
  const rockMat = lambert("#5d5a66");
  const rockGeo = own(new DodecahedronGeometry(1, 0));
  const toCity = new Vector3(CITY.x - p.x, 0, CITY.z - p.z).normalize();
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    if (Math.cos(a) * toCity.x + Math.sin(a) * toCity.z < -0.2) continue;
    const r = new Mesh(rockGeo, rockMat);
    const d = 4.5 + (i % 3) * 1.6;
    r.position.set(p.x + Math.cos(a) * d, p.y - 0.4, p.z + Math.sin(a) * d);
    r.scale.set(0.8 + (i % 4) * 0.4, 0.6 + (i % 3) * 0.5, 0.9);
    r.rotation.set(i, i * 2, 0);
    g.add(r);
  }
  // a small flag at the end of the road
  const flagAt = p.clone().addScaledVector(tangent, 3.4).addScaledVector(new Vector3(-tangent.z, 0, tangent.x), -2.2);
  const pole = new Mesh(own(new CylinderGeometry(0.03, 0.03, 2.2, 6)), lambert("#c9ccd6"));
  pole.position.set(flagAt.x, p.y + 1.1, flagAt.z);
  const flag = new Mesh(own(new PlaneGeometry(0.55, 0.34)), own(new MeshBasicMaterial({ color: "#ffb46b", side: DoubleSide })));
  flag.position.set(flagAt.x + 0.28, p.y + 2.0, flagAt.z);
  g.add(pole, flag);
  const me = createCharacter(OUTFITS.summit, "stand");
  const ahead = p.clone().addScaledVector(tangent, 1.5);
  me.group.position.set(ahead.x, p.y + 0.06, ahead.z);
  // looking out over the city
  me.group.rotation.y = Math.atan2(CITY.x - ahead.x, CITY.z - ahead.z);
  g.add(me.group);
  characters.push(me);
  return { group: g, flag, stop: { focus: ahead.clone().setY(p.y + 1.4) } satisfies Stop, standing: ahead, toCity };
}

export function createStages(windows: Texture = own(windowsTexture())) {
  windows.repeat.set(2, 2);
  const characters: Character[] = [];
  const group = new Group();

  // the traveller at the very start of the road
  const start = createCharacter(OUTFITS.start, "stand");
  const s0 = roadFrame(STOPS.start);
  start.group.position.copy(s0.p).addScaledVector(s0.side, 0.8).setY(s0.p.y + 0.06);
  faceAlongRoad(start.group, STOPS.start);
  characters.push(start);
  group.add(start.group);

  const r = room(characters);
  const t = town(characters, windows);
  const w = workshop(characters);
  const c = techCity(characters, windows);
  const m = summit(characters);
  group.add(r.group, t.group, w.group, c.group, m.group);

  let typed = 0;
  let lastTyped = 0;
  return {
    group,
    stops: {
      start: {
        focus: start.group.position.clone().setY(s0.p.y + 1.2),
        light: { position: start.group.position.clone().addScaledVector(s0.side, 2).setY(s0.p.y + 3.2), color: "#ffc58a", intensity: 9 },
      } as Stop,
      room: r.stop,
      town: t.stop,
      workshop: w.stop,
      city: c.stop,
      summit: m.stop,
    },
    labelAnchors: c.labelAnchors,
    summitStanding: m.standing,
    summitToCity: m.toCity,
    roomCamera: r.camera,
    /** `active` is the stop the camera is at; only nearby animation runs. */
    update(time: number, nightAmount: number, animate: boolean) {
      if (animate) {
        for (const ch of characters) ch.update(time);
        w.panels.forEach((panel, i) => (panel.position.y += Math.sin(time * 0.8 + i) * 0.0025));
        c.layers.forEach((plate, i) => (plate.rotation.y += 0.0008 * (i % 2 ? 1 : -1)));
        m.flag.rotation.y = Math.sin(time * 2.4) * 0.25;
        // the first program types itself out, then starts over
        if (time - lastTyped > 0.09) {
          lastTyped = time;
          typed = typed >= r.code.total + 40 ? 0 : typed + 3;
          r.code.draw(Math.min(typed, r.code.total), Math.floor(time * 2) % 2 === 0);
        }
      }
      for (const s of c.streams) s.uniforms.uTime.value = time;
      t.material.emissiveIntensity = 0.35 + nightAmount * 0.75;
      c.material.emissiveIntensity = 0.4 + nightAmount * 0.8;
    },
    dispose() {
      for (const o of owned.splice(0)) o.dispose();
    },
  };
}
