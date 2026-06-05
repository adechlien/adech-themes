import { useEffect, useMemo, useRef, useState } from "react";
import superior from "@adech/themes/superior/json";
import { IconCheck, IconCopy } from "@tabler/icons-react";

const PALETTE_META = {
  boulevard: {
    name: "Boulevard",
    description:
      "The city, distance, and the quiet loneliness that can exist even in a crowded world.",
  },
  venomous: {
    name: "Venomous",
    description:
      "The nature, ancient presence, and the magical force of everything we cannot fully explain.",
  },
  swamp: {
    name: "Swamp",
    description:
      "The calm, breathing space, and the quiet strength of staying with yourself.",
  },
  sunny: {
    name: "Sunny",
    description:
      "The warmth, unexpected emotion, and that quiet energy that arrives without explanation.",
  },
  void: {
    name: "Void",
    description:
      "The indifference, emptiness, and the quiet acceptance of what cannot be changed.",
  },
};

function getContrastToken(color) {
  const r = parseInt(color.substring(1, 3), 16);
  const g = parseInt(color.substring(3, 5), 16);
  const b = parseInt(color.substring(5, 7), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  return brightness > 128 ? "text-adech-swamp-1" : "text-adech-venomous-3";
}

const nameCache = new Map();

async function fetchColorName(hex, signal) {
  const key = hex.toUpperCase();
  if (nameCache.has(key)) return nameCache.get(key);

  const clean = key.replace("#", "");
  const res = await fetch(`https://www.thecolorapi.com/id?hex=${clean}`, {
    signal,
  });

  if (!res.ok) throw new Error("Failed to fetch color name");

  const data = await res.json();
  const value = data?.name?.value || key;

  nameCache.set(key, value);
  return value;
}

function Swatch({ token, hex, isFirst, isLast }) {
  const [name, setName] = useState(token);
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef(null);

  const textColorClass = useMemo(() => getContrastToken(hex), [hex]);

  useEffect(() => {
    const controller = new AbortController();

    fetchColorName(hex, controller.signal)
      .then((nextName) => setName(nextName))
      .catch(() => setName(token));

    return () => controller.abort();
  }, [hex, token]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(hex);

      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      setCopied(true);
      timeoutRef.current = setTimeout(() => setCopied(false), 1200);
    } catch {
      // noop
    }
  };

  return (
    <button
      type="button"
      onClick={onCopy}
      className={[
        "group relative h-28 overflow-hidden text-left transition cursor-pointer",
        "focus:outline-none focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-(--adech-nav-bg-active)",
        isFirst ? "rounded-t-lg sm:rounded-l-lg sm:rounded-tr-none" : "",
        isLast ? "rounded-b-lg sm:rounded-r-lg sm:rounded-bl-none" : "",
      ].join(" ")}
      style={{ backgroundColor: hex }}
      title="Click to copy HEX"
      aria-label={`Copy ${hex}`}
    >
      <div className="absolute inset-0 flex flex-col justify-between p-3">
        <div className="flex items-start justify-between gap-2">
          <p className={`truncate text-xs opacity-80 ${textColorClass}`}>
            {token}
          </p>

          <span
            className={[
              "relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
              textColorClass,
            ].join(" ")}
          >
            <span
              className={[
                "absolute inset-0 flex items-center justify-center transition-all duration-300",
                copied
                  ? "opacity-0 pointer-events-none"
                  : "opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0",
              ].join(" ")}
            >
              <IconCopy stroke={2} size={16} />
            </span>
            <span
              className={[
                "absolute inset-0 flex items-center justify-center transition-all duration-200",
                copied ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1",
              ].join(" ")}
            >
              <IconCheck stroke={2} size={16} />
            </span>
          </span>
        </div>

        <div className="flex items-end justify-between gap-3">
          <p className={`text-xs font-medium ${textColorClass}`}>
            {hex.toUpperCase()}
          </p>
          <p className={`truncate text-sm font-semibold ${textColorClass}`}>
            {name}
          </p>
        </div>
      </div>
    </button>
  );
}

function PaletteRow({ palette }) {
  const isRightAligned = palette.id === "venomous" || palette.id === "sunny";

  return (
    <section className="flex flex-col gap-4">
      <div
        className={[
          "flex flex-col",
          isRightAligned ? "items-end text-right" : "items-start text-left",
        ].join(" ")}
      >
        <h3 className="text-xl font-semibold text-(--adech-title)">
          {palette.name}
        </h3>
        <p className="max-w-xl text-sm leading-relaxed text-(--adech-paragraph)">
          {palette.description}
        </p>
      </div>

      <div className="overflow-hidden rounded-lg ring-1 ring-(--adech-border)">
        <div
          className="flex flex-col sm:grid sm:grid-flow-col sm:auto-cols-fr"
          style={{
            gridTemplateColumns: `repeat(${palette.colors.length}, minmax(0, 1fr))`,
          }}
        >
          {palette.colors.map((color, index) => (
            <Swatch
              key={color.token}
              token={color.token}
              hex={color.hex}
              isFirst={index === 0}
              isLast={index === palette.colors.length - 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function BranchesSection() {
  const palettes = useMemo(() => {
    const families = superior?.subbranches || {};

    return Object.entries(families).map(([paletteKey, scale]) => {
      const meta = PALETTE_META[paletteKey] || {
        name: paletteKey.charAt(0).toUpperCase() + paletteKey.slice(1),
        description: "Palette from the Superior theme.",
      };

      const colors = Object.entries(scale).map(([step, hex]) => ({
        token: `adech-${paletteKey}-${step}`,
        hex,
      }));

      return {
        id: paletteKey,
        name: meta.name,
        description: meta.description,
        colors,
      };
    });
  }, []);

  return (
    <section id="branches" className="flex flex-col gap-10 scroll-mt-24">
      <div className="flex items-end justify-between gap-6 flex-wrap">
        <div>
          <h2 className="text-4xl text-(--adech-title) font-bebas">
            Branches
          </h2>
          <p className="text-sm text-(--adech-paragraph) max-w-lg">
            Explore Superior through its palettes and copy the tokens directly
            from each color strip.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        {palettes.map((palette) => (
          <PaletteRow key={palette.id} palette={palette} />
        ))}
      </div>

      <p className="text-xs text-(--adech-muted) text-right">
        Click any color to copy
      </p>
    </section>
  );
}
