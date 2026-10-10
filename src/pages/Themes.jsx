import Hero from "../components/Hero";
import BranchPreview from "../components/BranchPreview";
import BranchesSection from "./BranchesSection";
import WorkspacesSection from "./WorkspacesSection";
import DocsSection from "./DocsSection";
const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "branches", label: "Branches" },
  { id: "workspaces", label: "Workspaces" },
  { id: "docs", label: "Documentation" },
];
export default function Themes({ section }) {
  const goTo = (next) => { window.location.hash = next; };
  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col gap-5">
        <p className="text-sm font-medium uppercase tracking-widest text-(--adech-hero-subtitle)">Adech Themes</p>
        <nav aria-label="Themes" className="flex flex-wrap gap-2">
          {SECTIONS.map(({ id, label }) => (
            <a key={id} href={id === "overview" ? "/themes" : `/themes#${id}`} aria-current={section === id ? "page" : undefined}
              className={`rounded-lg px-4 py-2 text-sm font-semibold ${section === id ? "bg-(--adech-nav-bg-active) text-(--adech-nav-fg-active)" : "bg-(--adech-nav-bg) text-(--adech-nav-fg)"}`}>{label}</a>
          ))}
        </nav>
      </div>
      <div key={section} className="animate-tabEnter">
        {section === "overview" && <div className="flex flex-col gap-32"><Hero activeTab={section} onChangeTab={goTo} /><BranchPreview onExploreBranches={() => goTo("branches")} /></div>}
        {section === "branches" && <BranchesSection />}
        {section === "workspaces" && <WorkspacesSection />}
        {section === "docs" && <DocsSection />}
      </div>
    </div>
  );
}
