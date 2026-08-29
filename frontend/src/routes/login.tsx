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
import { Droplet, ArrowLeft } from "lucide-react";
import api from "@/lib/api";

export const Route = createFileRoute("/login")({
  component: Login,
  validateSearch: (search: Record<string, unknown>) => ({
    role: search['role'] as "donor" | "hospital" | undefined,
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

      // Verify role by probing the backend
      try {
        if (isDonor) {
          const res = await api.get("/donors/me/profile");
          if (!res.data.donor) throw new Error("Not a donor account");
        } else {
          const res = await api.get("/hospitals/me/profile");
          if (!res.data.hospital) throw new Error("Not a hospital account");
        }
      } catch (backendErr: any) {
        // Wrong role or server error — sign out and show error
        console.error("Backend role probe failed:", backendErr.response?.data || backendErr.message);
        await auth.signOut();

        if (!backendErr.response || backendErr.response.status >= 500) {
          toast.error("Cannot connect to server. Please ensure the backend and database are running.");
        } else {
          toast.error(`This account is not registered as a ${roleLabel.toLowerCase()}.`);
        }

        setIsLoading(false);
        return;
      }

      toast.success(`Logged in as ${roleLabel}`);
      navigate({ to: isDonor ? "/donor/dashboard" : "/hospital/dashboard" });
    } catch (err: any) {
      toast.error(err.message || "Failed to log in");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-5">
      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-8">
        <span className="grid size-8 place-items-center rounded-sm gradient-pint text-primary-foreground">
          <Droplet className="size-4" strokeWidth={2.4} />
        </span>
        <span className="font-display text-lg font-extrabold tracking-tight">RedPint</span>
      </div>

      <div className="w-full max-w-md">
        <button
          onClick={() => navigate({ to: "/" })}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="size-4" /> Back to role selection
        </button>

        <div className="rounded-lg border border-border bg-card p-8 shadow-panel">
          <div className="mb-6">
            <p className="label-eyebrow">{roleLabel} login</p>
            <h1 className="mt-2 text-2xl font-extrabold">Welcome back</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Log in to your {roleLabel.toLowerCase()} account.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-5">
              <div>
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="mt-2"
                  {...register("email")}
                />
                {touchedFields.email && errors.email && (
                  <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="mt-2"
                  {...register("password")}
                />
                {touchedFields.password && errors.password && (
                  <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>
                )}
              </div>
            </div>

            <Button type="submit" size="lg" className="mt-8 w-full" disabled={isLoading}>
              {isLoading ? "Logging in..." : `Log in as ${roleLabel}`}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              to={isDonor ? "/register" : "/hospital-register"}
              className="font-semibold text-primary hover:underline"
            >
              Register as {roleLabel}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
