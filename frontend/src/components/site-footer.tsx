import { Link } from "@tanstack/react-router";
import { Droplet } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <span className="grid size-7 place-items-center rounded-sm gradient-pint text-primary-foreground">
            <Droplet className="size-3.5" strokeWidth={2.4} />
          </span>
          <p className="text-sm text-muted-foreground">
            RedPint — hospital-network blood coordination. Not a substitute for emergency services.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
          <Link to="/requests" className="hover:text-foreground">
            Live requests
          </Link>
          <Link to="/network" className="hover:text-foreground">
            Network stock
          </Link>
          <Link to="/drives" className="hover:text-foreground">
            Drives
          </Link>
        </div>
      </div>
    </footer>
  );
}
