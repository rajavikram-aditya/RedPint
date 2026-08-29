import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { BellRing, ShieldCheck, ArrowLeft, Droplet } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
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

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone must be at least 10 digits"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  area: z.string().min(2, "Area must be at least 2 characters"),
  lastDonationDate: z.string().optional(),
});
type RegisterForm = z.infer<typeof registerSchema>;

function Register() {
  const navigate = useNavigate();
  const [group, setGroup] = useState<BloodGroup | null>(null);
  const [alerts, setAlerts] = useState(true);
  const [drives, setDrives] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<any>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", phone: "", password: "", area: "", lastDonationDate: "" },
  });

  const onSubmit = async (data: RegisterForm) => {
    if (!group) {
      toast.error("Select your blood group to continue");
      return;
    }

    setIsLoading(true);
    try {
      // 1. Firebase Auth Registration
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);

      // 2. Mock Geocoding based on area (since we don't have a real geocoder here)
      // Hardcoded to Mumbai for demo
      const mockLat = 19.0760 + (Math.random() * 0.1 - 0.05);
      const mockLng = 72.8777 + (Math.random() * 0.1 - 0.05);

      // 3. Register donor in backend API
      const apiFormData = new FormData();
      apiFormData.append("name", data.name);
      apiFormData.append("phone", data.phone);
      apiFormData.append("bloodGroup", group);
      apiFormData.append("latitude", mockLat.toString());
      apiFormData.append("longitude", mockLng.toString());
      if (data.lastDonationDate) {
        apiFormData.append("lastDonationDate", data.lastDonationDate);
      }

      await api.post("/donors/register", apiFormData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await sendEmailVerification(userCredential.user);
      setFirebaseUser(userCredential.user);

      toast.success("Registration successful", {
        description: `Please check your email to verify your account.`,
      });
      setVerificationSent(true);
    } catch (err: any) {
      toast.error(err.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationCheck = async () => {
    if (!firebaseUser) return;
    setIsLoading(true);
    try {
      await firebaseUser.reload();
      if (firebaseUser.emailVerified) {
        // Now tell backend to mark as verified
        const res = await api.post("/auth/verify");
        toast.success("Email verified!", { description: "Welcome to RedPint." });
        navigate({ to: "/donor/dashboard" });
      } else {
        toast.error("Email not verified yet. Please check your inbox and click the link.");
      }
    } catch (err: any) {
      toast.error(err.message || "Verification check failed");
    } finally {
      setIsLoading(false);
    }
  };

  if (verificationSent) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-5 py-12">
        <div className="w-full max-w-md rounded-lg border border-border bg-card p-8 shadow-panel text-center">
          <div className="mx-auto grid size-12 place-items-center rounded-full bg-primary/10 text-primary mb-4">
            <ShieldCheck className="size-6" />
          </div>
          <h2 className="text-2xl font-bold">Verify your email</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            We've sent a verification link.
            Please check your inbox (and spam folder) and click the link to activate your account.
          </p>
          <div className="mt-8 grid gap-3">
            <Button onClick={handleVerificationCheck} disabled={isLoading} size="lg">
              {isLoading ? "Checking..." : "I've verified my email"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                auth.signOut();
                navigate({ to: "/" });
              }}
              disabled={isLoading}
            >
              Cancel and return to home
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <Label htmlFor="name">Full name</Label>
              <Input id="name" placeholder="Aarav Menon" className="mt-2" {...register("name")} />
              {touchedFields.name && errors.name && (
                <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="phone">Mobile number</Label>
              <Input id="phone" placeholder="+91 98470 00000" className="mt-2" {...register("phone")} />
              {touchedFields.phone && errors.phone && (
                <p className="mt-1 text-xs text-destructive">{errors.phone.message}</p>
              )}
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="aarav@example.com" className="mt-2" {...register("email")} />
              {touchedFields.email && errors.email && (
                <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" className="mt-2" {...register("password")} />
              {touchedFields.password && errors.password && (
                <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="area">Area / locality</Label>
              <Input id="area" placeholder="Fort Kochi" className="mt-2" {...register("area")} />
              {touchedFields.area && errors.area && (
                <p className="mt-1 text-xs text-destructive">{errors.area.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="lastDonationDate">Last donation date</Label>
              <Input id="lastDonationDate" type="date" className="mt-2" {...register("lastDonationDate")} />
              {touchedFields.lastDonationDate && errors.lastDonationDate && (
                <p className="mt-1 text-xs text-destructive">{errors.lastDonationDate.message}</p>
              )}
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

