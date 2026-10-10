import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import CopyButton from "./CopyButton";

function CodeBlock({ title, code, tabKey }) {
  return (
    <div className="w-full overflow-hidden rounded-xl bg-(--adech-nav-bg)">
      <div className="flex items-center justify-between border-b border-(--adech-bg) px-4 py-3">
        <p className="text-xs font-medium text-(--adech-nav-fg)">{title}</p>
        <CopyButton value={code} title="Copy code" ariaLabel="Copy code" />
      </div>

      <div key={tabKey} className="animate-tabEnter">
        <pre className="overflow-x-auto px-4 py-4 text-xs leading-relaxed text-(--adech-nav-fg)">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}

function InstallPreview() {
  const tabs = useMemo(
    () => [
      { id: "npm", label: "npm", title: "Install with npm", code: "npm install @adech/themes" },
      { id: "pnpm", label: "pnpm", title: "Install with pnpm", code: "pnpm add @adech/themes" },
      { id: "yarn", label: "yarn", title: "Install with yarn", code: "yarn add @adech/themes" },
      { id: "bun", label: "bun", title: "Install with bun", code: "bun add @adech/themes" },
    ],
    []
  );

  const [tab, setTab] = useState("npm");
  const tabsContainerRef = useRef(null);
  const tabRefs = useRef({});
  const [sliderStyle, setSliderStyle] = useState({
    width: 0,
    height: 0,
    x: 0,
    y: 0,
    opacity: 0,
  });

  const activeTab = useMemo(
    () => tabs.find((item) => item.id === tab) || tabs[0],
    [tab, tabs]
  );

  const updateSlider = useCallback(() => {
    const activeButton = tabRefs.current[tab];
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
  }, [tab]);

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
      if (tabsContainerRef.current) observer.observe(tabsContainerRef.current);
      if (tabRefs.current[tab]) observer.observe(tabRefs.current[tab]);
    }

    if (document.fonts?.ready) {
      document.fonts.ready.then(scheduleUpdate);
    }

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", scheduleUpdate);
      observer?.disconnect();
    };
  }, [updateSlider, tab]);

  return (
    <section id="docs" className="flex w-full min-w-0 flex-col gap-4">
      <div className="flex flex-col gap-2">
        <div className="flex w-full min-w-0 flex-col gap-1">
          <div className="w-full min-w-0">
            <div ref={tabsContainerRef} className="relative inline-flex max-w-full flex-wrap gap-1 rounded-lg bg-(--adech-nav-bg) p-1">
              <span
              className="pointer-events-none absolute left-0 top-0 rounded-md bg-(--adech-nav-bg-active) transition-all duration-300 ease-out"
              style={{
                width: `${sliderStyle.width}px`,
                height: `${sliderStyle.height}px`,
                transform: `translate(${sliderStyle.x}px, ${sliderStyle.y}px)`,
                opacity: sliderStyle.opacity,
              }}
              />

              {tabs.map((item) => (
                <button
                  key={item.id}
                  ref={(node) => {
                    if (node) tabRefs.current[item.id] = node;
                  }}
                  type="button"
                  onClick={() => setTab(item.id)}
                  className={[
                    "relative z-10 rounded-lg px-4 py-1 text-sm font-semibold whitespace-nowrap transition cursor-pointer",
                    item.id === tab
                    ? "text-(--adech-nav-fg-active)"
                    : "text-(--adech-nav-fg)",
                    ].join(" ")}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="w-full min-w-0">
            <CodeBlock title={activeTab.title} code={activeTab.code} tabKey={tab} />
          </div>
        </div>
      </div>
      <p className="text-sm text-(--adech-hero-paragraph)">
        Start by installing the package. The full docs show how to use Adech
        Themes with Tailwind, CSS variables, JSON exports, and presets.
      </p>
    </section>
  );
}

export default function Hero({ activeTab, onChangeTab }) {
  const goTo = (nextTab) => {
    if (nextTab !== activeTab) {
      onChangeTab(nextTab);
    }
  };

  return (
    <section className="flex min-w-0 flex-col items-start gap-8 sm:grid sm:grid-cols-2 sm:items-start">
      <div className="mx-auto flex w-full min-w-0 flex-col gap-3 self-start">
        <p className="text-sm font-medium uppercase tracking-widest text-(--adech-hero-subtitle)">
          Portable tokens for interfaces
        </p>

        <h1 className="text-4xl font-semibold">
          Loneliness and introspection
        </h1>

        <p className="text-sm text-(--adech-hero-paragraph) sm:text-base">
          Adech Themes is a portable theme ecosystem built around reusable branches for
          interfaces and workspaces. Install the package, then head into the docs
          when you are ready to wire the tokens into your stack.
        </p>

        <div className="flex flex-wrap items-center justify-start gap-3">
          <button type="button" onClick={() => goTo("docs")} className="rounded-lg bg-(--adech-hero-bg-button) px-4 py-2 text-sm font-medium text-(--adech-hero-fg-button) cursor-pointer">
            Read documentation
          </button>

          <button type="button" onClick={() => goTo("branches")} className="text-sm font-medium text-(--adech-hero-subtitle) cursor-pointer">
            Meet the Branches
          </button>
        </div>
      </div>

      <div className="w-full min-w-0 self-start">
        <InstallPreview onReadDocs={() => goTo("docs")} />
      </div>
    </section>
  );
}
