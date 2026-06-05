import { useEffect, useState } from "react";
import { IconMoonFilled, IconSunHighFilled } from "@tabler/icons-react";

export default function ThemeToggleButton() {
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "dark";

    const savedTheme = window.localStorage.getItem("adech-theme");
    return savedTheme === "light" || savedTheme === "dark" ? savedTheme : "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    window.localStorage.setItem("adech-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"));
  };

  return (
    <button onClick={toggleTheme} type="button" aria-label={`Activate ${theme === "dark" ? "light" : "dark"} mode`} className="text-(--adech-nav-bg-active) cursor-pointer">
      {theme === "dark" ? <IconMoonFilled /> : <IconSunHighFilled />}
    </button>
  );
}
