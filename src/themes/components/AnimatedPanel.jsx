import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";

// Keep the current panel mounted until it fades out, then measure the replacement.
export default function AnimatedPanel({ view, children }) {
  const [displayed, setDisplayed] = useState(view);
  const displayedRef = useRef(view);
  const containerRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    let cancelled = false;
    let animation;
    const animate = async (element, frames, duration) => {
      animation = element.animate(frames, { duration, easing: "ease-in-out", fill: "forwards" });
      await animation.finished;
    };
    const transition = async () => {
      // Also allow interrupted fades to finish when the user returns to this view.
      if (displayedRef.current === view && !container.style.height) return;
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const duration = reduceMotion ? 0 : 160;
      const oldHeight = container.getBoundingClientRect().height;
      const oldOpacity = getComputedStyle(content).opacity;
      container.style.height = `${oldHeight}px`;
      container.style.overflow = "hidden";
      try {
        await animate(content, [{ opacity: oldOpacity }, { opacity: 0 }], duration);
        if (cancelled) return;
        content.style.opacity = "0";
        animation.cancel();
        flushSync(() => setDisplayed(view));
        displayedRef.current = view;
        const nextHeight = content.getBoundingClientRect().height;
        await animate(container, [{ height: `${oldHeight}px` }, { height: `${nextHeight}px` }], reduceMotion ? 0 : 280);
        if (cancelled) return;
        container.style.height = `${nextHeight}px`;
        animation.cancel();
        await animate(content, [{ opacity: 0 }, { opacity: 1 }], duration);
        if (cancelled) return;
        content.style.opacity = "";
        animation.cancel();
        container.style.height = "";
        container.style.overflow = "";
      } catch (error) {
        if (error.name !== "AbortError") throw error;
      }
    };
    void transition();
    return () => {
      cancelled = true;
      // Capture the current frame so a rapid next selection starts smoothly.
      if (animation) {
        content.style.opacity = getComputedStyle(content).opacity;
        container.style.height = `${container.getBoundingClientRect().height}px`;
        animation.cancel();
      }
    };
  }, [view]);

  return <div ref={containerRef}><div ref={contentRef} className="flow-root">{children(displayed)}</div></div>;
}
