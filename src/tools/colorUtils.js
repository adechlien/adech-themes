export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function componentToHex(value) {
  return clamp(Math.round(value), 0, 255).toString(16).padStart(2, "0").toUpperCase();
}

export function rgbToHex({ r, g, b }) {
  return `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`;
}

export function normalizeHex(value) {
  const clean = String(value).replace("#", "").trim();

  if (/^[0-9a-fA-F]{3}$/.test(clean)) {
    return `#${clean.split("").map((char) => char + char).join("").toUpperCase()}`;
  }

  if (/^[0-9a-fA-F]{6}$/.test(clean)) {
    return `#${clean.toUpperCase()}`;
  }

  return null;
}

export function hexToRgb(value) {
  const hex = normalizeHex(value);
  if (!hex) return null;

  return {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  };
}

export function parseRgb(value) {
  const parts = String(value)
    .replace(/[^\d,\s]/g, "")
    .split(/[,\s]+/)
    .filter(Boolean)
    .map(Number);

  if (parts.length !== 3 || parts.some((part) => Number.isNaN(part))) return null;

  return {
    r: clamp(parts[0], 0, 255),
    g: clamp(parts[1], 0, 255),
    b: clamp(parts[2], 0, 255),
  };
}

export function rgbToCss({ r, g, b }) {
  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}

export function formatColor(hex, format = "hex") {
  const rgb = hexToRgb(hex);
  if (!rgb) return "";

  return format === "rgb" ? rgbToCss(rgb) : rgbToHex(rgb);
}

export function readableText(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return "#F6F8FE";

  const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  return brightness > 128 ? "#1E2646" : "#F6F8FE";
}

export function randomHex() {
  return rgbToHex({
    r: Math.random() * 256,
    g: Math.random() * 256,
    b: Math.random() * 256,
  });
}

export function rgbToHsl({ r, g, b }) {
  const nr = r / 255;
  const ng = g / 255;
  const nb = b / 255;
  const max = Math.max(nr, ng, nb);
  const min = Math.min(nr, ng, nb);
  const delta = max - min;
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1));

    if (max === nr) h = 60 * (((ng - nb) / delta) % 6);
    if (max === ng) h = 60 * ((nb - nr) / delta + 2);
    if (max === nb) h = 60 * ((nr - ng) / delta + 4);
  }

  return {
    h: (h + 360) % 360,
    s: s * 100,
    l: l * 100,
  };
}

export function hslToRgb({ h, s, l }) {
  const ns = clamp(s, 0, 100) / 100;
  const nl = clamp(l, 0, 100) / 100;
  const c = (1 - Math.abs(2 * nl - 1)) * ns;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = nl - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;

  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];

  return {
    r: (r + m) * 255,
    g: (g + m) * 255,
    b: (b + m) * 255,
  };
}

export function hslToHex(hsl) {
  return rgbToHex(hslToRgb({ ...hsl, h: ((hsl.h % 360) + 360) % 360 }));
}

const colorNameCache = new Map();

export async function fetchColorName(hex, signal) {
  const key = normalizeHex(hex);
  if (!key) return "";
  if (colorNameCache.has(key)) return colorNameCache.get(key);

  try {
    const clean = key.replace("#", "");
    const res = await fetch(`https://www.thecolorapi.com/id?hex=${clean}`, {
      signal,
    });

    if (!res.ok) throw new Error("Color API failed");

    const data = await res.json();
    const name = data?.name?.value || key;

    colorNameCache.set(key, name);
    return name;
  } catch {
    return key;
  }
}
