import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  IconPalette,
  IconTarget,
  IconColorPicker,
  IconPhotoSearch,
} from "@tabler/icons-react";
import ContrastChecker from "../tools/ContrastChecker";
import GuessColor from "../tools/GuessColor";
import ColorWheel from "../tools/ColorWheel";
import ColorPicker from "../tools/ColorPicker";

function ToolTabs({ tabs, value, onChange }) {
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

      {tabs.map((tab) => (
        <button
          key={tab.id}
          ref={(node) => {
            if (node) tabRefs.current[tab.id] = node;
          }}
          type="button"
          onClick={() => onChange(tab.id)}
          className={[
            "relative z-10 rounded-lg px-4 py-1 text-base font-semibold whitespace-nowrap transition",
            value === tab.id ? "text-(--adech-nav-fg-active)" : "text-(--adech-nav-fg)",
          ].join(" ")}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

function ToolPanel({ title, description, children }) {
  return (
    <div className="rounded-lg bg-(--adech-surface) p-6 ring-1 ring-(--adech-border)">
      <div className="flex items-start gap-4">
        <div>
          <h3 className="text-2xl font-semibold text-(--adech-title)">
            {title}
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-(--adech-paragraph)">
            {description}
          </p>
        </div>
      </div>

      <div className="mt-6">{children}</div>
    </div>
  );
}

export default function ToolsSection() {
  const tabs = useMemo(
    () => [
      { id: "contrast", label: "Contrast Checker", icon: IconTarget },
      { id: "guess", label: "Color Guess", icon: IconColorPicker },
      { id: "wheel", label: "Color Wheel", icon: IconPalette },
      { id: "picker", label: "Color Picker", icon: IconPhotoSearch },
    ],
    []
  );

  const [tab, setTab] = useState("contrast");

  const activeTool = useMemo(() => {
    switch (tab) {
      case "contrast":
        return {
          icon: IconTarget,
          title: "Contrast Checker",
          description:
            "Check contrast relationships between colors and validate readability decisions for your interface.",
          content: <ContrastChecker />,
        };

      case "guess":
        return {
          icon: IconColorPicker,
          title: "Color Guess",
          description:
            "Guess a hidden color in HEX or RGB and use channel feedback to get closer.",
          content: <GuessColor />,
        };

      case "wheel":
        return {
          icon: IconPalette,
          title: "Color Wheel",
          description:
            "Pick a base color and generate analogous, complementary, triadic, tetradic, and monochrome palettes.",
          content: <ColorWheel />,
        };

      case "picker":
        return {
          icon: IconPhotoSearch,
          title: "Color Picker",
          description:
            "Sample a color from an uploaded photo or use the browser screen picker when available.",
          content: <ColorPicker />,
        };

      default:
        return {
          icon: IconTarget,
          title: "",
          description: "",
          content: null,
        };
    }
  }, [tab]);

  return (
    <section id="tools" className="scroll-mt-24">
      <div className="flex items-end justify-between gap-6 flex-wrap">
        <div>
          <h2 className="text-4xl text-(--adech-title) font-bebas">
            Tools
          </h2>
          <p className="text-sm text-(--adech-paragraph) max-w-lg">
            A collection of color utilities to explore Adech tokens and validate
            UI decisions.
          </p>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto flex flex-col items-start gap-2">
        <ToolTabs tabs={tabs} value={tab} onChange={setTab} />
        <div className="w-full">
          <ToolPanel
            icon={activeTool.icon}
            title={activeTool.title}
            description={activeTool.description}
          >
            {activeTool.content}
          </ToolPanel>
        </div>
      </div>

    </section>
  );
}
