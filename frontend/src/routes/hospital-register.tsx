import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Droplet, ArrowLeft, Building2, ShieldCheck, Clock } from "lucide-react";

export const Route = createFileRoute("/hospital-register")({
  head: () => ({
    meta: [{ title: "Register Hospital — RedPint" }],
  }),
  component: HospitalRegister,
});

function HospitalRegister() {
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    contactNumber: "",
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Mock geocoding (Mumbai center + jitter)
      const mockLat = 19.076 + (Math.random() * 0.1 - 0.05);
      const mockLng = 72.8777 + (Math.random() * 0.1 - 0.05);

      const apiFormData = new FormData();
      apiFormData.append("name", formData.name);
      apiFormData.append("email", formData.email);
      apiFormData.append("password", formData.password);
      apiFormData.append("address", formData.address);
      apiFormData.append("contactNumber", formData.contactNumber);
      apiFormData.append("latitude", mockLat.toString());
      apiFormData.append("longitude", mockLng.toString());

      const res = await api.post("/hospitals/register", apiFormData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.success) {
        setSession(res.data.token, "hospital", res.data.hospital);
        toast.success("Hospital registered successfully", {
          description: "Your registration is submitted for administrator review.",
        });
        setSubmitted(true);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Registration failed";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-5 py-12">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-panel text-center">
          <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-amber-500/10 text-amber-500 mb-4">
            <Clock className="size-7" />
          </div>
          <h2 className="text-2xl font-black font-display">Registration Submitted</h2>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            Thank you for registering <strong>{formData.name}</strong>. Your account has been registered in the database and is currently pending verification from the RedPint administration.
          </p>
          <div className="mt-8 grid gap-3">
            <Button onClick={() => navigate({ to: "/hospital/dashboard" })} size="lg" className="font-bold">
              Go to Hospital Dashboard
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate({ to: "/" })}
            >
              Return to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-5 py-12">
      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-8">
        <span className="grid size-8 place-items-center rounded-sm gradient-pint text-primary-foreground">
          <Droplet className="size-4" strokeWidth={2.4} />
        </span>
        <span className="font-display text-lg font-extrabold tracking-tight">RedPint</span>
      </div>

      <div className="w-full max-w-2xl">
        <button
          onClick={() => navigate({ to: "/login", search: { role: "hospital" } })}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="size-4" /> Back to login
        </button>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Form */}
          <form
            className="rounded-lg border border-border bg-card p-8 shadow-panel"
            onSubmit={handleSubmit}
          >
            <div className="mb-6">
              <p className="label-eyebrow">Hospital registration</p>
              <h1 className="mt-2 text-2xl font-extrabold">Join the network</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Register your hospital to post blood requests and coordinate with donors.
              </p>
            </div>

            <div className="grid gap-5">
              <div>
                <Label htmlFor="name">Hospital name</Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="KEM Hospital"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  required
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Parel, Mumbai 400012"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="contactNumber">Blood bank desk number</Label>
                <Input
                  id="contactNumber"
                  required
                  value={formData.contactNumber}
                  onChange={handleChange}
                  placeholder="+91 22 2413 6051"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="email">Admin email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="bloodbank@kemhospital.org"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="mt-2"
                />
              </div>
            </div>

            <Button type="submit" size="lg" className="mt-8 w-full font-bold" disabled={isLoading}>
              {isLoading ? "Registering..." : "Register hospital"}
            </Button>

            <p className="mt-4 text-center text-sm text-muted-foreground">
              Already registered?{" "}
              <Link
                to="/login"
                search={{ role: "hospital" }}
                className="font-semibold text-primary hover:underline"
              >
                Log in
              </Link>
            </p>
          </form>

          {/* Info sidebar */}
          <aside className="space-y-5 hidden lg:block">
            <div className="rounded-lg border border-border bg-card p-6 shadow-panel">
              <span className="grid size-10 place-items-center rounded-sm bg-primary/10 text-primary">
                <Building2 className="size-5" />
              </span>
              <h2 className="mt-4 text-lg font-bold">Network visibility</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Once verified, your hospital joins the inter-hospital stock network — see
                what other facilities have before escalating to donor notifications.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-6 shadow-panel">
              <span className="grid size-10 place-items-center rounded-sm bg-primary/10 text-primary">
                <ShieldCheck className="size-5" />
              </span>
              <h2 className="mt-4 text-lg font-bold">Donor privacy</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Contact details of matched donors are only revealed after they explicitly
                accept your request. No spam, no unsolicited calls.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
