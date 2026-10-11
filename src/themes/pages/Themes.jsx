import { useEffect } from "react";
import ThemesHero from "../components/ThemesHero";
import BranchPreview from "../components/BranchPreview";
import WorkspacesSection from "./WorkspacesSection";
import DocsSection from "./DocsSection";

function scrollToSection(section) {
  document.getElementById(section)?.scrollIntoView({
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    block: "start",
  });
}

export default function Themes({ section }) {
  useEffect(() => {
    if (section === "docs" || section === "workspaces") {
      const frame = requestAnimationFrame(() => scrollToSection(section));
      return () => cancelAnimationFrame(frame);
    }
  }, [section]);

  return (
    <div className="flex flex-col gap-40">
      <ThemesHero onReadDocs={() => scrollToSection("docs")} onExploreBranches={() => scrollToSection("branches")} />
      <BranchPreview />
      <WorkspacesSection />
      <DocsSection />
    </div>
  );
}
