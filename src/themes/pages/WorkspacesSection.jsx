import { createElement } from "react";
import { IconDownload } from "@tabler/icons-react";
import {
  ChromeIcon,
  EmacsIcon,
  NeovimIcon,
  ObsidianIcon,
  VscIcon,
  ZedIcon,
} from "../components/icons";

const WORKSPACES = [
  {
    name: "Zed IDE",
    icon: ZedIcon,
    version: "v2.0.1",
    actions: [
      { label: <IconDownload stroke={2} />, href: "https://zed.dev/extensions/adech" },
    ],
  },
  {
    name: "VS Code",
    icon: VscIcon,
    version: "v0.1.2",
    actions: [
      { label: <IconDownload stroke={2} />, href: "https://marketplace.visualstudio.com/items?itemName=Adechlien.adech-theme" },
    ],
  },
  {
    name: "Chrome",
    icon: ChromeIcon,
    version: "Coming soon...",
    actions: [
      { label: <IconDownload stroke={2} />, href: "#" },
    ],
  },
  {
    name: "Obsidian",
    icon: ObsidianIcon,
    version: "Coming soon...",
    actions: [
      { label: <IconDownload stroke={2} />, href: "#" },
    ],
  },
  {
    name: "NVim",
    icon: NeovimIcon,
    version: "Coming soon...",
    actions: [
      { label: <IconDownload stroke={2} />, href: "#" },
    ],
  },
  {
    name: "Emacs",
    icon: EmacsIcon,
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
        <a key={a.href} href={a.href} className="flex items-center justify-between gap-6 rounded-lg bg-(--adech-surface) p-6" target="_blank">
          <div className="flex flex-col items-startgap-2">
            <h3 className="text-xl font-semibold text-(--adech-title) truncate">
              {name}
            </h3>
            <span className="text-xs text-(--adech-paragraph)">
              {version}
            </span>
          </div>
          {createElement(icon, {
            className: "size-12 shrink-0 text-(--adech-icon-workspace)",
            title: name,
          })}
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
