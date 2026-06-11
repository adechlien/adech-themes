import { useMemo, useState } from "react";
import CopyButton from "../components/CopyButton";
import { IconHelpCircle, IconReplaceFilled } from "@tabler/icons-react";

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

function ResultBadge({ label, ok }) {
  return (
    <div
      className={[
        "rounded-lg px-3 py-2 text-center",
        ok
          ? "bg-adech-venomous-1 text-adech-swamp-1"
          : "bg-(--adech-surface) text-(--adech-muted)",
      ].join(" ")}
    >
      <p className="text-xs opacity-80">{label}</p>
      <p className="text-sm font-semibold">{ok ? "Pass" : "Fail"}</p>
    </div>
  );
}

function ColorInput({ label, value, onChange }) {
  return (
    <label className="block text-xs text-(--adech-paragraph)">
      {label}
      <div className="mt-2 flex h-10 items-stretch overflow-hidden rounded-lg bg-(--adech-surface-muted) ring-1 ring-(--adech-border)">
        <input
          value={value}
          onChange={(event) => onChange(event.target.value.toUpperCase())}
          className="h-full min-w-0 flex-1 bg-transparent px-3 uppercase text-(--adech-fg) outline-none"
          placeholder="#F6F8FE"
        />
        <CopyButton
          value={value}
          title={`Copy ${label.toLowerCase()}`}
          ariaLabel={`Copy ${label.toLowerCase()}`}
          className="h-full px-3 text-(--adech-fg)"
          iconSize={16}
        />
        <div className="relative h-full w-14 shrink-0 overflow-hidden rounded-r-lg" style={{ backgroundColor: value }}>
          <input
            type="color"
            value={value}
            onChange={(event) => onChange(event.target.value.toUpperCase())}
            className="absolute inset-0 h-full w-full cursor-pointer border-0 p-0 opacity-0"
            aria-label={`Pick ${label.toLowerCase()} color`}
          />
        </div>
      </div>
    </label>
  );
}

export default function ContrastChecker() {
  const [fg, setFg] = useState("#F6F8FE");
  const [bg, setBg] = useState("#142039");
  const [size, setSize] = useState("normal");

  const ratio = useMemo(() => contrastRatio(fg, bg), [fg, bg]);
  const passes = useMemo(() => passLabel(ratio, size), [ratio, size]);
  const formatted = ratio ? ratio.toFixed(2) : "—";
  const validState = !ratio ? "Invalid HEX" : passes.aa ? "Readable" : "Low contrast";

  const onSwap = () => {
    setFg(bg);
    setBg(fg);
  };

  return (
    <div className="min-h-96 overflow-hidden rounded-lg" style={{ backgroundColor: bg, color: fg }}>
      <div className="grid min-h-96 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_400px]">
        <div className="flex min-h-72 items-center p-6 sm:p-10">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm" style={{ borderColor: `${fg}55`, color: fg }}>
                {validState}
              </span>
            </div>
            <p className="mt-2 text-4xl font-semibold tracking-tight">
              Contrast {formatted}:1
            </p>
            <p className="mt-4 max-w-xl text-base leading-relaxed opacity-90">
              Muchos años después, frente al pelotón de fusilamiento, el coronel
              Aureliano Buendía había de recordar aquella tarde remota en que su
              padre lo llevó a conocer el hielo.
            </p>
          </div>
        </div>

        <div className="bg-(--adech-bg) p-4 text-(--adech-fg)">
          <div className="flex h-full flex-col justify-between gap-4">
            <div className="flex flex-col gap-3">
              <div className="group relative self-end">
                <button
                  type="button"
                  className="inline-flex h-8 w-8 cursor-pointer items-center justify-center text-(--adech-title)"
                  aria-label="Explain contrast score"
                >
                  <IconHelpCircle size={18} stroke={2} />
                </button>
                <p className="pointer-events-none absolute right-0 top-[calc(100%+0.5rem)] z-10 w-64 rounded-lg bg-(--adech-surface) p-2 text-left text-xs leading-relaxed text-(--adech-paragraph) opacity-0 shadow-lg transition group-hover:opacity-100 group-focus-within:opacity-100">
                  The score compares relative luminance. AA needs 4.5:1 for
                  normal text or 3:1 for large text; AAA needs 7:1 or 4.5:1.
                </p>
              </div>

              <div className="flex flex-col sm:grid sm:grid-cols-2 gap-2">
                <ColorInput label="Foreground" value={fg} onChange={setFg} />
                <ColorInput label="Background" value={bg} onChange={setBg} />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSize("normal")}
                    className={[
                      "h-9 rounded-lg px-4 text-xs transition",
                      size === "normal"
                        ? "bg-(--adech-nav-bg-active) text-(--adech-nav-fg-active)"
                        : "bg-(--adech-surface) text-(--adech-paragraph)",
                    ].join(" ")}
                  >
                    ABC
                  </button>
                  <button
                    type="button"
                    onClick={() => setSize("large")}
                    className={[
                      "h-9 rounded-lg px-4 text-lg transition",
                      size === "large"
                        ? "bg-(--adech-nav-bg-active) text-(--adech-nav-fg-active)"
                        : "bg-(--adech-surface) text-(--adech-paragraph)",
                    ].join(" ")}
                  >
                    ABC
                  </button>
                </div>

                <button
                  onClick={onSwap}
                  className="inline-flex h-10 w-10 items-center justify-center text-(--adech-title) transition"
                  type="button"
                  aria-label="Swap foreground and background"
                  title="Swap foreground and background"
                >
                  <IconReplaceFilled stroke={2} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <ResultBadge label="AA" ok={passes.aa} />
              <ResultBadge label="AAA" ok={passes.aaa} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
