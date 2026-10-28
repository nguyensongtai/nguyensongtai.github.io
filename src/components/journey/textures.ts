import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from "three";

/**
 * Every texture is drawn on a canvas at runtime, so the 3D scene ships no image
 * files. Screens show generic UI patterns, never real product screenshots.
 */
function canvas(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d")!);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

const rand = (seed: number) => () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};

const BG = "#0b1020";
const PANEL = "#141b33";
const LINE = "#26304f";
const TEXT = "#9fb0d8";
const ACCENT = "#6f8cff";
const WARM = "#ffb46b";

function frame(g: CanvasRenderingContext2D, w: number, h: number, title: string) {
  g.fillStyle = BG;
  g.fillRect(0, 0, w, h);
  g.fillStyle = PANEL;
  g.fillRect(0, 0, w, 26);
  for (const [i, c] of ["#ff6b6b", "#ffcc66", "#5be39b"].entries()) {
    g.fillStyle = c;
    g.beginPath();
    g.arc(14 + i * 14, 13, 4, 0, Math.PI * 2);
    g.fill();
  }
  g.fillStyle = TEXT;
  g.font = "600 12px ui-monospace, monospace";
  g.fillText(title, 64, 17);
}

/** A first program, typed line by line on the stage-one monitor. */
export const CODE_LINES = [
  "<!doctype html>",
  "<html>",
  "  <head>",
  "    <title>Hello, web</title>",
  "    <link rel=\"stylesheet\" href=\"style.css\">",
  "  </head>",
  "  <body>",
  "    <h1>Hello, world!</h1>",
  "    <button id=\"go\">Click me</button>",
  "    <script>",
  "      go.onclick = () => alert(\"It works!\");",
  "    </script>",
  "  </body>",
  "</html>",
];

export function codeScreen() {
  const w = 512;
  const h = 320;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d")!;
  const texture = new CanvasTexture(c);
  texture.colorSpace = SRGBColorSpace;
  const colour = (line: string) =>
    line.includes("<script") || line.includes("</script") ? "#c792ea" : line.trim().startsWith("<") ? "#7fdbca" : "#ffcb8b";
  /** Draw the file typed up to `chars` characters, with a blinking caret. */
  const draw = (chars: number, caret: boolean) => {
    frame(g, w, h, "index.html");
    g.font = "15px ui-monospace, monospace";
    let left = chars;
    let y = 50;
    for (let i = 0; i < CODE_LINES.length && left >= 0; i++) {
      const line = CODE_LINES[i];
      const shown = line.slice(0, left);
      g.fillStyle = "#3d4a73";
      g.fillText(String(i + 1).padStart(2, " "), 10, y);
      g.fillStyle = colour(line);
      g.fillText(shown, 40, y);
      if (left <= line.length && caret) {
        g.fillStyle = "#e8ecff";
        g.fillRect(40 + g.measureText(shown).width + 1, y - 13, 8, 16);
      }
      left -= line.length + 1;
      y += 19;
    }
    texture.needsUpdate = true;
  };
  const total = CODE_LINES.reduce((n, l) => n + l.length + 1, 0);
  draw(total, false);
  return { texture, draw, total };
}

export function dashboardScreen() {
  return canvas(512, 320, (g) => {
    frame(g, 512, 320, "analytics · dashboard");
    const r = rand(7);
    for (let i = 0; i < 3; i++) {
      g.fillStyle = PANEL;
      g.fillRect(14 + i * 165, 40, 152, 62);
      g.fillStyle = TEXT;
      g.font = "11px ui-monospace, monospace";
      g.fillText(["Sessions", "Bookings", "Conversion"][i], 24 + i * 165, 60);
      g.fillStyle = "#e8ecff";
      g.font = "600 24px ui-sans-serif, system-ui";
      g.fillText(["12.4k", "3,210", "4.8%"][i], 24 + i * 165, 90);
    }
    g.fillStyle = PANEL;
    g.fillRect(14, 114, 484, 192);
    g.strokeStyle = ACCENT;
    g.lineWidth = 3;
    g.beginPath();
    let y = 250;
    for (let x = 0; x <= 460; x += 20) {
      y = Math.max(140, Math.min(290, y - 6 + r() * 14 - 3));
      if (x === 0) g.moveTo(26 + x, y);
      else g.lineTo(26 + x, y);
    }
    g.stroke();
    g.fillStyle = "rgba(111,140,255,0.15)";
    g.lineTo(486, 300);
    g.lineTo(26, 300);
    g.fill();
  });
}

export function mapScreen() {
  return canvas(512, 320, (g) => {
    frame(g, 512, 320, "map · projects nearby");
    g.fillStyle = "#101a2e";
    g.fillRect(0, 26, 512, 294);
    g.strokeStyle = "#1e2c4a";
    g.lineWidth = 2;
    const r = rand(11);
    for (let i = 0; i < 9; i++) {
      g.beginPath();
      g.moveTo(r() * 512, 26);
      g.bezierCurveTo(r() * 512, 120, r() * 512, 220, r() * 512, 320);
      g.stroke();
    }
    g.strokeStyle = "#2b5f8f";
    g.lineWidth = 9;
    g.beginPath();
    g.moveTo(0, 230);
    g.bezierCurveTo(140, 180, 300, 300, 512, 210);
    g.stroke();
    for (let i = 0; i < 7; i++) {
      const x = 40 + r() * 430;
      const y = 60 + r() * 230;
      g.fillStyle = i % 3 === 0 ? WARM : ACCENT;
      g.beginPath();
      g.arc(x, y, 9, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = "#0b1020";
      g.font = "600 10px ui-sans-serif";
      g.fillText(String(1 + (i % 5)), x - 3, y + 4);
    }
  });
}

export function chartScreen() {
  return canvas(512, 320, (g) => {
    frame(g, 512, 320, "reports · weekly");
    const r = rand(23);
    for (let i = 0; i < 12; i++) {
      const hgt = 60 + r() * 190;
      g.fillStyle = i === 8 ? WARM : ACCENT;
      g.globalAlpha = i === 8 ? 1 : 0.75;
      g.fillRect(28 + i * 39, 300 - hgt, 24, hgt);
    }
    g.globalAlpha = 1;
  });
}

export function formScreen() {
  return canvas(512, 320, (g) => {
    frame(g, 512, 320, "booking · new appointment");
    const labels = ["Client", "Service", "Staff", "Date & time"];
    labels.forEach((l, i) => {
      g.fillStyle = TEXT;
      g.font = "12px ui-sans-serif, system-ui";
      g.fillText(l, 24, 54 + i * 58);
      g.strokeStyle = LINE;
      g.lineWidth = 2;
      g.strokeRect(24, 62 + i * 58, 300, 28);
    });
    g.fillStyle = ACCENT;
    g.fillRect(352, 262, 136, 36);
    g.fillStyle = "#fff";
    g.font = "600 14px ui-sans-serif, system-ui";
    g.fillText("Confirm", 392, 285);
    // a small calendar on the right
    for (let i = 0; i < 20; i++) {
      g.fillStyle = [3, 7, 12, 16].includes(i) ? WARM : PANEL;
      g.fillRect(352 + (i % 4) * 34, 54 + Math.floor(i / 4) * 38, 28, 30);
    }
  });
}

/** Storefront-style product UI for the stage-two town. */
export function productScreen(seed: number) {
  return canvas(256, 320, (g) => {
    const r = rand(seed);
    g.fillStyle = "#0f1426";
    g.fillRect(0, 0, 256, 320);
    g.fillStyle = seed % 2 ? ACCENT : WARM;
    g.fillRect(0, 0, 256, 34);
    for (let i = 0; i < 4; i++) {
      const x = 14 + (i % 2) * 120;
      const y = 48 + Math.floor(i / 2) * 132;
      g.fillStyle = "#1a2342";
      g.fillRect(x, y, 108, 120);
      g.fillStyle = `hsl(${200 + r() * 80}, 45%, ${35 + r() * 20}%)`;
      g.fillRect(x + 8, y + 8, 92, 62);
      g.fillStyle = TEXT;
      g.fillRect(x + 8, y + 80, 70, 7);
      g.fillStyle = "#e8ecff";
      g.fillRect(x + 8, y + 96, 44, 9);
    }
  });
}

/** Lit and unlit office windows; tiled across building faces. */
export function windowsTexture() {
  const t = canvas(64, 128, (g) => {
    g.fillStyle = "#000";
    g.fillRect(0, 0, 64, 128);
    const r = rand(5);
    for (let y = 0; y < 16; y++)
      for (let x = 0; x < 8; x++) {
        const lit = r();
        if (lit < 0.45) continue;
        g.fillStyle = lit > 0.93 ? "#ffd9a0" : lit > 0.7 ? "#9fc2ff" : "#3a4a7a";
        g.fillRect(x * 8 + 2, y * 8 + 2, 4, 5);
      }
  });
  t.wrapS = t.wrapT = RepeatWrapping;
  return t;
}

/** Soft puffy cloud sprite (alpha in the red channel is not needed: drawn white on transparent). */
export function cloudTexture() {
  return canvas(256, 128, (g) => {
    const r = rand(3);
    for (let i = 0; i < 22; i++) {
      const x = 40 + r() * 176;
      const y = 50 + r() * 40;
      const rad = 18 + r() * 34;
      const grad = g.createRadialGradient(x, y, 0, x, y, rad);
      grad.addColorStop(0, "rgba(255,255,255,0.55)");
      grad.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = grad;
      g.beginPath();
      g.arc(x, y, rad, 0, Math.PI * 2);
      g.fill();
    }
  });
}

export function glowTexture() {
  return canvas(64, 64, (g) => {
    const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, "rgba(255,255,255,1)");
    grad.addColorStop(0.25, "rgba(255,255,255,0.55)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 64, 64);
  });
}
