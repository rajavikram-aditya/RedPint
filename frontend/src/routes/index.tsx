import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Activity,
  ArrowRight,
  Building2,
  Clock3,
  Droplet,
  Heart,
  HeartPulse,
  MapPin,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [{ title: "RedPint — Match Blood Donors to Hospitals in Minutes" }],
  }),
  component: EntryScreen,
});

function EntryScreen() {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();

  // If already authenticated, redirect to the correct dashboard.
  useEffect(() => {
    if (loading) return;
    if (user && role === "donor") {
      navigate({ to: "/donor/dashboard" });
    } else if (user && role === "hospital") {
      navigate({ to: "/hospital/dashboard" });
    } else if (user && role === "admin") {
      navigate({ to: "/admin/dashboard" });
    }
  }, [user, role, loading, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (user && role) return null;

  const goToLogin = (selectedRole: "donor" | "hospital") => {
    navigate({ to: "/login", search: { role: selectedRole } });
  };

  return (
    <div className="landing-page relative min-h-screen overflow-hidden bg-[#fbf8f5] text-[#241a18]">
      <div className="landing-orb landing-orb-one" aria-hidden="true" />
      <div className="landing-orb landing-orb-two" aria-hidden="true" />

      <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-5 pb-5 pt-6 sm:px-8 lg:px-10">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl gradient-pint text-primary-foreground shadow-lift">
            <Droplet className="size-5" strokeWidth={2.6} />
          </span>
          <div>
            <p className="font-display text-lg font-black leading-none tracking-tight">RedPint</p>
            <p className="mt-1 font-mono text-[0.56rem] font-bold uppercase tracking-[0.22em] text-muted-foreground">
              Response network
            </p>
          </div>
        </div>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Landing page navigation">
          <a
            className="text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
            href="#how-it-works"
          >
            How it works
          </a>
          <a
            className="text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
            href="#choose-role"
          >
            Choose your role
          </a>
        </nav>

        <Button
          variant="outline"
          className="h-10 rounded-full border-foreground/15 bg-card/70 px-4 text-sm shadow-sm backdrop-blur hover:bg-card"
          onClick={() =>
            document.getElementById("choose-role")?.scrollIntoView({ behavior: "smooth" })
          }
          aria-label="Choose a role to sign in"
        >
          Sign in <ArrowRight className="size-4" />
        </Button>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-16 sm:px-8 lg:px-10 lg:pb-24">
        <section className="grid items-center gap-12 pb-20 pt-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)] lg:gap-16 lg:pb-28 lg:pt-16">
          <div className="max-w-3xl">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3.5 py-2 text-xs font-bold text-primary shadow-sm">
              <span className="size-2 animate-pulse rounded-full bg-primary" aria-hidden="true" />
              Live coordination for critical moments
            </div>
            <h1 className="max-w-3xl font-display text-5xl font-black leading-[0.96] tracking-[-0.055em] text-[#241a18] sm:text-6xl lg:text-7xl">
              Blood moves.
              <span className="mt-2 block text-primary">Lives move with it.</span>
            </h1>
            <p className="mt-7 max-w-xl text-base leading-7 text-[#655a56] sm:text-lg">
              RedPint brings eligible donors and hospitals into one focused network, so urgent
              requests reach the people who can act on them.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button
                size="lg"
                className="h-12 rounded-full px-6 shadow-lift"
                onClick={() => goToLogin("donor")}
              >
                <Heart className="size-4" />
                I want to donate
                <ArrowRight className="size-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 rounded-full border-foreground/15 bg-card/70 px-6 backdrop-blur hover:bg-card"
                onClick={() => goToLogin("hospital")}
              >
                <Building2 className="size-4" />I represent a hospital
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-semibold text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="size-4 text-success" /> Role-based access
              </span>
              <span className="inline-flex items-center gap-2">
                <Clock3 className="size-4 text-primary" /> Fast, focused alerts
              </span>
              <span className="inline-flex items-center gap-2">
                <Users className="size-4 text-primary" /> Built for communities
              </span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl lg:justify-self-end">
            <div className="landing-network-card relative overflow-hidden rounded-[2rem] bg-[#241412] p-4 text-[#fff7f0] shadow-[0_30px_80px_-28px_oklch(0.19_0.025_25_/_55%)] sm:p-5">
              <div className="absolute inset-0 opacity-30" aria-hidden="true">
                <div className="absolute -right-12 -top-12 size-48 rounded-full bg-primary blur-3xl" />
                <div className="absolute -bottom-24 -left-16 size-56 rounded-full bg-urgent blur-3xl" />
              </div>
              <div className="relative flex items-center justify-between border-b border-ink-foreground/10 px-2 pb-4">
                <div className="flex items-center gap-2">
                  <Activity className="size-4 text-primary" />
                  <span className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[#fff7f0]/70">
                    Network pulse
                  </span>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-success/15 px-2.5 py-1 font-mono text-[0.6rem] font-bold uppercase tracking-[0.16em] text-success">
                  <span className="size-1.5 rounded-full bg-success" /> Live view
                </span>
              </div>

              <div className="relative mt-4 rounded-[1.4rem] border border-ink-foreground/10 bg-ink-foreground/[0.06] p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-mono text-[0.62rem] font-bold uppercase tracking-[0.18em] text-[#fff7f0]/55">
                      Priority request
                    </p>
                    <h2 className="mt-2 font-display text-2xl font-bold tracking-tight">
                      O+ units needed
                    </h2>
                  </div>
                  <span className="rounded-full bg-urgent px-3 py-1.5 font-mono text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[#3a1f08]">
                    Urgent
                  </span>
                </div>

                <div className="mt-8 grid grid-cols-[auto_1fr_auto] items-center gap-3">
                  <div className="grid size-11 place-items-center rounded-2xl bg-primary/20 text-primary">
                    <MapPin className="size-5" />
                  </div>
                  <div className="relative h-px bg-ink-foreground/15">
                    <span className="absolute left-[18%] top-1/2 size-2 -translate-y-1/2 rounded-full bg-primary shadow-[0_0_0_5px_oklch(0.62_0.19_25_/_12%)]" />
                    <span className="absolute right-[18%] top-1/2 size-2 -translate-y-1/2 rounded-full bg-urgent shadow-[0_0_0_5px_oklch(0.76_0.15_65_/_12%)]" />
                  </div>
                  <div className="grid size-11 place-items-center rounded-2xl bg-urgent/15 text-urgent">
                    <HeartPulse className="size-5" />
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between gap-4 text-xs text-[#fff7f0]/60">
                  <span>Eligible donors nearby</span>
                  <span>Hospital request</span>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-ink-foreground/[0.07] p-4">
                    <p className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-[#fff7f0]/50">
                      Response
                    </p>
                    <p className="mt-2 font-display text-xl font-bold">Connected</p>
                  </div>
                  <div className="rounded-2xl bg-ink-foreground/[0.07] p-4">
                    <p className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-[#fff7f0]/50">
                      Next step
                    </p>
                    <p className="mt-2 font-display text-xl font-bold">Take action</p>
                  </div>
                </div>
              </div>
              <p className="relative px-2 pt-4 font-mono text-[0.58rem] uppercase tracking-[0.16em] text-[#fff7f0]/45">
                Illustrative network view · every action starts with a secure sign in
              </p>
            </div>
            <div className="absolute -bottom-5 -left-5 hidden items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-panel sm:flex">
              <span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
                <Heart className="size-4" />
              </span>
              <div>
                <p className="font-mono text-[0.58rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  One donation
                </p>
                <p className="mt-0.5 text-sm font-bold">Can help up to three patients</p>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="border-y border-border/80 py-6">
          <div className="grid gap-5 sm:grid-cols-3 sm:divide-x sm:divide-border/80">
            <div className="flex items-center gap-3 sm:px-6 sm:first:pl-0">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <HeartPulse className="size-5" />
              </span>
              <div>
                <p className="text-sm font-bold">Request</p>
                <p className="text-xs text-muted-foreground">Hospitals signal what is needed.</p>
              </div>
            </div>
            <div className="flex items-center gap-3 sm:px-6">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <Users className="size-5" />
              </span>
              <div>
                <p className="text-sm font-bold">Match</p>
                <p className="text-xs text-muted-foreground">The right donors see the call.</p>
              </div>
            </div>
            <div className="flex items-center gap-3 sm:px-6 sm:last:pr-0">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <Activity className="size-5" />
              </span>
              <div>
                <p className="text-sm font-bold">Respond</p>
                <p className="text-xs text-muted-foreground">People move with clarity.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="choose-role" className="pt-20 lg:pt-28">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="label-eyebrow text-primary">Choose your route</p>
              <h2 className="mt-3 max-w-2xl font-display text-4xl font-black tracking-[-0.045em] text-[#241a18] sm:text-5xl">
                One network, two ways to help.
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-6 text-muted-foreground md:text-right">
              Start with the role that fits you. You can return here whenever you need to switch
              context.
            </p>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <button
              type="button"
              onClick={() => goToLogin("donor")}
              className="group rounded-[1.75rem] border border-border bg-card p-6 text-left shadow-panel transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:p-8"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary transition-transform duration-200 group-hover:scale-105">
                  <Heart className="size-7" />
                </span>
                <span className="font-mono text-xs font-bold tracking-[0.16em] text-muted-foreground">
                  01
                </span>
              </div>
              <h3 className="mt-8 font-display text-2xl font-bold tracking-tight">
                I want to donate
              </h3>
              <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
                Create a donor profile, see nearby hospitals, and respond when your blood group can
                make a difference.
              </p>
              <span className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-primary">
                Continue as donor{" "}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </span>
            </button>

            <button
              type="button"
              onClick={() => goToLogin("hospital")}
              className="group rounded-[1.75rem] border border-border bg-card p-6 text-left shadow-panel transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:p-8"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="grid size-14 place-items-center rounded-2xl bg-ink text-ink-foreground transition-transform duration-200 group-hover:scale-105">
                  <Building2 className="size-7" />
                </span>
                <span className="font-mono text-xs font-bold tracking-[0.16em] text-muted-foreground">
                  02
                </span>
              </div>
              <h3 className="mt-8 font-display text-2xl font-bold tracking-tight">
                I represent a hospital
              </h3>
              <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
                Post urgent blood requests, manage stock, and coordinate with matched donors from
                one focused workspace.
              </p>
              <span className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-primary">
                Continue as hospital{" "}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </span>
            </button>
          </div>
        </section>
      </main>

      <footer className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-3 border-t border-border/80 px-5 py-7 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
        <p className="font-mono uppercase tracking-[0.14em]">
          RedPint / Built for the moment that matters
        </p>
        <p className="inline-flex items-center gap-2">
          <ShieldCheck className="size-4 text-success" /> Secure access for every role
        </p>
      </footer>
    </div>
  );
}
