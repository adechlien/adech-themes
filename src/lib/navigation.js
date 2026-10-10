const SECTIONS = ["overview", "branches", "workspaces", "docs"];
export function resolveLocation({ pathname, hash = "", search = "" }) {
  const path = pathname.replace(/\/+$/, "") || "/";
  const fragment = hash.slice(1);
  if (path === "/" && ["branches", "workspaces", "docs", "tools"].includes(fragment)) {
    const tools = fragment === "tools";
    return {
      area: tools ? "tools" : "themes",
      path: tools ? "/tools" : "/themes",
      section: tools ? "overview" : fragment,
      redirect: tools ? `/tools${search}` : `/themes${search}#${fragment}`,
    };
  }
  return {
    area: { "/": "home", "/themes": "themes", "/tools": "tools" }[path] || "missing",
    path,
    section: SECTIONS.includes(fragment) ? fragment : "overview",
  };
}
