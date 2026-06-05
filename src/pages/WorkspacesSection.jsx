import { IconBrandGithub, IconDownload } from "@tabler/icons-react";

const WORKSPACES = [
  {
    name: "Zed IDE",
    icon: "/zed-logo.svg",
    version: "v2.0.1",
    actions: [
      { label: <IconDownload stroke={2} />, href: "https://zed.dev/extensions/adech" },
    ],
  },
  {
    name: "VS Code",
    icon: "/vsc-logo.svg",
    version: "v0.1.2",
    actions: [
      { label: <IconDownload stroke={2} />, href: "https://marketplace.visualstudio.com/items?itemName=Adechlien.adech-theme" },
    ],
  },
  {
    name: "Chrome",
    icon: "/chrome-logo.svg",
    version: "Coming soon...",
    actions: [
      { label: <IconDownload stroke={2} />, href: "#" },
    ],
  },
  {
    name: "Obsidian",
    icon: "/obsidian-logo.svg",
    version: "Coming soon...",
    actions: [
      { label: <IconDownload stroke={2} />, href: "#" },
    ],
  },

];



function WorkspaceCard({ name, icon, version, actions }) {
  return (
    <>
      {actions.map((a) => (
        <a key={a.href} href={a.href} className="flex items-center justify-between gap-6 rounded-lg bg-(--adech-surface) p-6 ring-1 ring-(--adech-border)" target="_blank">
          <div className="flex flex-col items-startgap-2">
            <h3 className="text-xl font-semibold text-(--adech-title) truncate">
              {name}
            </h3>
            <span className="text-xs text-(--adech-paragraph)">
              {version}
            </span>
          </div>
          <img key={icon} src={icon} alt={name} className="size-12" />
        </a>
      ))}
    </>
  );
}

export default function WorkspacesSection() {
  return (
    <section id="workspaces" className="scroll-mt-24">
      <div className="flex items-end justify-between gap-6 flex-wrap">
        <div>
          <h2 className="text-4xl text-(--adech-title) font-bebas">
            Workspaces
          </h2>
          <p className="text-sm text-(--adech-paragraph) max-w-lg">
            Official ports for your workspaces.
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-4 gap-4">
        {WORKSPACES.map((w) => (
          <WorkspaceCard key={w.name} {...w} />
        ))}
      </div>
    </section>
  );
}
