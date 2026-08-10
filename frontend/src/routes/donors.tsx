import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/components/require-auth";
import { useAuth } from "@/lib/auth-context";
import { Lock, MapPin, Phone } from "lucide-react";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { GroupChip, PageHeader } from "@/components/redpint-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import {
  BLOOD_GROUPS,
  COOLDOWN_DAYS,
  type BloodGroup,
} from "@/lib/redpint-data";

export const Route = createFileRoute("/donors")({
  head: () => ({
    meta: [
      { title: "Donor Registry — RedPint Eligibility View" },
    ],
  }),
  component: () => (
    <RequireAuth allowedRoles={["hospital"]}>
      <DonorRegistry />
    </RequireAuth>
  ),
});

// We will get coords from profile now

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

function DonorRegistry() {
  const { profile } = useAuth();
  const hospitalLat = profile?.latitude ?? 19.076;
  const hospitalLng = profile?.longitude ?? 72.8777;

  const [query, setQuery] = useState("");
  const [group, setGroup] = useState<BloodGroup | "all">("all");
  const [onlyEligible, setOnlyEligible] = useState(true);

  const { data: rawDonors = [], isLoading } = useQuery({
    queryKey: ["all-donors"],
    queryFn: async () => {
      const res = await api.get("/donors");
      return res.data.donors || [];
    },
  });

  const processedDonors = useMemo(() => {
    return rawDonors.map((d: any, i: number) => {
      const distanceKm = Number(getDistance(hospitalLat, hospitalLng, d.latitude, d.longitude).toFixed(1));
      const diffDays = d.lastDonationDate 
        ? Math.floor((Date.now() - new Date(d.lastDonationDate).getTime()) / (1000 * 60 * 60 * 24))
        : 999;
      return { 
        ...d, 
        id: `D-${String(i+1000).padStart(4, '0')}`, // Mocking ID since backend excluded it for privacy
        distanceKm, 
        lastDonationDays: diffDays,
        area: "Mumbai",
        donations: 0, // Mock stats
        responseRate: 100 // Mock stats
      };
    });
  }, [rawDonors]);

  const rows = processedDonors.filter((d: any) => {
    const matchesGroup = group === "all" || d.bloodGroup === group;
    const matchesQuery =
      query.trim() === "" ||
      `${d.name} ${d.area} ${d.id}`.toLowerCase().includes(query.trim().toLowerCase());
    return matchesGroup && matchesQuery && (!onlyEligible || eligible(d.lastDonationDate));
  });

  return (
    <>
      <PageHeader
        eyebrow="Registry"
        title="Donor registry"
        description={`Eligibility is derived, not self-declared: a donor becomes available again ${COOLDOWN_DAYS} days after their last recorded donation.`}
      />

      <div className="mx-auto max-w-7xl px-5 py-10">
        <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4 shadow-panel lg:flex-row lg:items-center">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, area or donor ID"
            className="lg:max-w-72"
            aria-label="Search donors"
          />
          <div className="flex flex-wrap items-center gap-2">
            {(["all", ...BLOOD_GROUPS] as const).map((g) => (
              <button
                key={g}
                onClick={() => setGroup(g)}
                className={
                  group === g
                    ? "rounded-sm bg-ink px-2.5 py-1.5 font-mono text-xs font-bold text-ink-foreground"
                    : "rounded-sm bg-surface px-2.5 py-1.5 font-mono text-xs font-bold text-muted-foreground transition-colors hover:text-foreground"
                }
              >
                {g === "all" ? "ALL" : g}
              </button>
            ))}
          </div>
          <Button
            variant={onlyEligible ? "default" : "outline"}
            size="sm"
            className="lg:ml-auto"
            onClick={() => setOnlyEligible((v) => !v)}
          >
            {onlyEligible ? "Eligible only" : "Showing all donors"}
          </Button>
        </div>

        <div className="mt-6 overflow-x-auto rounded-lg border border-border bg-card shadow-panel">
          <table className="w-full min-w-3xl border-collapse text-sm">
            <caption className="sr-only">Registered donors with eligibility status</caption>
            <thead>
              <tr className="border-b border-border bg-surface">
                <th className="label-eyebrow p-4 text-left">Donor</th>
                <th className="label-eyebrow p-4 text-left">Group</th>
                <th className="label-eyebrow p-4 text-left">Location</th>
                <th className="label-eyebrow p-4 text-left">Last donation</th>
                <th className="label-eyebrow p-4 text-left">History</th>
                <th className="label-eyebrow p-4 text-left">Contact</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-muted-foreground">Loading donors...</td>
                </tr>
              )}
              {rows.map((d: any) => {
                const ok = eligible(d.lastDonationDate);
                return (
                  <tr key={d.id} className="border-b border-border last:border-0">
                    <td className="p-4">
                      <p className="font-semibold">{d.name}</p>
                      <p className="font-mono text-xs text-muted-foreground">{d.id}</p>
                    </td>
                    <td className="p-4">
                      <GroupChip group={d.bloodGroup} size="sm" />
                    </td>
                    <td className="p-4 text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="size-3" /> {d.area}
                      </span>
                      <span className="ml-2 font-mono text-xs">{d.distanceKm} km</span>
                    </td>
                    <td className="p-4">
                      <span
                        className={
                          ok
                            ? "inline-flex items-center gap-1.5 rounded-full bg-routine/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-routine"
                            : "inline-flex items-center gap-1.5 rounded-full bg-urgent/20 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-urgent"
                        }
                      >
                        {ok ? "Eligible" : `Cooldown · ${COOLDOWN_DAYS - d.lastDonationDays}d left`}
                      </span>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {d.lastDonationDays === 999 ? "Never" : `${d.lastDonationDays} days ago`}
                      </p>
                    </td>
                    <td className="p-4 tabular-nums text-muted-foreground">
                      {d.donations} donations · {d.responseRate}% response
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                        {ok ? <Lock className="size-3" /> : <Phone className="size-3" />}
                        {ok ? "Unlocks on accept" : "Unavailable"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {!isLoading && rows.length === 0 ? (
          <p className="mt-8 rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            No donors match these filters.
          </p>
        ) : null}
      </div>
    </>
  );
}
