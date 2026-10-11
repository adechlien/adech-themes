const SECTIONS = ["overview", "branches", "workspaces", "docs"];
const themeSection = (value) => value === "branches" || !SECTIONS.includes(value) ? "overview" : value;
export function resolveLocation({ pathname, hash = "", search = "" }, historyState = {}) {
  const path = pathname.replace(/\/+$/, "") || "/";
  const fragment = hash.slice(1);
  if (path === "/" && ["branches", "workspaces", "docs", "tools"].includes(fragment)) {
    const tools = fragment === "tools";
    return {
      area: tools ? "tools" : "themes",
      path: tools ? "/tools" : "/themes",
      section: tools ? "overview" : themeSection(fragment),
      redirect: tools ? `/tools${search}` : `/themes${search}`,
    };
  }
  return {
    area: { "/": "home", "/themes": "themes", "/tools": "tools" }[path] || "missing",
    path,
    section: themeSection(SECTIONS.includes(fragment) ? fragment : historyState?.themeSection),
    ...(path === "/themes" && (hash || pathname !== path) ? { redirect: `/themes${search}` } : {}),
  };
}
