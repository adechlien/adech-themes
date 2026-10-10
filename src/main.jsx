import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import Header from "./components/Header";
import Home from "./pages/Home";
import Themes from "./pages/Themes";
import ToolsSection from "./pages/ToolsSection";
import Footer from "./components/Footer";
import AdminBranches from "./pages/AdminBranches";
import { resolveLocation } from "./lib/navigation";
import "./index.css";

function SiteRoot() {
  const [route, setRoute] = useState(() => resolveLocation(window.location));
  useEffect(() => {
    const syncLocation = () => {
      const next = resolveLocation(window.location);
      if (next.redirect) window.history.replaceState(null, "", next.redirect);
      setRoute(next);
    };
    syncLocation();
    window.addEventListener("popstate", syncLocation);
    window.addEventListener("hashchange", syncLocation);
    return () => {
      window.removeEventListener("popstate", syncLocation);
      window.removeEventListener("hashchange", syncLocation);
    };
  }, []);
  useEffect(() => {
    const label = { home: "Design System", themes: "Themes", tools: "Tools", missing: "Page not found" }[route.area];
    document.title = `Adech — ${label}`;
    document.querySelector('link[rel="canonical"]').href = `https://design.adechlien.com${route.path}`;
  }, [route.area, route.path]);
  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto">
        <Header activeTab={route.area} />
        <main id="main-content" className="mx-8 sm:px-8 py-16 sm:py-32">
          {route.area === "home" && <Home />}
          {route.area === "themes" && <Themes section={route.section} />}
          {route.area === "tools" && <ToolsSection />}
          {route.area === "missing" && <section className="flex flex-col items-start gap-6"><h1 className="text-4xl">Page not found</h1><a href="/" className="underline">Return to Adech</a></section>}
        </main>
      </div>
      <Footer />
    </div>
  );
}
export function Root() {
  return window.location.pathname.replace(/\/+$/, "") === "/admin" ? <AdminBranches /> : <SiteRoot />;
}
ReactDOM.createRoot(document.getElementById("root")).render(<React.StrictMode><Root /></React.StrictMode>);
