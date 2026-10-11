import { createElement, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { IconChevronLeft, IconChevronRight, IconUserCircle } from "@tabler/icons-react";
import { AdechIcon } from "../../components/icons/AdechIcon";

// One persistent surface morphs from access card to sidebar and compact rail.
export default function CmsShell({ name, authenticated = true, access, sections, activeSection, onSectionChange, controls, footer, children }) {
  const [collapsed, setCollapsed] = useState(false);
  const mode = authenticated ? (collapsed ? "compact" : "sidebar") : "access";
  const [displayed, setDisplayed] = useState(mode);
  const displayedRef = useRef(mode);
  const surfaceRef = useRef(null);
  const insideRef = useRef(null);
  const mainRef = useRef(null);

  useEffect(() => {
    const surface = surfaceRef.current;
    const inside = insideRef.current;
    const main = mainRef.current;
    const animateMain = displayedRef.current === "access" || mode === "access";
    let cancelled = false;
    let animations = [];
    const animate = async (entries, duration) => {
      animations = entries.map(([element, frames]) => element.animate(frames, { duration, easing: "ease-in-out", fill: "forwards" }));
      await Promise.all(animations.map((animation) => animation.finished));
    };
    const transition = async () => {
      if (displayedRef.current === mode && !surface.style.width) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const old = surface.getBoundingClientRect();
      const oldMargin = getComputedStyle(main).marginLeft;
      if (!animateMain) {
        main.style.opacity = "";
      }
      try {
        await animate([
          [inside, [{ opacity: getComputedStyle(inside).opacity }, { opacity: 0 }]],
          ...(animateMain ? [[main, [{ opacity: getComputedStyle(main).opacity }, { opacity: 0 }]]] : []),
        ], reduced ? 0 : 160);
        if (cancelled) return;
        inside.style.opacity = "0";
        if (animateMain) main.style.opacity = "0";
        animations.forEach((animation) => animation.cancel());
        surface.style.width = surface.style.height = "";
        main.style.marginLeft = "";
        flushSync(() => setDisplayed(mode));
        displayedRef.current = mode;
        const next = surface.getBoundingClientRect();
        const nextMargin = getComputedStyle(main).marginLeft;
        await animate([
          [surface, [{ width: `${old.width}px`, height: `${old.height}px` }, { width: `${next.width}px`, height: `${next.height}px` }]],
          [main, [{ marginLeft: oldMargin }, { marginLeft: nextMargin }]],
        ], reduced ? 0 : 280);
        if (cancelled) return;
        animations.forEach((animation) => animation.cancel());
        await animate([
          [inside, [{ opacity: 0 }, { opacity: 1 }]],
          ...(animateMain ? [[main, [{ opacity: 0 }, { opacity: 1 }]]] : []),
        ], reduced ? 0 : 160);
        if (cancelled) return;
        animations.forEach((animation) => animation.cancel());
        inside.style.opacity = main.style.opacity = "";
        surface.style.width = surface.style.height = main.style.marginLeft = "";
      } catch (error) {
        if (error.name !== "AbortError") throw error;
      }
    };
    void transition();
    return () => {
      cancelled = true;
      if (!animations.length) return;
      const rect = surface.getBoundingClientRect();
      inside.style.opacity = getComputedStyle(inside).opacity;
      if (animateMain) {
        main.style.opacity = getComputedStyle(main).opacity;
      }
      main.style.marginLeft = getComputedStyle(main).marginLeft;
      surface.style.width = `${rect.width}px`;
      surface.style.height = `${rect.height}px`;
      animations.forEach((animation) => animation.cancel());
    };
  }, [mode]);

  const compact = displayed === "compact";
  const accessMode = displayed === "access";
  const surfaceSize = accessMode ? "w-[min(302px,calc(100vw-24px))] h-[260px]" : "h-[calc(100dvh-20px)] " + (compact ? "w-[58px]" : "w-[248px]");
  const mainMargin = accessMode ? "ml-0" : compact ? "ml-[176px] max-[700px]:ml-[82px]" : "ml-[300px] max-[700px]:ml-[284px]";
  return (
    <div className="min-h-dvh bg-(--adech-bg) text-(--adech-fg) [[data-theme=light]_&]:[--adech-bg:var(--color-adech-venomous-3)] [[data-theme=light]_&]:[--adech-surface:var(--color-adech-venomous-3)] [[data-theme=light]_&]:[--adech-surface-muted:var(--color-adech-boulevard-1)]" data-mode={displayed}>
      <aside ref={surfaceRef} className={`fixed z-20 left-3 bottom-2.5 rounded-[14px] bg-adech-swamp-3 text-adech-boulevard-1 ${surfaceSize}`} aria-label={displayed === "access" ? "Acceso a Adechen" : "Navegación de Adechen"}>
        <div ref={insideRef} className={`flex h-full flex-col overflow-hidden rounded-[inherit] ${accessMode ? "p-2" : compact ? "px-2 py-3" : "p-3"}`}>
          {displayed === "access" ? access : <>
            <a href="/" className="mb-3 grid h-11 w-[42px] shrink-0 place-items-center text-[30px] font-bold" aria-label={name} title={name}><AdechIcon width={26} height={36} /></a>
            <nav aria-label="Áreas del CMS" className="flex flex-col gap-1.5 overflow-y-auto">
              {sections.map((section) => <button key={section.id} className={`flex min-h-11 items-center gap-3 rounded-[9px] text-left text-[13px] font-bold whitespace-nowrap disabled:text-adech-void-2 [&_svg]:shrink-0 ${compact ? "p-2.5" : "px-3 py-2.5"} ${activeSection === section.id ? "bg-adech-boulevard-1 text-adech-swamp-3" : "enabled:hover:bg-adech-swamp-2"}`} type="button" disabled={section.disabled} onClick={() => onSectionChange(section.id)} title={section.label} aria-label={section.label} aria-current={activeSection === section.id ? "page" : undefined}>
                {createElement(section.icon, { size: 20, "aria-hidden": true })}
                {!compact && <span>{section.label}</span>}
              </button>)}
            </nav>
            <div className="mt-5 border-t border-adech-void-3 pt-4 [&_button]:border-0 [&_button]:bg-transparent [&_button]:text-adech-boulevard-1">{controls}</div>
            <div className={`mt-auto flex items-center gap-2 border-t border-adech-void-3 pt-3.5 [&>svg]:shrink-0 [&_button]:grid [&_button]:place-items-center [&_button]:text-adech-boulevard-1 ${compact ? "flex-wrap justify-center" : ""}`}>
              <IconUserCircle size={34} aria-hidden="true" />
              {!compact && <div className="min-w-0 flex-1 text-xs"><strong>adechlien</strong><span className="block text-[10px] whitespace-nowrap text-adech-boulevard-4">Adech Design System</span></div>}
              <div>{footer}</div>
            </div>
          </>}
        </div>
        {displayed !== "access" && <button type="button" className="absolute -right-[13px] top-[calc(50%-13px)] grid size-[26px] place-items-center rounded-full bg-adech-boulevard-1 text-adech-swamp-3 hover:cursor-pointer" onClick={() => setCollapsed(!collapsed)} aria-expanded={!collapsed} aria-label={collapsed ? "Expandir barra lateral" : "Contraer barra lateral"} title={collapsed ? "Expandir barra lateral" : "Contraer barra lateral"}>
          {collapsed ? <IconChevronRight size={18} /> : <IconChevronLeft size={18} />}
        </button>}
      </aside>
      <main ref={mainRef} className={`pt-8 pr-11 pb-10 pl-6 max-[700px]:px-4 max-[700px]:py-6 ${mainMargin}`}>{displayed !== "access" && children}</main>
    </div>
  );
}
