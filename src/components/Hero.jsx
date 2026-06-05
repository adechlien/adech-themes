import { useEffect, useRef, useState } from "react";
import { IconCopy, IconCheck } from "@tabler/icons-react";

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);

      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      setCopied(true);

      timeoutRef.current = setTimeout(() => {
        setCopied(false);
      }, 1200);
    } catch {
      // niente
    }
  };

  return (
    <button
      onClick={onCopy}
      className="flex items-center cursor-pointer text-(--adech-nav-fg) transition"
      type="button"
      aria-label="Copy code"
      title="Copy code"
    >
      <span
        key={copied ? "check" : "copy"}
        className="inline-flex animate-tabEnter"
      >
        {copied ? <IconCheck stroke={2} size={20} /> : <IconCopy stroke={2} size={20} />}
      </span>
    </button>
  );
}

function CodeBlock({ title, code, tabKey }) {
  return (
    <div className="w-full overflow-hidden rounded-xl bg-(--adech-nav-bg)">
      <div className="flex items-center justify-between border-b border-(--adech-bg) px-4 py-3">
        <p className="text-xs font-medium text-(--adech-nav-fg)">{title}</p>
        <CopyButton text={code} />
      </div>

      <div key={tabKey} className="animate-tabEnter">
        <pre className="overflow-x-auto px-4 py-4 text-xs leading-relaxed text-(--adech-nav-fg)">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}

function InstallPreview({ onReadDocs }) {
  return (
    <section id="docs" className="flex w-full min-w-0 flex-col gap-2">
      <div className="min-w-0">
        <p className="text-sm text-(--adech-hero-paragraph)">
          Start by installing the package. The full docs show how to use Adech
          Themes with Tailwind, CSS variables, JSON exports, and presets.
        </p>
      </div>

      <div className="flex w-full min-w-0 flex-col gap-2">
        <div className="w-full min-w-0 min-h-52">
          <CodeBlock
            title="Install from npm"
            code="npm install @adech/themes"
            tabKey="install"
          />
        </div>

        <button
          type="button"
          onClick={onReadDocs}
          className="self-start rounded-lg bg-(--adech-hero-bg-button) px-4 py-2 text-sm font-medium text-(--adech-hero-fg-button) cursor-pointer"
        >
          Read the docs
        </button>
      </div>
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
          Adech is a portable theme ecosystem built around reusable branches for
          interfaces and workspaces. Install the package, then head into the docs
          when you are ready to wire the tokens into your stack.
        </p>

        <div className="flex flex-wrap items-center justify-start gap-3">
          <button
            type="button"
            onClick={() => goTo("docs")}
            className="rounded-lg bg-(--adech-hero-bg-button) px-4 py-2 text-sm font-medium text-(--adech-hero-fg-button) cursor-pointer"
          >
            Read docs
          </button>

          <button
            type="button"
            onClick={() => goTo("branches")}
            className="text-sm font-medium text-(--adech-hero-subtitle) cursor-pointer"
          >
            Meet the Themes
          </button>
        </div>
      </div>

      <div className="w-full min-w-0 self-start">
        <InstallPreview onReadDocs={() => goTo("docs")} />
      </div>
    </section>
  );
}
