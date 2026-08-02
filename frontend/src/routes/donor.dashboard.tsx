import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, MapPin, Calendar, FileText, Inbox, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { RequireAuth } from "@/components/require-auth";
import { useAuth } from "@/lib/auth-context";
import { GroupChip, PageHeader } from "@/components/redpint-ui";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";

export const Route = createFileRoute("/donor/dashboard")({
  head: () => ({
    meta: [{ title: "Donor Dashboard — RedPint" }],
  }),
  component: () => (
    <RequireAuth allowedRoles={["donor"]}>
      <DonorDashboard />
    </RequireAuth>
  ),
});

function DonorDashboard() {
  const { profile } = useAuth();

  // Lives saved (from donation history)
  const { data: donations = [] } = useQuery({
    queryKey: ["my-donations"],
    queryFn: async () => {
      try {
        const res = await api.get("/donations");
        return res.data.donations || [];
      } catch {
        return [];
      }
    },
  });

  // Active matches
  const { data: matches = [] } = useQuery({
    queryKey: ["my-matches"],
    queryFn: async () => {
      try {
        const res = await api.get("/donors/me/matches");
        return res.data.matches || [];
      } catch {
        return [];
      }
    },
  });

  // Nearby hospitals
  const { data: hospitals = [] } = useQuery({
    queryKey: ["hospitals"],
    queryFn: async () => {
      try {
        const res = await api.get("/hospitals");
        return res.data.hospitals || [];
      } catch {
        return [];
      }
    },
  });

  // Upcoming drives
  const { data: drives = [] } = useQuery({
    queryKey: ["drives"],
    queryFn: async () => {
      try {
        const res = await api.get("/drives");
        return res.data.drives || [];
      } catch {
        return [];
      }
    },
  });

  const pendingMatches = matches.filter((m: any) => m.responseStatus === "pending");
  const livesSaved = donations.length * 3;

  return (
    <>
      <PageHeader
        eyebrow="Donor dashboard"
        title={`Welcome back, ${profile?.name || "Donor"}`}
        description="Your blood type can save lives. Here's your personalized overview."
      />

      <div className="mx-auto max-w-7xl px-5 py-10">
        {/* Stats cards */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Lives Saved */}
          <div className="rounded-lg border border-border bg-card p-6 shadow-panel">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-sm bg-red-500/10 text-red-500">
                <Heart className="size-5" />
              </span>
              <div>
                <p className="label-eyebrow">Lives saved</p>
                <p className="font-display text-3xl font-extrabold tabular-nums">{livesSaved}</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Based on {donations.length} donation{donations.length !== 1 ? "s" : ""} × 3 patients per unit
            </p>
          </div>

          {/* Blood Group */}
          <div className="rounded-lg border border-border bg-card p-6 shadow-panel">
            <p className="label-eyebrow">Your blood group</p>
            <div className="mt-3 flex items-center gap-3">
              <GroupChip group={profile?.bloodGroup || "O+"} size="lg" />
              <div>
                <p className="text-sm font-semibold">{profile?.bloodGroup || "O+"}</p>
                <p className="text-xs text-muted-foreground">
                  {profile?.verified ? "Verified" : "Pending verification"}
                </p>
              </div>
            </div>
          </div>

          {/* Pending Matches */}
          <Link to="/matches" className="rounded-lg border border-border bg-card p-6 shadow-panel transition-colors hover:border-primary/40">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-sm bg-primary/10 text-primary">
                <Inbox className="size-5" />
              </span>
              <div>
                <p className="label-eyebrow">Pending matches</p>
                <p className="font-display text-3xl font-extrabold tabular-nums">{pendingMatches.length}</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-primary font-medium inline-flex items-center gap-1">
              View inbox <ArrowRight className="size-3" />
            </p>
          </Link>

          {/* Documents */}
          <Link to="/donor/documents" className="rounded-lg border border-border bg-card p-6 shadow-panel transition-colors hover:border-primary/40">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-sm bg-primary/10 text-primary">
                <FileText className="size-5" />
              </span>
              <div>
                <p className="label-eyebrow">Documents</p>
                <p className="text-sm font-semibold mt-1">
                  {profile?.documentUrl ? "Uploaded" : "None uploaded"}
                </p>
              </div>
            </div>
            <p className="mt-3 text-xs text-primary font-medium inline-flex items-center gap-1">
              Manage docs <ArrowRight className="size-3" />
            </p>
          </Link>
        </div>

        {/* Nearby Hospitals */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Nearby hospitals</h2>
            <Button asChild variant="ghost" size="sm">
              <Link to="/donor/hospitals">
                View all <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {hospitals.slice(0, 3).map((h: any) => (
              <div key={h._id} className="rounded-lg border border-border bg-card p-5 shadow-panel">
                <p className="font-semibold">{h.name}</p>
                <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="size-3" /> {h.address}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{h.contactNumber}</p>
              </div>
            ))}
            {hospitals.length === 0 && (
              <p className="text-sm text-muted-foreground col-span-3">No hospitals found in the network.</p>
            )}
          </div>
        </div>

        {/* Upcoming Drives */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Upcoming drives</h2>
            <Button asChild variant="ghost" size="sm">
              <Link to="/drives">
                View all <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {drives.slice(0, 3).map((d: any) => {
              const dateObj = new Date(d.date);
              return (
                <div key={d._id} className="rounded-lg border border-border bg-card p-5 shadow-panel">
                  <div className="flex items-center gap-3">
                    <div className="rounded-sm gradient-pint px-3 py-2 text-center text-primary-foreground">
                      <p className="font-display text-lg font-extrabold leading-none">{dateObj.getDate()}</p>
                      <p className="mt-1 text-[10px] font-semibold uppercase tracking-widest">
                        {dateObj.toLocaleString("en-US", { month: "short" })}
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold">{d.description || "Community Drive"}</p>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="size-3" /> {dateObj.toLocaleString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            {drives.length === 0 && (
              <p className="text-sm text-muted-foreground col-span-3">No upcoming drives scheduled.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
