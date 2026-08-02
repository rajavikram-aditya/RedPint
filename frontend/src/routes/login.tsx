import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
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

function Login() {
  const { role: searchRole } = Route.useSearch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isDonor = searchRole === "donor";
  const roleLabel = isDonor ? "Donor" : "Hospital";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);

      // Verify role by probing the backend
      try {
        if (isDonor) {
          const res = await api.get("/donors/me/profile");
          if (!res.data.donor) throw new Error("Not a donor account");
        } else {
          const res = await api.get("/hospitals/me/profile");
          if (!res.data.hospital) throw new Error("Not a hospital account");
        }
      } catch {
        // Wrong role — sign out and show error
        await auth.signOut();
        toast.error(`This account is not registered as a ${roleLabel.toLowerCase()}.`);
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

          <form onSubmit={handleSubmit}>
            <div className="grid gap-5">
              <div>
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-2"
                />
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
