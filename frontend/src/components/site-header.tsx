import { Link } from "@tanstack/react-router";
import { Droplet, Menu, LogOut, User, Sun, Moon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { getTheme, setTheme } from "@/lib/theme";

const DONOR_NAV = [
  { to: "/donor/dashboard", label: "Dashboard" },
  { to: "/matches", label: "Match inbox" },
  { to: "/donor/hospitals", label: "Nearby hospitals" },
  { to: "/drives", label: "Drives" },
  { to: "/donor/documents", label: "Documents" },
];

const HOSPITAL_NAV = [
  { to: "/hospital/dashboard", label: "Dashboard" },
  { to: "/requests", label: "Request board" },
  { to: "/hospital/stock", label: "Stock" },
  { to: "/hospital/drives", label: "Drives" },
  { to: "/donors", label: "Donor registry" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [theme, setLocalTheme] = useState(() => typeof window !== "undefined" ? getTheme() : "light");
  const { user, role, profile, logout } = useAuth();

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setLocalTheme(next);
    setTheme(next);
  };

  const nav = role === "donor" ? DONOR_NAV : role === "hospital" ? HOSPITAL_NAV : [];
  const displayName = profile?.name || user?.email || "";
  const roleBadge = role === "donor" ? "Donor" : role === "hospital" ? "Hospital" : role === "admin" ? "Admin" : "";

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-5">
        <Link to={role === "donor" ? "/donor/dashboard" : role === "hospital" ? "/hospital/dashboard" : role === "admin" ? "/admin/dashboard" : "/"} className="flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-sm gradient-pint text-primary-foreground">
            <Droplet className="size-4" strokeWidth={2.4} />
          </span>
          <span className="font-display text-lg font-extrabold tracking-tight">RedPint</span>
        </Link>

        <nav className="ml-2 hidden items-center gap-1 md:flex">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-sm px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
              activeProps={{ className: "bg-surface-2 text-foreground" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {user && (
            <>
              <span className="hidden sm:inline-flex items-center gap-1.5 text-sm text-muted-foreground mr-1">
                <User className="size-4" />
                <span className="max-w-[120px] truncate">{displayName}</span>
                {roleBadge && (
                  <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                    {roleBadge}
                  </span>
                )}
              </span>

              {role === "hospital" && (
                <Button asChild size="sm" className="hidden sm:inline-flex bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Link to="/requests/new">Request Blood</Link>
                </Button>
              )}

              <Button variant="ghost" size="icon" onClick={toggleTheme} className="hidden sm:inline-flex" aria-label="Toggle theme">
                {theme === "light" ? <Moon className="size-4" /> : <Sun className="size-4" />}
              </Button>

              <Button variant="ghost" size="sm" onClick={logout} className="hidden sm:inline-flex">
                <LogOut className="size-4 mr-1.5" />
                Log out
              </Button>
            </>
          )}

          <div className="flex items-center md:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="mr-1"
              aria-label="Toggle theme"
              onClick={toggleTheme}
            >
              {theme === "light" ? <Moon className="size-4" /> : <Sun className="size-4" />}
            </Button>
            <Button
              variant="outline"
              size="icon"
              aria-label="Open menu"
            onClick={() => setOpen((v) => !v)}
          >
            <Menu className="size-4" />
          </Button>
        </div>
      </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "overflow-hidden border-t border-border transition-[grid-template-rows] duration-200 ease-out grid md:hidden",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="min-h-0">
          <nav className="mx-auto grid max-w-7xl gap-1 px-5 py-3">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className="rounded-sm px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-surface hover:text-foreground"
              activeProps={{ className: "bg-surface-2 text-foreground" }}
            >
              {item.label}
            </Link>
          ))}
          {user && (
            <button
              onClick={() => {
                logout();
                setOpen(false);
              }}
              className="rounded-sm px-3 py-2 text-left text-sm font-medium text-muted-foreground hover:bg-surface hover:text-foreground"
            >
              Log out
            </button>
          )}
        </nav>
        </div>
      </div>
    </header>
  );
}
