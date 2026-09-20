import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  Droplet,
  Eye,
  EyeOff,
  Heart,
  HeartPulse,
  LockKeyhole,
  ShieldCheck,
  ShieldAlert,
  Users,
} from "lucide-react";
import api from "@/lib/api";

export const Route = createFileRoute("/login")({
  component: Login,
  validateSearch: (search: Record<string, unknown>) => ({
    role: (search["role"] as "donor" | "hospital" | "admin" | undefined) || "donor",
  }),
});

const loginSchema = z.object({
  email: z.string().min(1, "Email address is required").email("Invalid email address"),
  password: z.string().min(1, "Password is required").min(6, "Password must be at least 6 characters"),
});
type LoginForm = z.infer<typeof loginSchema>;

function getFirebaseErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = (error as { code: string }).code;
    switch (code) {
      case "auth/invalid-credential":
      case "auth/user-not-found":
      case "auth/wrong-password":
        return "Invalid email or password. Please check your credentials and try again.";
      case "auth/too-many-requests":
        return "Too many failed attempts. Please reset your password or try again later.";
      case "auth/user-disabled":
        return "This account has been disabled. Please contact support.";
      case "auth/network-request-failed":
        return "Network connection error. Please check your internet connection.";
      default:
        return (error as { message?: string }).message || "Failed to log in";
    }
  }
  return error instanceof Error ? error.message : "An unexpected error occurred during sign-in";
}

function Login() {
  const { role: searchRole } = Route.useSearch();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const activeRole: "donor" | "hospital" | "admin" =
    searchRole === "hospital" ? "hospital" : searchRole === "admin" ? "admin" : "donor";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const isDonor = activeRole === "donor";
  const isAdmin = activeRole === "admin";
  const isHospital = activeRole === "hospital";
  const roleLabel = isDonor ? "Donor" : isAdmin ? "Admin" : "Hospital";

  const setRole = (newRole: "donor" | "hospital" | "admin") => {
    navigate({ to: "/login", search: { role: newRole } });
  };

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);

      // Verify role by probing backend. If selected role fails, auto-probe other roles to be helpful.
      let detectedRole: "donor" | "hospital" | "admin" | null = null;

      try {
        if (isAdmin) {
          const res = await api.get("/admin/me");
          if (res.data.admin) detectedRole = "admin";
        } else if (isDonor) {
          const res = await api.get("/donors/me/profile");
          if (res.data.donor) detectedRole = "donor";
        } else {
          const res = await api.get("/hospitals/me/profile");
          if (res.data.hospital) detectedRole = "hospital";
        }
      } catch {
        // Requested role failed; check fallback roles
      }

      if (!detectedRole) {
        try {
          const donorRes = await api.get("/donors/me/profile");
          if (donorRes.data.donor) detectedRole = "donor";
        } catch {}

        if (!detectedRole) {
          try {
            const hospitalRes = await api.get("/hospitals/me/profile");
            if (hospitalRes.data.hospital) detectedRole = "hospital";
          } catch {}
        }

        if (!detectedRole) {
          try {
            const adminRes = await api.get("/admin/me");
            if (adminRes.data.admin) detectedRole = "admin";
          } catch {}
        }
      }

      if (!detectedRole) {
        await auth.signOut();
        toast.error(`This account is not registered in the system as a ${roleLabel.toLowerCase()}.`);
        setIsLoading(false);
        return;
      }

      if (detectedRole !== activeRole) {
        toast.info(`Signed in! Switched to your ${detectedRole.toLowerCase()} workspace automatically.`);
      } else {
        toast.success(`Logged in as ${roleLabel}`);
      }

      const targetPath =
        detectedRole === "admin"
          ? "/admin/dashboard"
          : detectedRole === "donor"
          ? "/donor/dashboard"
          : "/hospital/dashboard";

      navigate({ to: targetPath });
    } catch (err: unknown) {
      toast.error(getFirebaseErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page min-h-screen bg-background text-foreground">
      <div className="grid min-h-screen lg:grid-cols-[minmax(360px,0.82fr)_minmax(520px,1.18fr)]">
        {/* Left Branding Side Banner */}
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
              {roleLabel} access
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

        {/* Right Form Main Content */}
        <main className="login-main relative flex min-h-screen flex-col px-5 py-7 sm:px-10 lg:px-16 lg:py-10">
          <div className="mb-8 flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate({ to: "/" })}
              className="inline-flex items-center gap-2 rounded-full px-2 py-1 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ArrowLeft className="size-4" /> Home
            </button>
            <div className="flex items-center gap-2 lg:hidden">
              <span className="grid size-8 place-items-center rounded-xl gradient-pint text-primary-foreground">
                <Droplet className="size-4" />
              </span>
              <span className="font-display text-base font-black tracking-tight">RedPint</span>
            </div>
          </div>

          <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center pb-8">
            <div className="mb-6">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-success">
                <span className="grid size-7 place-items-center rounded-full bg-success/10">
                  <Check className="size-4" />
                </span>
                <span>Secure access for {roleLabel.toLowerCase()} accounts</span>
              </div>
              <p className="label-eyebrow text-primary">{roleLabel} login</p>
              <h1 className="mt-2 max-w-lg font-display text-3xl font-black leading-[0.98] tracking-[-0.05em] sm:text-4xl">
                Welcome back to RedPint.
              </h1>
            </div>

            <div className="rounded-[1.75rem] border border-border bg-card p-6 shadow-panel sm:p-8">
              {/* Interactive Role Switcher Tabs */}
              <div className="mb-6">
                <Label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Select Account Type
                </Label>
                <div className="grid grid-cols-3 gap-1.5 rounded-2xl bg-surface p-1.5">
                  <button
                    type="button"
                    onClick={() => setRole("donor")}
                    className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all ${
                      isDonor
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Heart className={`size-3.5 ${isDonor ? "text-primary" : ""}`} />
                    Donor
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole("hospital")}
                    className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all ${
                      isHospital
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Building2 className={`size-3.5 ${isHospital ? "text-primary" : ""}`} />
                    Hospital
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole("admin")}
                    className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all ${
                      isAdmin
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <ShieldCheck className={`size-3.5 ${isAdmin ? "text-primary" : ""}`} />
                    Admin
                  </button>
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
                      className={`mt-2 h-12 rounded-xl bg-background px-4 ${
                        errors.email ? "border-destructive focus-visible:ring-destructive" : ""
                      }`}
                      {...register("email")}
                    />
                    {errors.email && (
                      <p className="mt-2 text-xs font-medium text-destructive flex items-center gap-1">
                        <ShieldAlert className="size-3.5 inline" /> {errors.email.message}
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
                    <div className="relative mt-2">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        className={`h-12 rounded-xl bg-background pl-4 pr-11 ${
                          errors.password ? "border-destructive focus-visible:ring-destructive" : ""
                        }`}
                        {...register("password")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-muted-foreground hover:text-foreground focus:outline-none"
                        tabIndex={-1}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-2 text-xs font-medium text-destructive flex items-center gap-1">
                        <ShieldAlert className="size-3.5 inline" /> {errors.password.message}
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="mt-7 h-12 w-full rounded-xl shadow-lift font-bold"
                  disabled={isLoading}
                >
                  {isLoading ? "Checking your access..." : `Log in as ${roleLabel}`}
                  {!isLoading && <ArrowRight className="size-4" />}
                </Button>
              </form>

              <div className="mt-6 flex items-start gap-3 border-t border-border pt-5 text-xs leading-5 text-muted-foreground">
                <LockKeyhole className="mt-0.5 size-4 shrink-0 text-primary" />
                <p>
                  Your credentials are securely verified using Firebase Authentication and encrypted token sessions.
                </p>
              </div>
            </div>

            <p className="mt-7 text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                to={isDonor ? "/register" : isHospital ? "/hospital-register" : "/register"}
                className="font-bold text-primary transition-colors hover:text-primary/80 hover:underline"
              >
                Register as {roleLabel}
              </Link>
            </p>
          </div>

          <div className="flex items-center justify-between border-t border-border/80 pt-5 font-mono text-[0.58rem] uppercase tracking-[0.15em] text-muted-foreground/70">
            <span>Access / {roleLabel}</span>
            <span className="inline-flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-success" /> Connection ready
            </span>
          </div>
        </main>
      </div>
    </div>
  );
}
