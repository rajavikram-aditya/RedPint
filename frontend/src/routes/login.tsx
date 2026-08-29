import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  Droplet,
  Heart,
  HeartPulse,
  LockKeyhole,
  ShieldCheck,
  Users,
} from "lucide-react";
import api from "@/lib/api";

export const Route = createFileRoute("/login")({
  component: Login,
  validateSearch: (search: Record<string, unknown>) => ({
    role: search["role"] as "donor" | "hospital" | undefined,
  }),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
type LoginForm = z.infer<typeof loginSchema>;

function Login() {
  const { role: searchRole } = Route.useSearch();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const isDonor = searchRole === "donor";
  const roleLabel = isDonor ? "Donor" : "Hospital";

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);

      // Verify role by probing the backend.
      try {
        if (isDonor) {
          const res = await api.get("/donors/me/profile");
          if (!res.data.donor) throw new Error("Not a donor account");
        } else {
          const res = await api.get("/hospitals/me/profile");
          if (!res.data.hospital) throw new Error("Not a hospital account");
        }
      } catch (backendErr: unknown) {
        // Wrong role or server error — sign out and show error.
        const backendResponse =
          typeof backendErr === "object" && backendErr !== null && "response" in backendErr
            ? backendErr.response
            : undefined;
        const responseStatus =
          typeof backendResponse === "object" &&
          backendResponse !== null &&
          "status" in backendResponse
            ? backendResponse.status
            : undefined;
        const responseData =
          typeof backendResponse === "object" &&
          backendResponse !== null &&
          "data" in backendResponse
            ? backendResponse.data
            : undefined;
        const backendMessage =
          backendErr instanceof Error ? backendErr.message : "Unknown backend error";
        console.error("Backend role probe failed:", responseData || backendMessage);
        await auth.signOut();

        if (responseStatus === undefined || responseStatus >= 500) {
          toast.error(
            "Cannot connect to server. Please ensure the backend and database are running.",
          );
        } else {
          toast.error(`This account is not registered as a ${roleLabel.toLowerCase()}.`);
        }

        setIsLoading(false);
        return;
      }

      toast.success(`Logged in as ${roleLabel}`);
      navigate({ to: isDonor ? "/donor/dashboard" : "/hospital/dashboard" });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to log in");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page min-h-screen bg-background text-foreground">
      <div className="grid min-h-screen lg:grid-cols-[minmax(360px,0.82fr)_minmax(520px,1.18fr)]">
        <aside className="relative hidden overflow-hidden bg-ink text-ink-foreground lg:flex lg:flex-col lg:justify-between lg:p-10 xl:p-14">
          <div className="absolute inset-0 opacity-35" aria-hidden="true">
            <div className="absolute -left-24 top-24 size-72 rounded-full bg-primary blur-3xl" />
            <div className="absolute -bottom-32 -right-24 size-96 rounded-full bg-urgent blur-3xl" />
          </div>
          <div className="relative">
            <button
              type="button"
              onClick={() => navigate({ to: "/" })}
              className="group inline-flex items-center gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-ink"
              aria-label="Back to RedPint home"
            >
              <span className="grid size-11 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lift transition-transform duration-200 group-hover:scale-105">
                <Droplet className="size-5" strokeWidth={2.6} />
              </span>
              <span>
                <span className="block font-display text-lg font-black leading-none tracking-tight">
                  RedPint
                </span>
                <span className="mt-1 block font-mono text-[0.56rem] font-bold uppercase tracking-[0.22em] text-ink-foreground/50">
                  Response network
                </span>
              </span>
            </button>
          </div>

          <div className="relative max-w-md py-10">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-primary">
              {isDonor ? "Donor access" : "Hospital access"}
            </p>
            <h2 className="mt-5 font-display text-5xl font-black leading-[0.96] tracking-[-0.055em] xl:text-6xl">
              Good to see you back in the network.
            </h2>
            <p className="mt-6 max-w-sm text-sm leading-6 text-ink-foreground/60">
              Every sign in keeps the right people close to the moment they are needed most.
            </p>

            <div className="mt-10 space-y-4 border-t border-ink-foreground/10 pt-6">
              <div className="flex items-center gap-3 text-sm text-ink-foreground/75">
                <span className="grid size-8 place-items-center rounded-xl bg-ink-foreground/10 text-primary">
                  <HeartPulse className="size-4" />
                </span>{" "}
                Clear, role-specific workspace
              </div>
              <div className="flex items-center gap-3 text-sm text-ink-foreground/75">
                <span className="grid size-8 place-items-center rounded-xl bg-ink-foreground/10 text-primary">
                  <Users className="size-4" />
                </span>{" "}
                Built for fast human response
              </div>
              <div className="flex items-center gap-3 text-sm text-ink-foreground/75">
                <span className="grid size-8 place-items-center rounded-xl bg-ink-foreground/10 text-primary">
                  <ShieldCheck className="size-4" />
                </span>{" "}
                Secure account verification
              </div>
            </div>
          </div>

          <div className="relative flex items-center justify-between border-t border-ink-foreground/10 pt-5 font-mono text-[0.58rem] uppercase tracking-[0.16em] text-ink-foreground/40">
            <span>RedPint / 01</span>
            <span>Ready when you are</span>
          </div>
        </aside>

        <main className="login-main relative flex min-h-screen flex-col px-5 py-7 sm:px-10 lg:px-16 lg:py-10">
          <div className="mb-10 flex items-center justify-between lg:mb-16">
            <button
              type="button"
              onClick={() => navigate({ to: "/" })}
              className="inline-flex items-center gap-2 rounded-full px-1 py-1 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ArrowLeft className="size-4" /> Back to role selection
            </button>
            <div className="flex items-center gap-2 lg:hidden">
              <span className="grid size-8 place-items-center rounded-xl gradient-pint text-primary-foreground">
                <Droplet className="size-4" />
              </span>
              <span className="font-display text-base font-black tracking-tight">RedPint</span>
            </div>
          </div>

          <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center pb-8">
            <div className="mb-8">
              <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-success">
                <span className="grid size-7 place-items-center rounded-full bg-success/10">
                  <Check className="size-4" />
                </span>
                <span>Secure access for {roleLabel.toLowerCase()} accounts</span>
              </div>
              <p className="label-eyebrow text-primary">{roleLabel} login</p>
              <h1 className="mt-3 max-w-lg font-display text-4xl font-black leading-[0.98] tracking-[-0.05em] sm:text-5xl">
                Welcome back to your side of the network.
              </h1>
              <p className="mt-5 max-w-md text-sm leading-6 text-muted-foreground">
                Log in to continue coordinating blood availability with the people who can act.
              </p>
            </div>

            <div className="rounded-[1.75rem] border border-border bg-card p-6 shadow-panel sm:p-8">
              <div className="mb-7 flex items-center gap-3 rounded-2xl bg-surface px-4 py-3">
                <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                  {isDonor ? <Heart className="size-5" /> : <Building2 className="size-5" />}
                </span>
                <div>
                  <p className="text-sm font-bold">
                    {isDonor ? "Donor workspace" : "Hospital workspace"}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    You are signing in as a {roleLabel.toLowerCase()}.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className="grid gap-5">
                  <div>
                    <Label htmlFor="email" className="text-sm font-bold">
                      Email address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      className="mt-2 h-12 rounded-xl bg-background px-4"
                      {...register("email")}
                    />
                    {touchedFields.email && errors.email && (
                      <p className="mt-2 text-xs font-medium text-destructive">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <Label htmlFor="password" className="text-sm font-bold">
                        Password
                      </Label>
                      <span className="text-xs font-semibold text-muted-foreground">
                        Minimum 6 characters
                      </span>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      className="mt-2 h-12 rounded-xl bg-background px-4"
                      {...register("password")}
                    />
                    {touchedFields.password && errors.password && (
                      <p className="mt-2 text-xs font-medium text-destructive">
                        {errors.password.message}
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="mt-7 h-12 w-full rounded-xl shadow-lift"
                  disabled={isLoading}
                >
                  {isLoading ? "Checking your access..." : `Log in as ${roleLabel}`}
                  {!isLoading && <ArrowRight className="size-4" />}
                </Button>
              </form>

              <div className="mt-6 flex items-start gap-3 border-t border-border pt-5 text-xs leading-5 text-muted-foreground">
                <LockKeyhole className="mt-0.5 size-4 shrink-0 text-primary" />
                <p>
                  Your account is checked against the selected role before you enter the workspace.
                </p>
              </div>
            </div>

            <p className="mt-7 text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                to={isDonor ? "/register" : "/hospital-register"}
                className="font-bold text-primary transition-colors hover:text-primary/80 hover:underline"
              >
                Register as {roleLabel}
              </Link>
            </p>
          </div>

          <div className="flex items-center justify-between border-t border-border/80 pt-5 font-mono text-[0.58rem] uppercase tracking-[0.15em] text-muted-foreground/70">
            <span>Access / {isDonor ? "Donor" : "Hospital"}</span>
            <span className="inline-flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-success" /> Connection ready
            </span>
          </div>
        </main>
      </div>
    </div>
  );
}
