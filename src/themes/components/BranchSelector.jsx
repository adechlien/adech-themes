import { useEffect, useRef, useState } from "react";
import { IconChevronDown } from "@tabler/icons-react";

const BRANCHES = [
  { id: "superior", label: "Superior" },
  { id: "legacy", label: "Legacy" },
];

export default function BranchSelector({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const optionRefs = useRef([]);
  const active = BRANCHES.find((branch) => branch.id === value);

  useEffect(() => {
    if (!open) return;
    optionRefs.current[BRANCHES.findIndex((branch) => branch.id === value)]?.focus();
    const closeOutside = (event) => {
      if (!containerRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, [open, value]);

  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="relative w-fit" onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
    }} onKeyDown={(event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      }
    }}>
      <h2 className="font-bebas text-5xl">
        <button ref={triggerRef} type="button" aria-label={`Choose Branch: ${active.label}`} aria-haspopup="menu"
          aria-controls="branch-options" aria-expanded={open} onClick={() => setOpen((current) => !current)}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown" || event.key === "ArrowUp") {
              event.preventDefault();
              setOpen(true);
            }
          }} className="flex cursor-pointer items-center gap-2 rounded-lg bg-(--adech-nav-bg) p-1 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--adech-title)">
          <span className="flex items-center gap-3 rounded-lg bg-(--adech-nav-bg-active) px-4 py-1 text-(--adech-nav-fg-active)">
            {active.label}
            <IconChevronDown aria-hidden="true" size={24} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
          </span>
        </button>
      </h2>
      <div id="branch-options" role="menu" aria-label="Branches"
        className={`absolute left-0 top-[calc(100%+0.5rem)] z-30 flex min-w-full origin-top-left flex-col gap-1 rounded-lg bg-(--adech-nav-bg) p-1 font-bellota shadow-lg transition-all duration-200 ${open ? "visible scale-100 opacity-100" : "invisible pointer-events-none scale-95 opacity-0"}`}>
        {BRANCHES.map((branch, index) => (
          <button key={branch.id} ref={(node) => { optionRefs.current[index] = node; }} type="button" role="menuitemradio"
            aria-checked={value === branch.id} tabIndex={open ? 0 : -1} onClick={() => { onChange(branch.id); close(); }}
            onKeyDown={(event) => {
              const directions = { ArrowDown: 1, ArrowUp: -1 };
              if (event.key in directions) {
                event.preventDefault();
                optionRefs.current[(index + directions[event.key] + BRANCHES.length) % BRANCHES.length]?.focus();
              } else if (event.key === "Home" || event.key === "End") {
                event.preventDefault();
                optionRefs.current[event.key === "Home" ? 0 : BRANCHES.length - 1]?.focus();
              }
            }} className={`cursor-pointer rounded-lg px-4 py-1 text-left text-base font-semibold transition focus-visible:outline-2 focus-visible:outline-(--adech-title) ${value === branch.id ? "bg-(--adech-nav-bg-active) text-(--adech-nav-fg-active)" : "text-(--adech-nav-fg) hover:bg-(--adech-surface)"}`}>
            {branch.label}
          </button>
        ))}
      </div>
    </div>
  );
}
