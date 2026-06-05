import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";

import Header from "./components/Header";
import Home from "./pages/Home";
import BranchesSection from "./pages/BranchesSection";
import WorkspacesSection from "./pages/WorkspacesSection";
import DocsSection from "./pages/DocsSection";
import ToolsSection from "./pages/ToolsSection";
import Footer from "./components/Footer";
import WIP from "./components/WIP";

import "./index.css";

const TABS = ["home", "branches", "workspaces", "docs", "tools"];

function tabFromHash() {
  const raw = (window.location.hash || "").replace("#", "").trim();
  return TABS.includes(raw) ? raw : "home";
}

function setHash(tab) {
  if (tab === "home") {
    window.history.replaceState(
      null,
      "",
      window.location.pathname + window.location.search
    );
    return;
  }

  window.history.replaceState(null, "", `#${tab}`);
}

export function Root() {
  const [activeTab, setActiveTab] = useState(() => tabFromHash());

  useEffect(() => {
    const onHashChange = () => {
      setActiveTab(tabFromHash());
    };

    window.addEventListener("hashchange", onHashChange);

    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    setHash(activeTab);
  }, [activeTab]);

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto">
        <Header activeTab={activeTab} onChangeTab={setActiveTab} />
        <main className="mx-8 sm:px-16 py-16 sm:py-32">
          <div key={activeTab} className="flex flex-col gap-32 animate-tabEnter">
            {activeTab === "home" && <Home activeTab={activeTab} onChangeTab={setActiveTab} />}
            {activeTab === "docs" && <DocsSection />}
            {activeTab === "workspaces" && <WorkspacesSection />}
            {activeTab === "branches" && <BranchesSection />}
            {activeTab === "tools" && <ToolsSection />}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
