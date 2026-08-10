export function getTheme(): "light" | "dark" {
  const stored = localStorage.getItem("redpint-theme");
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function setTheme(theme: "light" | "dark") {
  localStorage.setItem("redpint-theme", theme);
  document.documentElement.classList.toggle("dark", theme === "dark");
}
