import { useMemo, useState } from "react";

function hexToRgb(hex) {
  const c = hex.replace("#", "").trim();
  if (c.length !== 6) return null;
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  if ([r, g, b].some((n) => Number.isNaN(n))) return null;
  return { r, g, b };
}

function srgbToLinear(v) {
  const s = v / 255;
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

function luminance({ r, g, b }) {
  const R = srgbToLinear(r);
  const G = srgbToLinear(g);
  const B = srgbToLinear(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function contrastRatio(hexA, hexB) {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  if (!a || !b) return null;

  const L1 = luminance(a);
  const L2 = luminance(b);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);

  return (lighter + 0.05) / (darker + 0.05);
}

function passLabel(ratio, size = "normal") {
  if (ratio == null) return { aa: false, aaa: false };

  const aa = size === "large" ? ratio >= 3 : ratio >= 4.5;
  const aaa = size === "large" ? ratio >= 4.5 : ratio >= 7;
  return { aa, aaa };
}

function Pill({ ok, children }) {
  return (
    <span
      className={[
        "rounded-full px-3 py-1 text-xs ring-1",
        ok
          ? "bg-(--adech-nav-bg-active) text-(--adech-nav-fg-active) ring-(--adech-nav-bg-active)"
          : "bg-(--adech-surface) text-(--adech-muted) ring-(--adech-border)",
      ].join(" ")}
    >
      {children}
    </span>
  );
}

export default function ContrastChecker() {
  const [fg, setFg] = useState("#F6F8FE");
  const [bg, setBg] = useState("#091A2B");
  const [size, setSize] = useState("normal");

  const ratio = useMemo(() => contrastRatio(fg, bg), [fg, bg]);
  const passes = useMemo(() => passLabel(ratio, size), [ratio, size]);
  const formatted = ratio ? ratio.toFixed(2) : "—";

  const onSwap = () => {
    setFg(bg);
    setBg(fg);
  };

  const copyResult = async () => {
    const text = `Foreground: ${fg}\nBackground: ${bg}\nContrast: ${formatted}:1\nSize: ${size}`;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Niente
    }
  };

  return (
    <div className="">
      <div className="flex items-start justify-between gap-6 flex-wrap">

        <button
          onClick={copyResult}
          className="text-sm text-(--adech-title) transition"
          type="button"
        >
          Copy result
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-(--adech-paragraph)">Foreground</label>
              <div className="mt-2 flex items-center gap-2">
                <input
                  value={fg}
                  onChange={(e) => setFg(e.target.value)}
                  className="h-10 w-full rounded-lg bg-(--adech-surface-strong) px-3 text-(--adech-fg) outline-none ring-1 ring-(--adech-border)"
                  placeholder="#F6F8FE"
                />
                <input
                  type="color"
                  value={fg}
                  onChange={(e) => setFg(e.target.value)}
                  className="h-10 w-12 rounded-lg bg-(--adech-surface-strong)"
                  aria-label="Pick foreground color"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-(--adech-paragraph)">Background</label>
              <div className="mt-2 flex items-center gap-2">
                <input
                  value={bg}
                  onChange={(e) => setBg(e.target.value)}
                  className="h-10 w-full rounded-lg bg-(--adech-surface-strong) px-3 text-(--adech-fg) outline-none ring-1 ring-(--adech-border)"
                  placeholder="#091A2B"
                />
                <input
                  type="color"
                  value={bg}
                  onChange={(e) => setBg(e.target.value)}
                  className="h-10 w-12 rounded-lg bg-(--adech-surface-strong)"
                  aria-label="Pick background color"
                />
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSize("normal")}
                className={[
                  "h-9 px-4 rounded-lg text-sm transition",
                  size === "normal"
                    ? "bg-(--adech-nav-bg-active) text-(--adech-nav-fg-active) ring-1 ring-(--adech-nav-bg-active)"
                    : "text-(--adech-paragraph) hover:bg-(--adech-surface-strong) hover:text-(--adech-title)",
                ].join(" ")}
              >
                Normal text
              </button>
              <button
                type="button"
                onClick={() => setSize("large")}
                className={[
                  "h-9 px-4 rounded-lg text-sm transition",
                  size === "large"
                    ? "bg-(--adech-nav-bg-active) text-(--adech-nav-fg-active) ring-1 ring-(--adech-nav-bg-active)"
                    : "text-(--adech-paragraph) hover:bg-(--adech-surface-strong) hover:text-(--adech-title)",
                ].join(" ")}
              >
                Large text
              </button>
            </div>

            <button
              onClick={onSwap}
              className="h-10 rounded-xl bg-(--adech-surface-strong) px-4 text-sm text-(--adech-title) ring-1 ring-(--adech-border) transition hover:bg-(--adech-surface-muted)"
              type="button"
            >
              Swap
            </button>
          </div>
        </div>

        <div className="overflow-hidden">
          <div className="rounded-t-xl p-5" style={{ backgroundColor: bg, color: fg }}>
            <p className="text-xs opacity-80">Preview</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight">
              Contrast {formatted}:1
            </p>
            <p className="mt-3 text-sm opacity-90 max-w-md">
              The quick brown fox jumps over the lazy dog. 0123456789
            </p>

            <div className="mt-5 flex items-center gap-2 flex-wrap">
              <span
                className="rounded-full px-3 py-1 text-xs ring-1"
                style={{
                  borderColor: `${fg}55`,
                  backgroundColor: `${fg}12`,
                  color: fg,
                }}
              >
                FG {fg.toUpperCase()}
              </span>
              <span
                className="rounded-full px-3 py-1 text-xs ring-1"
                style={{
                  borderColor: `${fg}55`,
                  backgroundColor: `${fg}12`,
                  color: fg,
                }}
              >
                BG {bg.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-b-xl border-t border-(--adech-border) bg-(--adech-surface-strong) p-4">
            <div className="flex items-center gap-2 flex-wrap">
              <Pill ok={passes.aa}>AA</Pill>
              <Pill ok={passes.aaa}>AAA</Pill>
              <span className="text-xs text-(--adech-muted)">
                ({size === "large" ? "large" : "normal"} text)
              </span>
            </div>

            <span className="text-xs text-(--adech-muted)">
              {ratio ? "WCAG contrast ratio" : "Invalid HEX"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
