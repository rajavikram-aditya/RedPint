import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { RequireAuth } from "@/components/require-auth";
import { useAuth } from "@/lib/auth-context";
import { CheckCircle2, MapPin, Radar } from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { GroupChip, PageHeader, UrgencyBadge } from "@/components/redpint-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import api from "@/lib/api";
import {
  BLOOD_GROUPS,
  COMPATIBILITY,
  COOLDOWN_DAYS,
  URGENCY_META,
  type BloodGroup,
  type Urgency,
} from "@/lib/redpint-data";

export const Route = createFileRoute("/requests/new")({
  head: () => ({
    meta: [
      { title: "Post a Blood Request — RedPint for Hospitals" },
    ],
  }),
  component: () => (
    <RequireAuth allowedRoles={["hospital"]}>
      <NewRequest />
    </RequireAuth>
  ),
});

const URGENCIES: Urgency[] = ["critical", "urgent", "routine"];

const requestSchema = z.object({
  units: z.coerce.number().min(1, "Minimum 1 unit").max(30, "Maximum 30 units"),
  ward: z.string().min(1, "Ward / contact is required"),
  note: z.string().optional(),
});
type RequestForm = z.infer<typeof requestSchema>;

// Haversine distance formula (in km)
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function eligible(lastDonationDate: string | null) {
  if (!lastDonationDate) return true;
  const diffDays = Math.floor((Date.now() - new Date(lastDonationDate).getTime()) / (1000 * 60 * 60 * 24));
  return diffDays >= COOLDOWN_DAYS;
}

function NewRequest() {
  const navigate = useNavigate();
  const [group, setGroup] = useState<BloodGroup>("O-");
  const [urgency, setUrgency] = useState<Urgency>("critical");
  const [radius, setRadius] = useState([8]);

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
  } = useForm<RequestForm>({
    resolver: zodResolver(requestSchema),
    defaultValues: { units: 4, ward: "", note: "" },
  });
  
  const { profile } = useAuth();
  const hospitalLat = profile?.latitude ?? 19.076;
  const hospitalLng = profile?.longitude ?? 72.8777;

  const { data: donors = [] } = useQuery({
    queryKey: ["all-donors"],
    queryFn: async () => {
      const res = await api.get("/donors");
      return res.data.donors || [];
    },
  });

  const radiusKm = radius[0] ?? 8;
  
  const shortlist = useMemo(() => {
    const allowed = COMPATIBILITY[group];
    return donors
      .map((d: any) => {
        const distanceKm = Number(getDistance(hospitalLat, hospitalLng, d.latitude, d.longitude).toFixed(1));
        const diffDays = d.lastDonationDate 
          ? Math.floor((Date.now() - new Date(d.lastDonationDate).getTime()) / (1000 * 60 * 60 * 24))
          : 999;
        return { ...d, distanceKm, lastDonationDays: diffDays };
      })
      .filter((d: any) => allowed.includes(d.bloodGroup) && d.distanceKm <= radiusKm && eligible(d.lastDonationDate))
      .sort((a: any, b: any) => a.distanceKm - b.distanceKm);
  }, [donors, group, radiusKm, hospitalLat, hospitalLng]);

  const mutation = useMutation({
    mutationFn: async (data: RequestForm) => {
      const mappedUrgency = urgency === "routine" ? "normal" : urgency;
      const res = await api.post("/blood-requests", {
        bloodGroupNeeded: group,
        unitsRequired: data.units,
        urgencyLevel: mappedUrgency,
        ward: data.ward,
        note: data.note,
      });
      return { res: res.data, data };
    },
    onSuccess: ({ res, data }) => {
      toast.success(`Request dispatched to ${res.matchCount} donors`, {
        description: `${data.units} unit(s) of ${group} · ${URGENCY_META[urgency].label} · ${radiusKm} km radius`,
      });
      navigate({ to: "/requests" });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create request");
    }
  });

  const onSubmit = (data: RequestForm) => {
    mutation.mutate(data);
  };

  return (
    <>
      <PageHeader
        eyebrow="Hospital intake"
        title="Post an urgent blood request"
        description="The shortlist on the right recalculates as you type. Nothing is sent until you dispatch notifications."
      />

      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 lg:grid-cols-[1.05fr_0.95fr]">
        <form
          className="rounded-lg border border-border bg-card p-6 shadow-panel"
          onSubmit={handleSubmit(onSubmit)}
        >
          <fieldset>
            <legend className="label-eyebrow">Blood group required</legend>
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
            <p className="mt-2 text-xs text-muted-foreground">
              Accepts donors from: {COMPATIBILITY[group].join(", ")}
            </p>
          </fieldset>

          <fieldset className="mt-8">
            <legend className="label-eyebrow">Urgency tier</legend>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {URGENCIES.map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setUrgency(u)}
                  aria-pressed={urgency === u}
                  className={
                    urgency === u
                      ? "rounded-sm border border-primary bg-primary/8 p-3 text-left"
                      : "rounded-sm border border-border bg-surface p-3 text-left transition-colors hover:border-primary/40"
                  }
                >
                  <UrgencyBadge urgency={u} />
                  <p className="mt-2 text-xs text-muted-foreground">{URGENCY_META[u].window}</p>
                </button>
              ))}
            </div>
          </fieldset>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <div>
              <Label htmlFor="units">Units needed</Label>
              <Input
                id="units"
                type="number"
                min={1}
                max={30}
                className="mt-2"
                {...register("units")}
              />
              {touchedFields.units && errors.units && (
                <p className="mt-1 text-xs text-destructive">{errors.units.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="ward">Ward / contact</Label>
              <Input id="ward" placeholder="Trauma ICU · Dr. Mehta" className="mt-2" {...register("ward")} />
              {touchedFields.ward && errors.ward && (
                <p className="mt-1 text-xs text-destructive">{errors.ward.message}</p>
              )}
            </div>
          </div>

          <div className="mt-8">
            <div className="flex items-center justify-between">
              <Label htmlFor="radius">Search radius</Label>
              <span className="font-mono text-sm tabular-nums">{radiusKm} km</span>
            </div>
            <Slider
              id="radius"
              value={radius}
              onValueChange={setRadius}
              min={2}
              max={25}
              step={1}
              className="mt-4"
            />
          </div>

          <div className="mt-8">
            <Label htmlFor="note">Clinical note</Label>
            <Textarea
              id="note"
              rows={3}
              placeholder="Multi-vehicle collision, two patients in theatre."
              className="mt-2"
              {...register("note")}
            />
          </div>

          <Button type="submit" size="lg" className="mt-8 w-full" disabled={mutation.isPending}>
            {mutation.isPending ? "Dispatching..." : `Dispatch to ${shortlist.length} matched donors`}
          </Button>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Donor contact details unlock only after a donor accepts.
          </p>
        </form>

        <aside className="space-y-5">
          <div className="rounded-lg border border-border bg-card p-6 shadow-panel">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-sm bg-primary/10 text-primary">
                <Radar className="size-5" />
              </span>
              <div>
                <p className="label-eyebrow">Matching preview</p>
                <p className="font-display text-xl font-extrabold">
                  {shortlist.length} eligible donors
                </p>
              </div>
            </div>
            <ul className="mt-4 grid gap-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                Compatible with {group} red-cell transfusion
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                Within {radiusKm} km of the requesting facility
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                Past the fixed {COOLDOWN_DAYS}-day donation cooldown
              </li>
            </ul>
          </div>

          <ul className="grid gap-3">
            {shortlist.map((d: any, idx: number) => (
              <li
                key={idx}
                className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 shadow-panel"
              >
                <GroupChip group={d.bloodGroup} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{d.name}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="size-3" /> Mumbai · {d.distanceKm} km · last gave{" "}
                    {d.lastDonationDays === 999 ? "never" : `${d.lastDonationDays}d ago`}
                  </p>
                </div>
              </li>
            ))}
            {shortlist.length === 0 ? (
              <li className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                No eligible donors in this radius. Widen the search or check network stock.
              </li>
            ) : null}
          </ul>
        </aside>
      </div>
    </>
  );
}

