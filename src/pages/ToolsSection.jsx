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
    <div ref={tabsRef} className="relative inline-flex flex-wrap gap-1 rounded-lg bg-(--adech-nav-bg) p-1 text-(--adech-nav-fg)">
      <span
        className="pointer-events-none absolute left-0 top-0 rounded-md bg-(--adech-nav-bg-active) transition-all duration-300 ease-out"
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
            "relative z-10 rounded-lg px-4 py-1 text-base font-semibold whitespace-nowrap transition cursor-pointer",
            value === tab.id ? "text-(--adech-nav-fg-active)" : "text-(--adech-nav-fg)",
          ].join(" ")}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

function ToolPanel({ description, children }) {
  return (
    <div className="flex flex-col gap-8 rounded-lg bg-(--adech-nav-bg) p-4">
      <p className="max-w-2xl text-sm leading-relaxed text-(--adech-paragraph)">
        {description}
      </p>

      <div className="">{children}</div>
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

  const tools = useMemo(
    () => [
      {
        id: "contrast",
        icon: IconTarget,
        title: "Contrast Checker",
        description:
          "Check contrast relationships between colors and validate readability decisions for your interface.",
        content: <ContrastChecker />,
      },
      {
        id: "guess",
        icon: IconColorPicker,
        title: "Color Guess",
        description:
          "Guess a hidden color in HEX or RGB and use channel feedback to get closer.",
        content: <GuessColor />,
      },
      {
        id: "wheel",
        icon: IconPalette,
        title: "Color Wheel",
        description:
          "Pick a base color and generate analogous, complementary, triadic, tetradic, and monochrome palettes.",
        content: <ColorWheel />,
      },
      {
        id: "picker",
        icon: IconPhotoSearch,
        title: "Color Picker",
        description:
          "Sample a color from an uploaded photo or use the browser screen picker when available.",
        content: <ColorPicker />,
      },
    ],
    []
  );

  const activeTool = tools.find((tool) => tool.id === tab) || tools[0];

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
          <ToolPanel icon={activeTool.icon} title={activeTool.title} description={activeTool.description}>
            {tools.map((tool) => (
              <div
                key={tool.id}
                className={tool.id === tab ? "animate-tabEnter" : "hidden"}
              >
                {tool.content}
              </div>
            ))}
          </ToolPanel>
        </div>
      </div>

    </section>
  );
}
