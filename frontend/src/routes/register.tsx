import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { BellRing, ShieldCheck, ArrowLeft, Droplet } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import api from "@/lib/api";
import { PageHeader } from "@/components/redpint-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { BLOOD_GROUPS, COOLDOWN_DAYS, type BloodGroup } from "@/lib/redpint-data";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Register as a Blood Donor — RedPint" },
    ],
  }),
  component: Register,
});

function Register() {
  const navigate = useNavigate();
  const [group, setGroup] = useState<BloodGroup | null>(null);
  const [alerts, setAlerts] = useState(true);
  const [drives, setDrives] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    area: "",
    lastDonationDate: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!group) {
      toast.error("Select your blood group to continue");
      return;
    }

    setIsLoading(true);
    try {
      // 1. Firebase Auth Registration
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      
      // 2. Mock Geocoding based on area (since we don't have a real geocoder here)
      // Hardcoded to Mumbai for demo
      const mockLat = 19.0760 + (Math.random() * 0.1 - 0.05);
      const mockLng = 72.8777 + (Math.random() * 0.1 - 0.05);

      // 3. Register donor in backend API
      const apiFormData = new FormData();
      apiFormData.append("name", formData.name);
      apiFormData.append("phone", formData.phone);
      apiFormData.append("bloodGroup", group);
      apiFormData.append("latitude", mockLat.toString());
      apiFormData.append("longitude", mockLng.toString());
      if (formData.lastDonationDate) {
        apiFormData.append("lastDonationDate", formData.lastDonationDate);
      }

      await api.post("/donors/register", apiFormData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Registration successful", {
        description: `Group ${group} · You will receive matches when needed.`,
      });
      navigate({ to: "/donor/dashboard" });
    } catch (err: any) {
      toast.error(err.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background px-5 py-12">
      {/* Logo */}
      <div className="flex items-center gap-2.5 justify-center mb-8">
        <span className="grid size-8 place-items-center rounded-sm gradient-pint text-primary-foreground">
          <Droplet className="size-4" strokeWidth={2.4} />
        </span>
        <span className="font-display text-lg font-extrabold tracking-tight">RedPint</span>
      </div>

      <div className="mx-auto max-w-5xl">
        <button
          onClick={() => navigate({ to: "/login", search: { role: "donor" } })}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="size-4" /> Back to login
        </button>

        <PageHeader
          eyebrow="Donor registration"
          title="Join the shortlist"
          description={`Your details stay masked to hospitals until you accept a request. Eligibility resets automatically ${COOLDOWN_DAYS} days after each donation.`}
        />
      </div>

      <div className="mx-auto grid max-w-5xl gap-8 px-5 py-10 lg:grid-cols-[1.1fr_0.9fr]">
        <form
          className="rounded-lg border border-border bg-card p-6 shadow-panel"
          onSubmit={handleSubmit}
        >
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <Label htmlFor="name">Full name</Label>
              <Input id="name" required value={formData.name} onChange={handleChange} placeholder="Aarav Menon" className="mt-2" />
            </div>
            <div>
              <Label htmlFor="phone">Mobile number</Label>
              <Input id="phone" required value={formData.phone} onChange={handleChange} placeholder="+91 98470 00000" className="mt-2" />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={formData.email} onChange={handleChange} placeholder="aarav@example.com" className="mt-2" />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required value={formData.password} onChange={handleChange} placeholder="••••••••" className="mt-2" />
            </div>
            <div>
              <Label htmlFor="area">Area / locality</Label>
              <Input id="area" required value={formData.area} onChange={handleChange} placeholder="Fort Kochi" className="mt-2" />
            </div>
            <div>
              <Label htmlFor="lastDonationDate">Last donation date</Label>
              <Input id="lastDonationDate" type="date" value={formData.lastDonationDate} onChange={handleChange} className="mt-2" />
            </div>
          </div>

          <fieldset className="mt-8">
            <legend className="label-eyebrow">Blood group</legend>
            <div className="mt-3 grid grid-cols-4 gap-2">
              {BLOOD_GROUPS.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGroup(g)}
                  aria-pressed={group === g}
                  className={
                    group === g
                      ? "rounded-sm border border-primary bg-primary py-3 font-mono text-sm font-bold text-primary-foreground"
                      : "rounded-sm border border-border bg-surface py-3 font-mono text-sm font-bold text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                  }
                >
                  {g}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="mt-8 grid gap-4">
            <div className="flex items-center justify-between gap-4 rounded-sm border border-border bg-surface p-4">
              <div>
                <p className="text-sm font-semibold">Urgent request alerts</p>
                <p className="text-xs text-muted-foreground">
                  Push notification when a compatible request is posted near you.
                </p>
              </div>
              <Switch
                checked={alerts}
                onCheckedChange={setAlerts}
                aria-label="Urgent request alerts"
              />
            </div>
            <div className="flex items-center justify-between gap-4 rounded-sm border border-border bg-surface p-4">
              <div>
                <p className="text-sm font-semibold">Drive invitations</p>
                <p className="text-xs text-muted-foreground">
                  Occasional invites to scheduled donation drives nearby.
                </p>
              </div>
              <Switch
                checked={drives}
                onCheckedChange={setDrives}
                aria-label="Drive invitations"
              />
            </div>
          </div>

          <Button type="submit" size="lg" className="mt-8 w-full" disabled={isLoading}>
            {isLoading ? "Registering..." : "Register as a donor"}
          </Button>
        </form>

        <aside className="space-y-5">
          <div className="rounded-lg border border-border bg-card p-6 shadow-panel">
            <span className="grid size-10 place-items-center rounded-sm bg-primary/10 text-primary">
              <ShieldCheck className="size-5" />
            </span>
            <h2 className="mt-4 text-lg font-bold">Contact details stay private</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Hospitals see your group, approximate distance and eligibility — never your number
              until you accept a specific request.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6 shadow-panel">
            <span className="grid size-10 place-items-center rounded-sm bg-primary/10 text-primary">
              <BellRing className="size-5" />
            </span>
            <h2 className="mt-4 text-lg font-bold">No spam, only real matches</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              The engine filters by compatibility, proximity and the {COOLDOWN_DAYS}-day cooldown
              before anyone is notified, so alerts you receive are ones you can act on.
            </p>
          </div>
          <div className="rounded-lg gradient-pint p-6 text-primary-foreground shadow-lift">
            <p className="label-eyebrow text-primary-foreground/80">Already registered?</p>
            <p className="mt-2 font-display text-xl font-extrabold">
              Check your match inbox for pending requests.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

