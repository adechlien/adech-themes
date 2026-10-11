export function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-2 text-sm font-semibold text-(--adech-title)">
      {label}
      {children}
    </label>
  );
}

export function TextInput(props) {
  return (
    <input
      {...props}
      className={[
        "w-full rounded-lg border border-(--adech-border) bg-(--adech-surface-muted)",
        "px-3 py-2 text-sm font-normal text-(--adech-fg) outline-none transition",
        "placeholder:text-(--adech-muted) focus:border-(--adech-nav-bg-active)",
        props.className || "",
      ].join(" ")}
    />
  );
}

export function TextArea(props) {
  return (
    <textarea
      {...props}
      className={[
        "min-h-24 w-full rounded-lg border border-(--adech-border) bg-(--adech-surface-muted)",
        "px-3 py-2 text-sm font-normal leading-relaxed text-(--adech-fg) outline-none transition",
        "placeholder:text-(--adech-muted) focus:border-(--adech-nav-bg-active)",
        props.className || "",
      ].join(" ")}
    />
  );
}

export function IconButton({ children, className = "", ...props }) {
  return (
    <button
      {...props}
      className={[
        "inline-flex h-10 w-10 items-center justify-center rounded-lg border border-(--adech-border)",
        "bg-(--adech-surface-muted) text-(--adech-title) transition hover:bg-(--adech-surface-strong)",
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}
