import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Droplet, Building2, Heart, ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")(  {
  head: () => ({
    meta: [
      { title: "RedPint — Match Blood Donors to Hospitals in Minutes" },
    ],
  }),
  component: EntryScreen,
});

function EntryScreen() {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();

  // If already authenticated, redirect to the correct dashboard
  useEffect(() => {
    if (loading) return;
    if (user && role === "donor") {
      navigate({ to: "/donor/dashboard" });
    } else if (user && role === "hospital") {
      navigate({ to: "/hospital/dashboard" });
    }
  }, [user, role, loading, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // If already logged in and redirecting, show nothing
  if (user && role) return null;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-5">
      {/* Logo + Title */}
      <div className="flex items-center gap-3 mb-4">
        <span className="grid size-12 place-items-center rounded-lg gradient-pint text-primary-foreground">
          <Droplet className="size-6" strokeWidth={2.4} />
        </span>
        <h1 className="font-display text-4xl font-extrabold tracking-tight">RedPint</h1>
      </div>
      <p className="text-center text-muted-foreground max-w-md mb-12">
        Emergency blood coordination network. Match donors to hospitals in minutes.
      </p>

      {/* Role selection cards */}
      <div className="grid gap-6 sm:grid-cols-2 w-full max-w-2xl">
        {/* Donor card */}
        <button
          onClick={() => navigate({ to: "/login", search: { role: "donor" } })}
          className="group relative flex flex-col items-center gap-5 rounded-xl border-2 border-border bg-card p-8 shadow-panel transition-all hover:border-primary hover:shadow-lift"
        >
          <span className="grid size-16 place-items-center rounded-full bg-primary/10 text-primary transition-transform group-hover:scale-110">
            <Heart className="size-8" />
          </span>
          <div className="text-center">
            <h2 className="text-xl font-bold">Continue as Donor</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Register to donate blood, view nearby hospitals, and respond to urgent requests
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
            Get started <ArrowRight className="size-4" />
          </span>
        </button>

        {/* Hospital card */}
        <button
          onClick={() => navigate({ to: "/login", search: { role: "hospital" } })}
          className="group relative flex flex-col items-center gap-5 rounded-xl border-2 border-border bg-card p-8 shadow-panel transition-all hover:border-primary hover:shadow-lift"
        >
          <span className="grid size-16 place-items-center rounded-full bg-primary/10 text-primary transition-transform group-hover:scale-110">
            <Building2 className="size-8" />
          </span>
          <div className="text-center">
            <h2 className="text-xl font-bold">Continue as Hospital</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Post urgent blood requests, manage stock, and coordinate with matched donors
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
            Get started <ArrowRight className="size-4" />
          </span>
        </button>
      </div>

      {/* Footer note */}
      <p className="mt-12 text-xs text-muted-foreground">
        One pint covers up to three patients. Every minute counts.
      </p>
    </div>
  );
}
