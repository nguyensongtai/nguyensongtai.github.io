import { BoxGeometry, CapsuleGeometry, Group, Mesh, MeshLambertMaterial, SphereGeometry, TorusGeometry } from "three";

/**
 * A small, faceless diorama figure. The same person appears at every stop;
 * what changes is the outfit and what they carry, so growth reads at a glance
 * without turning the site into a game.
 */
export type Pose = "stand" | "sit" | "walk";

export interface Outfit {
  top: string;
  bottom: string;
  /** a second layer (jacket, blazer, coat) drawn over the top */
  layer?: string;
  backpack?: string;
  headphones?: boolean;
  longCoat?: boolean;
}

export const OUTFITS = {
  start: { top: "#3d5a8f", bottom: "#2a2f3d", backpack: "#c56a3c" },
  student: { top: "#59627a", bottom: "#2a2f3d", headphones: true },
  junior: { top: "#2f8f8a", bottom: "#323849", backpack: "#c56a3c" },
  builder: { top: "#d9dde8", bottom: "#2b3040", layer: "#4b5878" },
  engineer: { top: "#eef1f7", bottom: "#1f2433", layer: "#22305a" },
  summit: { top: "#eef1f7", bottom: "#1f2433", layer: "#2a2f45", longCoat: true },
} satisfies Record<string, Outfit>;

const SKIN = "#d9a988";
const HAIR = "#1b1a20";
const SHOE = "#15171d";

// shared geometry for every figure on the page
const geo = {
  limb: new CapsuleGeometry(0.075, 0.36, 4, 8),
  arm: new CapsuleGeometry(0.06, 0.46, 4, 8),
  torso: new CapsuleGeometry(0.2, 0.34, 4, 12),
  head: new SphereGeometry(0.15, 16, 12),
  hair: new SphereGeometry(0.158, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.55),
  shoe: new BoxGeometry(0.12, 0.08, 0.22),
  pack: new BoxGeometry(0.3, 0.38, 0.16),
  phones: new TorusGeometry(0.16, 0.025, 6, 16, Math.PI),
  coat: new CapsuleGeometry(0.235, 0.62, 4, 12),
};
const materials = new Map<string, MeshLambertMaterial>();
const mat = (color: string) => {
  let m = materials.get(color);
  if (!m) {
    m = new MeshLambertMaterial({ color, flatShading: true });
    materials.set(color, m);
  }
  return m;
};

export function disposeCharacters() {
  for (const g of Object.values(geo)) g.dispose();
  for (const m of materials.values()) m.dispose();
  materials.clear();
}

export interface Character {
  group: Group;
  update(time: number): void;
}

export function createCharacter(outfit: Outfit, pose: Pose): Character {
  const group = new Group();
  const part = (g: keyof typeof geo, color: string, parent: Group = group) => {
    const m = new Mesh(geo[g], mat(color));
    parent.add(m);
    return m;
  };

  const sitting = pose === "sit";
  const hipY = sitting ? 0.52 : 0.9;

  // legs: a hip pivot (thigh) with a knee pivot (shin)
  const legs = [-1, 1].map((sideSign) => {
    const hip = new Group();
    hip.position.set(0.1 * sideSign, hipY, 0);
    group.add(hip);
    const thigh = part("limb", outfit.bottom, hip);
    thigh.position.y = -0.22;
    const knee = new Group();
    knee.position.y = -0.44;
    hip.add(knee);
    const shin = part("limb", outfit.bottom, knee);
    shin.position.y = -0.22;
    const shoe = part("shoe", SHOE, knee);
    shoe.position.set(0, -0.46, 0.04);
    if (sitting) {
      hip.rotation.x = -Math.PI / 2;
      knee.rotation.x = Math.PI / 2;
    }
    return { hip, knee };
  });

  const torso = part("torso", outfit.layer ?? outfit.top);
  torso.position.y = hipY + 0.36;
  torso.scale.set(1, 1, 0.72);
  if (outfit.layer) {
    // the shirt shows as a strip down the front of the open jacket
    const shirt = part("limb", outfit.top);
    shirt.scale.set(0.9, 0.95, 0.5);
    shirt.position.set(0, hipY + 0.4, 0.105);
  }
  if (outfit.longCoat) {
    const coat = part("coat", outfit.layer!);
    coat.scale.set(1, 1, 0.75);
    coat.position.y = hipY + 0.1;
  }

  const head = new Group();
  head.position.y = hipY + 0.78;
  group.add(head);
  part("head", SKIN, head);
  const hair = part("hair", HAIR, head);
  hair.rotation.x = -0.35;
  if (outfit.headphones) {
    const phones = part("phones", "#20232c", head);
    phones.rotation.y = Math.PI / 2;
    phones.position.y = 0.02;
  }

  const arms = [-1, 1].map((sideSign) => {
    const shoulder = new Group();
    shoulder.position.set(0.27 * sideSign, hipY + 0.6, 0);
    group.add(shoulder);
    const arm = part("arm", outfit.layer ?? outfit.top, shoulder);
    arm.position.y = -0.27;
    const hand = part("head", SKIN, shoulder);
    hand.scale.setScalar(0.36);
    hand.position.y = -0.56;
    shoulder.rotation.z = 0.08 * sideSign;
    if (sitting) shoulder.rotation.x = -1.1; // reaching for the keyboard
    return shoulder;
  });

  if (outfit.backpack) {
    const pack = part("pack", outfit.backpack);
    pack.position.set(0, hipY + 0.42, -0.24);
  }

  return {
    group,
    update(time) {
      const t = time + group.id;
      torso.scale.y = 1 + Math.sin(t * 1.6) * 0.012; // breathing
      head.rotation.y = Math.sin(t * 0.35) * 0.25;
      if (sitting) {
        arms[0].rotation.x = -1.1 + Math.sin(t * 11) * 0.05;
        arms[1].rotation.x = -1.1 + Math.sin(t * 11 + 1.7) * 0.05;
        head.rotation.x = 0.15;
      } else if (pose === "walk") {
        const swing = Math.sin(t * 4) * 0.45;
        legs[0].hip.rotation.x = swing;
        legs[1].hip.rotation.x = -swing;
        legs[0].knee.rotation.x = Math.max(0, -swing) * 0.9;
        legs[1].knee.rotation.x = Math.max(0, swing) * 0.9;
        arms[0].rotation.x = -swing * 0.7;
        arms[1].rotation.x = swing * 0.7;
        group.position.y = group.userData.baseY + Math.abs(Math.cos(t * 4)) * 0.04;
      }
    },
  };
}
