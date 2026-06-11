import { useNpmVersion } from "../hooks/useNpmVersion";
import { AdechIcon, FooterTransition } from "./icons";

const NAV = [
  { label: "Branches", href: "#branches" },
  { label: "Workspaces", href: "#workspaces" },
  { label: "Docs", href: "#docs" },
  { label: "Tools", href: "#tools" },
];

const RESOURCES = [
  { label: "GitHub", href: "https://github.com/adechlien/adech" },
  { label: "NPM", href: "https://www.npmjs.com/package/@adech/themes" },
  { label: "Releases", href: "https://github.com/adechlien/adech/releases" },
  { label: "Issues", href: "https://github.com/adechlien/adech/issues" },
];

function FooterLink({ href, label }) {
  const external = href.startsWith("http");

  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className="text-sm text-(--adech-footer-paragraph) transition hover:text-(--adech-footer-fg)"
    >
      {label}
    </a>
  );
}

export default function Footer() {
  const { version, status } = useNpmVersion("@adech/themes", { cacheMinutes: 60 });

  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 bg-(--adech-footer-bg) text-(--adech-footer-fg)">
      <FooterTransition className="block h-auto w-full bg-(--adech-bg)" title="Adech Theme" />

      <div className="mx-auto max-w-6xl p-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start gap-12 lg:flex-row lg:justify-between">
          {/* Brand */}
          <div className="flex w-full max-w-md flex-col items-start gap-4 sm:flex-row sm:items-start">
            <AdechIcon className="size-16 shrink-0 text-(--adech-icon-brand) sm:size-20" title="Adech Theme" />

            <div className="min-w-0 text-left">
              <p className="text-base font-semibold sm:text-lg">
                Adech Theme
                <span className="text-sm font-normal">
                  {status === "loading" ? "…" : version ? ` v${version}` : " v—"}
                </span>
              </p>
              <p className="mt-1 text-sm leading-relaxed text-(--adech-footer-paragraph)">
                A portable theme ecosystem built around reusable branches and design
                tokens for interfaces and workspaces.
              </p>
            </div>
          </div>

          {/* Links */}
          <div className="grid w-full grid-cols-1 gap-10 sm:grid-cols-2 lg:w-auto lg:gap-16">
            {/* Nav */}
            <div className="text-left">
              <p className="text-base font-semibold tracking-wide">Navigation</p>
              <div className="mt-3 flex flex-col items-start gap-2">
                {NAV.map((l) => (
                  <FooterLink key={l.href} {...l} />
                ))}
              </div>
            </div>

            {/* Resources */}
            <div className="text-left">
              <p className="text-base font-semibold tracking-wide">Resources</p>
              <div className="mt-3 flex flex-col items-start gap-2">
                {RESOURCES.map((l) => (
                  <FooterLink key={l.label} {...l} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 border-t border-(--adech-bg) pt-4 px-4">
          <p className="text-center sm:text-left text-xs text-(--adech-footer-paragraph)">
            © {year} Adech. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
