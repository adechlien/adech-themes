import { IconBook, IconBrackets, IconBrandTailwind, IconChevronDown, IconCode, IconCopy, IconPackage, IconPalette, IconCheck } from "@tabler/icons-react";
import { useState } from "react";

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 900);
    } catch {
      // noop
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

function CodePreview({ title, description, code, icon: Icon, open, onToggle }) {
  return (
    <div className="overflow-hidden rounded-lg bg-(--adech-surface) ring-1 ring-(--adech-border)">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start justify-between gap-4 p-4 text-left"
        aria-expanded={open}
      >
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <div className="text-(--adech-muted)">
              {Icon ? <Icon size={20} stroke={2} /> : null}
            </div>

            <h3 className="text-xl font-semibold text-(--adech-title)">
              {title}
            </h3>
          </div>

          <p className="text-sm leading-relaxed text-(--adech-paragraph)">
            {description}
          </p>
        </div>

        <IconChevronDown
          size={20}
          stroke={2}
          className={[
            "mt-1 shrink-0 text-(--adech-muted) transition-transform duration-200",
            open ? "rotate-180" : "",
          ].join(" ")}
        />
      </button>

      {open && (
        <div className="flex items-start justify-between gap-4 border-t border-(--adech-border) bg-(--adech-surface-strong) p-4 animate-tabEnter">
          <pre className="overflow-x-auto text-sm leading-6 text-(--adech-fg)">
            <code>{code}</code>
          </pre>
          <CopyButton text={code} />
        </div>
      )}
    </div>
  );
}

const DOC_SECTIONS = [
  {
    id: "install",
    icon: IconPackage,
    title: "Install Adech Themes",
    description:
      "Add the package to your project first, then choose how you want to consume the tokens: Tailwind v4, Tailwind v3 preset, CSS variables or JSON exports.",
    code: `npm i @adech/themes`,
  },
  {
    id: "tailwind-v4",
    icon: IconBrandTailwind,
    title: "Adech with Tailwind v4",
    description:
      "Import the Tailwind export of the Superior branch and start using Adech tokens directly in your utility classes.",
    code: `@import "tailwindcss";
@import "@adech/themes/superior/tailwind";

export default function Card() {
  return (
    <div className="rounded-2xl bg-adech-swamp-2 p-6 text-adech-boulevard-1 ring-1 ring-adech-void-2/25">
      <p className="text-adech-boulevard-3">Adech Superior</p>
      <h3 className="mt-2 text-xl font-semibold">
        Portable tokens for interfaces
      </h3>

      <button className="mt-4 rounded-xl bg-adech-venomous-4 px-4 py-2 text-adech-venomous-4">
        Explore
      </button>
    </div>
  );
}`,
  },
  {
    id: "tailwind-v3",
    icon: IconCode,
    title: "Adech with Tailwind v3",
    description:
      "If your project still runs on Tailwind CSS v3, use the preset export from the Superior branch.",
    code: `// tailwind.config.cjs
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  presets: [require("@adech/themes/superior/preset")],
};`,
  },
  {
    id: "css",
    icon: IconBrackets,
    title: "CSS Variables",
    description:
      "Import the generated CSS file and use the Adech custom properties in any framework or plain CSS setup.",
    code: `@import "@adech/themes/superior/css";

.hero {
  background: var(--adech-swamp-2);
  color: var(--adech-boulevard-1);
  border: 1px solid var(--adech-void-2);
}

.button {
  background: var(--adech-venomous-4);
  color: var(--adech-swamp-3);
}

.button:hover {
  background: var(--adech-venomous-5);
}`,
  },
  {
    id: "json",
    icon: IconBook,
    title: "Consume JSON Tokens",
    description:
      "Use the JSON export when you need programmatic access to Adech palettes for tooling, scripts or dynamic style generation.",
    code: `import superior from "@adech/themes/superior/json";

console.log(superior.boulevard["1"]); // #C7DCFF
console.log(superior.swamp["2"]); // #142039

const theme = {
  background: superior.swamp["2"],
  foreground: superior.boulevard["1"],
  border: superior.void["2"],
};`,
  },
  {
    id: "superior",
    icon: IconPalette,
    title: "Explore the Superior Branch",
    description:
      "Superior is the refined Adech branch built for interfaces, editors and cross-workspace usage. It includes the main palettes and the contract colors used across ports.",
    code: `/* Example token names */

--adech-boulevard-1
--adech-boulevard-2
--adech-boulevard-3
--adech-boulevard-4

--adech-venomous-1
--adech-venomous-2
--adech-venomous-3
--adech-venomous-4
--adech-venomous-5

--adech-swamp-1
--adech-swamp-2
--adech-swamp-3

--adech-sunny-1
--adech-sunny-2
--adech-sunny-3

--adech-void-1
--adech-void-2
--adech-void-3`,
  },
];

export default function DocsSection() {
  const [openSection, setOpenSection] = useState(null);

  return (
    <section id="docs" className="flex flex-col gap-6 scroll-mt-24">
      <div className="flex items-end justify-between gap-6 flex-wrap">
        <div>
          <h2 className="text-4xl text-(--adech-title) font-bebas">
            Docs
          </h2>
          <p className="text-sm text-(--adech-paragraph) max-w-lg">
            Learn how to install, integrate and use Adech Themes in your own projects.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {DOC_SECTIONS.map((section) => (
          <CodePreview
            key={section.id}
            {...section}
            open={openSection === section.id}
            onToggle={() =>
              setOpenSection((current) =>
                current === section.id ? null : section.id
              )
            }
          />
        ))}
      </div>
    </section>
  );
}
