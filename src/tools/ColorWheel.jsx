import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  fetchColorName,
  formatColor,
  hexToRgb,
  hslToHex,
  normalizeHex,
  parseRgb,
  readableText,
  rgbToHex,
  rgbToHsl,
} from "./colorUtils";

const HARMONIES = {
  analogous: {
    label: "Analogous",
    offsets: [-30, 0, 30],
  },
  complementary: {
    label: "Complementary",
    offsets: [0, 180],
  },
  triadic: {
    label: "Triadic",
    offsets: [0, 120, 240],
  },
  tetradic: {
    label: "Tetradic",
    offsets: [0, 90, 180, 270],
  },
  monochrome: {
    label: "Monochrome",
    lights: [-18, -8, 0, 10, 20],
  },
};

function SlidingTabs({ items, value, onChange }) {
  const tabRefs = useRef({});
  const [sliderStyle, setSliderStyle] = useState({
    width: 0,
    height: 0,
    x: 0,
    y: 0,
    opacity: 0,
  });

  const updateSlider = useCallback(() => {
    const activeButton = tabRefs.current[value];
    if (!activeButton) return;

    setSliderStyle({
      width: activeButton.offsetWidth,
      height: activeButton.offsetHeight,
      x: activeButton.offsetLeft,
      y: activeButton.offsetTop,
      opacity: 1,
    });
  }, [value]);

  useLayoutEffect(() => {
    updateSlider();
  }, [updateSlider]);

  useEffect(() => {
    updateSlider();
    window.addEventListener("resize", updateSlider);

    return () => window.removeEventListener("resize", updateSlider);
  }, [updateSlider]);

  return (
    <div className="relative inline-flex flex-wrap gap-1 rounded-xl bg-(--adech-nav-bg) p-1 text-(--adech-nav-fg)">
      <span
        className="pointer-events-none absolute left-0 top-0 rounded-lg bg-(--adech-nav-bg-active) transition-all duration-300 ease-out"
        style={{
          width: `${sliderStyle.width}px`,
          height: `${sliderStyle.height}px`,
          transform: `translate(${sliderStyle.x}px, ${sliderStyle.y}px)`,
          opacity: sliderStyle.opacity,
        }}
      />

      {items.map((item) => (
        <button
          key={item.id}
          ref={(node) => {
            if (node) tabRefs.current[item.id] = node;
          }}
          type="button"
          onClick={() => onChange(item.id)}
          className={[
            "relative z-10 rounded-lg px-3 py-1 text-sm font-semibold transition",
            value === item.id ? "text-(--adech-nav-fg-active)" : "text-(--adech-nav-fg)",
          ].join(" ")}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

function PaletteSwatch({ hex, format, isFirst, isLast }) {
  const [name, setName] = useState(hex);
  const [copied, setCopied] = useState(false);
  const textColor = readableText(hex);
  const value = formatColor(hex, format);

  useEffect(() => {
    const controller = new AbortController();

    fetchColorName(hex, controller.signal).then(setName);

    return () => controller.abort();
  }, [hex]);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 900);
    } catch {
      // noop
    }
  };

  return (
    <button
      type="button"
      onClick={onCopy}
      className={[
        "group relative h-32 overflow-hidden text-left transition cursor-pointer",
        "focus:outline-none focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-(--adech-nav-bg-active)",
        isFirst ? "rounded-t-lg sm:rounded-l-lg sm:rounded-tr-none" : "",
        isLast ? "rounded-b-lg sm:rounded-r-lg sm:rounded-bl-none" : "",
      ].join(" ")}
      style={{ backgroundColor: hex, color: textColor }}
      title={`Copy ${value}`}
    >
      <div className="absolute inset-0 flex flex-col justify-between p-3">
        <div className="flex items-start justify-between gap-2">
          <p className="truncate text-xs opacity-80">{value}</p>
          <p
            className={[
              "rounded-full px-2 py-1 text-[11px] font-medium ring-1 transition",
              copied
                ? "opacity-100"
                : "opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0",
            ].join(" ")}
            style={{ borderColor: `${textColor}55`, backgroundColor: `${textColor}12` }}
          >
            {copied ? "Copied" : "Copy"}
          </p>
        </div>

        <div>
          <p className="text-xs font-medium">{hex}</p>
          <p className="truncate text-sm font-semibold">{name}</p>
        </div>
      </div>
    </button>
  );
}

function hsvToHex({ h, s, v }) {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0;
  let g = 0;
  let b = 0;

  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];

  return rgbToHex({
    r: (r + m) * 255,
    g: (g + m) * 255,
    b: (b + m) * 255,
  });
}

export default function ColorWheel() {
  const wheelRef = useRef(null);
  const diskRef = useRef(null);
  const [hexInput, setHexInput] = useState("#A1C4FF");
  const [rgbInput, setRgbInput] = useState("161, 196, 255");
  const [format, setFormat] = useState("hex");
  const [harmony, setHarmony] = useState("analogous");
  const [dragging, setDragging] = useState(false);
  const [pickerPoint, setPickerPoint] = useState({ x: 52, y: 28 });

  const baseHex = useMemo(() => {
    if (format === "rgb") {
      const rgb = parseRgb(rgbInput);
      return rgb ? rgbToHex(rgb) : "#A1C4FF";
    }

    return normalizeHex(hexInput) || "#A1C4FF";
  }, [format, hexInput, rgbInput]);

  const baseHsl = useMemo(() => rgbToHsl(hexToRgb(baseHex)), [baseHex]);
  const colors = useMemo(() => {
    const config = HARMONIES[harmony];

    if (config.lights) {
      return config.lights.map((lightOffset) =>
        hslToHex({
          ...baseHsl,
          l: Math.max(8, Math.min(92, baseHsl.l + lightOffset)),
        })
      );
    }

    return config.offsets.map((offset) =>
      hslToHex({
        ...baseHsl,
        h: baseHsl.h + offset,
      })
    );
  }, [baseHsl, harmony]);

  const setBaseFromHex = (hex) => {
    setHexInput(hex);
    setRgbInput(formatColor(hex, "rgb").replace(/[^\d,\s]/g, ""));
  };

  const pickHueFromRing = (event) => {
    const rect = wheelRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = event.clientX - (rect.left + rect.width / 2);
    const y = event.clientY - (rect.top + rect.height / 2);
    const hue = (Math.atan2(y, x) * (180 / Math.PI) + 90 + 360) % 360;

    setBaseFromHex(
      hslToHex({
        h: hue,
        s: baseHsl.s,
        l: baseHsl.l,
      })
    );
  };

  const pickFromDisk = (event) => {
    const rect = diskRef.current?.getBoundingClientRect();
    if (!rect) return;

    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const radius = rect.width / 2;
    const rawX = event.clientX - cx;
    const rawY = event.clientY - cy;
    const distance = Math.sqrt(rawX ** 2 + rawY ** 2);
    const clampedDistance = Math.min(distance, radius);
    const angle = Math.atan2(rawY, rawX);
    const x = Math.cos(angle) * clampedDistance;
    const y = Math.sin(angle) * clampedDistance;
    const hue = (angle * (180 / Math.PI) + 360) % 360;
    const saturation = clampedDistance / radius;
    const value = Math.max(0.18, Math.min(1, 1 - (y / radius + 1) * 0.34));

    setPickerPoint({
      x: 50 + (x / radius) * 50,
      y: 50 + (y / radius) * 50,
    });
    setBaseFromHex(hsvToHex({ h: hue, s: saturation, v: value }));
  };

  const hueMarkerStyle = {
    transform: `rotate(${baseHsl.h}deg) translateY(-48%)`,
  };

  const diskMarkerStyle = {
    left: `${pickerPoint.x}%`,
    top: `${pickerPoint.y}%`,
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="flex flex-col gap-4">
          <div
            ref={wheelRef}
            className="relative mx-auto aspect-square w-full max-w-80 cursor-crosshair rounded-full bg-[conic-gradient(#F44,#F4D03F,#3DDC84,#46E0D2,#3478F6,#B45CFF,#F44)] p-[10%] ring-1 ring-(--adech-border)"
            onMouseDown={(event) => {
              setDragging(true);
              pickHueFromRing(event);
            }}
            onMouseMove={(event) => {
              if (dragging) pickHueFromRing(event);
            }}
            onMouseUp={() => setDragging(false)}
            onMouseLeave={() => setDragging(false)}
            onClick={pickHueFromRing}
          >
            <div
              ref={diskRef}
              className="relative h-full w-full rounded-full bg-[linear-gradient(to_bottom,rgba(255,255,255,0.22),rgba(0,0,0,0.42)),radial-gradient(circle_at_center,rgba(255,255,255,0.78)_0%,rgba(255,255,255,0.12)_32%,rgba(255,255,255,0)_62%),conic-gradient(#F44,#F4D03F,#3DDC84,#46E0D2,#3478F6,#B45CFF,#F44)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.55)]"
              onMouseDown={(event) => {
                event.stopPropagation();
                setDragging(true);
                pickFromDisk(event);
              }}
              onMouseMove={(event) => {
                if (dragging) {
                  event.stopPropagation();
                  pickFromDisk(event);
                }
              }}
              onMouseUp={(event) => {
                event.stopPropagation();
                setDragging(false);
              }}
              onClick={(event) => {
                event.stopPropagation();
                pickFromDisk(event);
              }}
            >
              <span
                className="absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-white shadow-[0_0_0_1px_rgba(0,0,0,0.35)]"
                style={{ ...diskMarkerStyle, backgroundColor: baseHex }}
              />
            </div>
            <div
              className="pointer-events-none absolute left-1/2 top-1/2 h-1/2 w-1 origin-top"
              style={hueMarkerStyle}
            >
              <span
                className="absolute -left-2.5 top-0 h-5 w-5 rounded-full ring-2 ring-white shadow-[0_0_0_1px_rgba(0,0,0,0.35)]"
                style={{ backgroundColor: baseHex }}
              />
            </div>
          </div>

          <div className="rounded-xl bg-(--adech-surface-strong) p-4 ring-1 ring-(--adech-border)">
            <SlidingTabs
              items={[
                { id: "hex", label: "HEX" },
                { id: "rgb", label: "RGB" },
              ]}
              value={format}
              onChange={setFormat}
            />

            {format === "hex" ? (
              <input
                value={hexInput}
                onChange={(event) => setHexInput(event.target.value.toUpperCase())}
                className="mt-4 h-10 w-full rounded-lg bg-(--adech-surface) px-3 text-(--adech-fg) outline-none ring-1 ring-(--adech-border)"
              />
            ) : (
              <input
                value={rgbInput}
                onChange={(event) => setRgbInput(event.target.value)}
                className="mt-4 h-10 w-full rounded-lg bg-(--adech-surface) px-3 text-(--adech-fg) outline-none ring-1 ring-(--adech-border)"
              />
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <SlidingTabs
            items={Object.entries(HARMONIES).map(([id, item]) => ({
              id,
              label: item.label,
            }))}
            value={harmony}
            onChange={setHarmony}
          />

          <div className="rounded-xl bg-(--adech-surface-strong) p-4 ring-1 ring-(--adech-border)">
            <p className="text-xs text-(--adech-muted)">Base color</p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <span
                className="h-12 w-12 rounded-lg ring-1 ring-(--adech-border)"
                style={{ backgroundColor: baseHex }}
              />
              <div>
                <p className="text-lg font-semibold text-(--adech-title)">{baseHex}</p>
                <p className="text-sm text-(--adech-paragraph)">
                  {formatColor(baseHex, "rgb")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg ring-1 ring-(--adech-border)">
        <div
          className="flex flex-col sm:grid sm:grid-flow-col sm:auto-cols-fr"
          style={{ gridTemplateColumns: `repeat(${colors.length}, minmax(0, 1fr))` }}
        >
          {colors.map((hex, index) => (
            <PaletteSwatch
              key={`${hex}-${index}`}
              hex={hex}
              format={format}
              isFirst={index === 0}
              isLast={index === colors.length - 1}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
