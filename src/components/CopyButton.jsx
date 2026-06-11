import { useEffect, useRef, useState } from "react";
import { IconCheck, IconCopy } from "@tabler/icons-react";

export default function CopyButton({
  value,
  text,
  children,
  variant = "icon",
  copiedLabel = "Copied",
  idleLabel,
  className = "",
  iconSize = 20,
  title = "Copy",
  ariaLabel = "Copy",
  iconOnly = false,
}) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef(null);
  const copyValue = value ?? text ?? "";

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(copyValue);

      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      setCopied(true);
      timeoutRef.current = setTimeout(() => setCopied(false), 1200);
    } catch {
      // noop
    }
  };

  if (variant === "button") {
    return (
      <button
        type="button"
        onClick={onCopy}
        className={[
          "rounded-lg bg-(--adech-nav-bg-active) px-3 py-2 text-sm font-medium text-(--adech-nav-fg-active)",
          className,
        ].join(" ")}
        aria-label={ariaLabel}
        title={title}
      >
        {iconOnly ? (
          <span
            key={copied ? "check" : "copy"}
            className="inline-flex animate-tabEnter"
          >
            {copied ? (
              <IconCheck stroke={2} size={iconSize} />
            ) : (
              <IconCopy stroke={2} size={iconSize} />
            )}
          </span>
        ) : (
          copied ? copiedLabel : children || idleLabel || "Copy"
        )}
      </button>
    );
  }

  return (
    <button
      onClick={onCopy}
      className={[
        "flex items-center cursor-pointer text-(--adech-nav-fg) transition",
        className,
      ].join(" ")}
      type="button"
      aria-label={ariaLabel}
      title={title}
    >
      <span
        key={copied ? "check" : "copy"}
        className="inline-flex animate-tabEnter"
      >
        {copied ? (
          <IconCheck stroke={2} size={iconSize} />
        ) : (
          <IconCopy stroke={2} size={iconSize} />
        )}
      </span>
    </button>
  );
}
