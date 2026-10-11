import { createElement } from "react";
import { IconPalette, IconTool, IconLetterCase, IconComponents, IconIcons } from "@tabler/icons-react";

const AREAS = [
  { label: "Themes", icon: IconPalette, href: "/themes" },
  { label: "", icon: IconLetterCase },
  { label: "", icon: IconIcons },
  { label: "", icon: IconComponents },
  { label: "Tools", icon: IconTool, href: "/tools" },
];

export default function HomeHero() {
  return (
    <section className="mx-auto flex w-full max-w-3xl min-w-0 flex-col items-center gap-8 text-center py-16">
      <div className="flex w-full min-w-0 flex-col items-center gap-2">
        <h1 className="max-w-2xl text-4xl font-semibold text-adech-venomous-2">
          More than just design. A way of feeling.
        </h1>
        <p className="text-sm text-(--adech-hero-paragraph) sm:text-base">
          Adech is an evolving design system by Adechlien, bringing together themes, typography, components, and icons. It starts with Themes, for your projects and workspaces.
        </p>
      </div>
      <nav aria-label="Design system areas" className="flex items-start justify-center gap-8 w-full">
        {AREAS.map(({ label, icon: Icon, href }) => {
          const content = <>{createElement(Icon, { size: 32, stroke: 1.5, "aria-hidden": true })}<span className="text-xs font-medium">{label}</span></>;
          const className = "flex flex-col items-center gap-2";
          return href ? (
            <a key={label} href={href} className={`${className} text-adech-venomous-1 focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-(--adech-area-available)`}>{content}</a>
          ) : (
              <span key={label} className={`${className} text-adech-venomous-5`} title="Coming soon">
              {content}<span className="sr-only">Coming soon</span>
            </span>
          );
        })}
      </nav>
    </section>
  );
}
