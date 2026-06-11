import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { IconCheck, IconCopy, IconHelpCircle } from "@tabler/icons-react";
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
    lightStops: [12, 28, 44, 60, 76],
  },
};

function SlidingTabs({ items, value, onChange, noWrap = false }) {
  const tabsRef = useRef(null);
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

    if (!activeButton.offsetWidth || !activeButton.offsetHeight) {
      setSliderStyle((current) => ({ ...current, opacity: 0 }));
      return;
    }

    setSliderStyle({
      width: activeButton.offsetWidth,
      height: activeButton.offsetHeight,
      x: activeButton.offsetLeft,
      y: activeButton.offsetTop,
      opacity: 1,
    });
  }, [value]);

  useLayoutEffect(() => {
    const frame = requestAnimationFrame(updateSlider);
    return () => cancelAnimationFrame(frame);
  }, [updateSlider]);

  useEffect(() => {
    let frame = 0;
    const scheduleUpdate = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(updateSlider);
    };

    scheduleUpdate();
    window.addEventListener("resize", scheduleUpdate);

    const observer =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(scheduleUpdate)
        : null;

    if (observer) {
      if (tabsRef.current) observer.observe(tabsRef.current);
      if (tabRefs.current[value]) observer.observe(tabRefs.current[value]);
    }

    if (document.fonts?.ready) {
      document.fonts.ready.then(scheduleUpdate);
    }

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", scheduleUpdate);
      observer?.disconnect();
    };
  }, [updateSlider, value]);

  return (
    <div
      ref={tabsRef}
      className={[
        "relative inline-flex gap-1 rounded-xl bg-(--adech-nav-bg) text-(--adech-nav-fg)",
        noWrap ? "flex-nowrap" : "flex-wrap",
      ].join(" ")}
    >
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

function WheelInfo() {
  return (
    <div className="group relative">
      <button type="button" className="inline-flex h-8 w-8 cursor-pointer items-center justify-center text-(--adech-title)" aria-label="Explain color wheel">
        <IconHelpCircle size={18} stroke={2} />
      </button>
      <p className="pointer-events-none absolute right-0 top-[calc(100%+0.5rem)] z-10 w-72 rounded-lg bg-(--adech-surface) p-3 text-left text-xs leading-relaxed text-(--adech-paragraph) opacity-0 shadow-lg transition group-hover:opacity-100 group-focus-within:opacity-100">
        The color field adjusts saturation and brightness. The bar below changes
        hue. Harmony tabs generate related colors from the selected base.
      </p>
    </div>
  );
}

function PaletteSwatch({ hex, format, isBase, isFirst, isLast }) {
  const [name, setName] = useState(hex);
  const [copyState, setCopyState] = useState("idle");
  const timeoutRef = useRef(null);
  const textColor = readableText(hex);
  const value = formatColor(hex, format);

  useEffect(() => {
    const controller = new AbortController();

    fetchColorName(hex, controller.signal).then(setName);

    return () => controller.abort();
  }, [hex]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);

      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      setCopyState("copied");
      timeoutRef.current = setTimeout(() => {
        setCopyState("idle");
      }, 1200);
    } catch {
      // noop
    }
  };

  const showCopyIcon = copyState === "idle";
  const showCheckIcon = copyState === "copied";

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
      aria-label={`Copy ${value}`}
    >
      <div className="absolute inset-0 flex flex-col justify-between p-3">
        <div className="flex items-start justify-between gap-2">
          {isBase ? (<span className="text-xs font-black">Base</span>) : (<span />)}

          <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
            <span
              className={[
                "absolute inset-0 flex items-center justify-center transition-all duration-300",
                showCopyIcon
                  ? "opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0"
                  : "opacity-0 pointer-events-none",
              ].join(" ")}
            >
              <IconCopy stroke={2} size={16} />
            </span>

            <span
              className={[
                "absolute inset-0 flex items-center justify-center transition-all duration-200",
                showCheckIcon
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-1 pointer-events-none",
              ].join(" ")}
            >
              <IconCheck stroke={2} size={16} />
            </span>
          </span>
        </div>

        <div>
          <p className="text-xs font-medium">{value}</p>
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
  const colorAreaRef = useRef(null);
  const hueBarRef = useRef(null);
  const [hexInput, setHexInput] = useState("#A1C4FF");
  const [rgbInput, setRgbInput] = useState("161, 196, 255");
  const [format, setFormat] = useState("hex");
  const [harmony, setHarmony] = useState("analogous");
  const [dragTarget, setDragTarget] = useState(null);
  const [selector, setSelector] = useState({ h: 216, s: 0.37, v: 1 });

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

    if (config.lightStops) {
      const lightStops = [
        Math.max(8, baseHsl.l - 28),
        Math.max(8, baseHsl.l - 14),
        baseHsl.l,
        Math.min(92, baseHsl.l + 14),
        Math.min(92, baseHsl.l + 28),
      ];

      return [
        ...new Set(
          lightStops.map((light) =>
            hslToHex({
              ...baseHsl,
              l: light,
            })
          )
        ),
      ];
    }

    return [
      ...new Set(
        config.offsets.map((offset) =>
          hslToHex({
            ...baseHsl,
            h: baseHsl.h + offset,
          })
        )
      ),
    ];
  }, [baseHsl, harmony]);

  const setBaseFromHex = (hex) => {
    setHexInput(hex);
    setRgbInput(formatColor(hex, "rgb").replace(/[^\d,\s]/g, ""));
  };

  const syncSelectorFromHex = (hex) => {
    const rgb = hexToRgb(hex);
    if (!rgb) return;

    const hsl = rgbToHsl(rgb);
    setSelector((current) => ({
      ...current,
      h: hsl.h,
      s: hsl.s / 100,
      v: Math.min(1, Math.max(0, hsl.l / 85)),
    }));
  };

  const applySelector = (nextSelector) => {
    setSelector(nextSelector);
    setBaseFromHex(hsvToHex(nextSelector));
  };

  const pickHue = (event) => {
    const rect = hueBarRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = Math.min(Math.max(event.clientX - rect.left, 0), rect.width);
    applySelector({
      ...selector,
      h: (x / rect.width) * 360,
    });
  };

  const pickFromArea = (event) => {
    const rect = colorAreaRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = Math.min(Math.max(event.clientX - rect.left, 0), rect.width);
    const y = Math.min(Math.max(event.clientY - rect.top, 0), rect.height);

    applySelector({
      ...selector,
      s: x / rect.width,
      v: 1 - y / rect.height,
    });
  };

  const areaMarkerStyle = {
    left: `${selector.s * 100}%`,
    top: `${(1 - selector.v) * 100}%`,
  };

  const hueMarkerStyle = {
    left: `${(selector.h / 360) * 100}%`,
  };

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[400px_minmax(0,1fr)]">
      <div className="flex items-start justify-center xl:justify-start">
        <div className="flex w-full max-w-[440px] flex-col gap-3">
          <div ref={colorAreaRef} className="relative h-64 cursor-crosshair overflow-hidden rounded-xl ring-1 ring-(--adech-border)" style={{ background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, transparent), hsl(${selector.h}, 100%, 50%)` }} onMouseDown={(event) => { setDragTarget("area"); pickFromArea(event); }} onMouseMove={(event) => { if (dragTarget === "area") pickFromArea(event); }} onMouseUp={() => setDragTarget(null)} onMouseLeave={() => setDragTarget(null)} onClick={pickFromArea}>
            <span className="absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-white shadow-[0_0_0_1px_rgba(0,0,0,0.35)]" style={{ ...areaMarkerStyle, backgroundColor: baseHex }}/>
          </div>
          <div ref={hueBarRef} className="relative h-5 cursor-crosshair rounded-full bg-[linear-gradient(to_right,#F00,#FF0,#0F0,#0FF,#00F,#F0F,#F00)] ring-1 ring-(--adech-border)" onMouseDown={(event) => { setDragTarget("hue"); pickHue(event); }} onMouseMove={(event) => { if (dragTarget === "hue") pickHue(event); }} onMouseUp={() => setDragTarget(null)} onMouseLeave={() => setDragTarget(null)} onClick={pickHue}>
            <span className="absolute top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-white shadow-[0_0_0_1px_rgba(0,0,0,0.35)]" style={{ ...hueMarkerStyle, backgroundColor: `hsl(${selector.h}, 100%, 50%)` }}/>
          </div>
        </div>
      </div>
      <div className="flex min-w-0 flex-col gap-2">
        <div className="min-w-0 overflow-x-auto">
          <SlidingTabs
            items={Object.entries(HARMONIES).map(([id, item]) => ({
              id,
              label: item.label,
            }))}
            value={harmony}
            onChange={setHarmony}
            noWrap
          />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
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
              onChange={(event) => {
                const nextValue = event.target.value.toUpperCase();
                setHexInput(nextValue);
                syncSelectorFromHex(nextValue);
              }}
              className="h-8 w-full rounded-lg bg-(--adech-surface) px-3 text-(--adech-fg) outline-none ring-1 ring-(--adech-border) sm:w-72"
            />
          ) : (
            <input
              value={rgbInput}
              onChange={(event) => {
                const nextValue = event.target.value;
                const rgb = parseRgb(nextValue);
                setRgbInput(nextValue);
                if (rgb) syncSelectorFromHex(rgbToHex(rgb));
              }}
              className="h-8 w-full rounded-lg bg-(--adech-surface) px-3 text-(--adech-fg) outline-none ring-1 ring-(--adech-border) sm:w-72"
            />
          )}

          <WheelInfo />
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
                isBase={hex === baseHex}
                isFirst={index === 0}
                isLast={index === colors.length - 1}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
