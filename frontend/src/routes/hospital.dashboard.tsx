import { createFileRoute, Link } from "@tanstack/react-router";
import { Droplet, Activity, Building2, Calendar, ArrowRight, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { RequireAuth } from "@/components/require-auth";
import { useAuth } from "@/lib/auth-context";
import { GroupChip, PageHeader, UrgencyBadge } from "@/components/redpint-ui";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { BLOOD_GROUPS, type Urgency } from "@/lib/redpint-data";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/hospital/dashboard")({
  head: () => ({
    meta: [{ title: "Hospital Dashboard — RedPint" }],
  }),
  component: () => (
    <RequireAuth allowedRoles={["hospital"]}>
      <HospitalDashboard />
    </RequireAuth>
  ),
});

function HospitalDashboard() {
  const { profile } = useAuth();

  // My requests
  const { data: myRequests = [] } = useQuery({
    queryKey: ["my-requests"],
    queryFn: async () => {
      try {
        const res = await api.get("/blood-requests/hospital/my-requests");
        return res.data.requests || [];
      } catch {
        return [];
      }
    },
  });

  // My stock
  const { data: myStock = [] } = useQuery({
    queryKey: ["my-stock"],
    queryFn: async () => {
      try {
        const res = await api.get(`/hospital-stock?hospitalId=${profile?._id}`);
        return res.data.stock || [];
      } catch {
        return [];
      }
    },
    enabled: !!profile?._id,
  });

  // My drives
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

  const myDrives = drives.filter(
    (d: any) => d.hospitalId?._id === profile?._id || d.hospitalId === profile?._id
  );

  const activeRequests = myRequests.filter((r: any) => r.status !== "fulfilled");

  return (
    <>
      <PageHeader
        eyebrow="Hospital dashboard"
        title={profile?.name || "Hospital"}
        description="Manage blood requests, stock inventory, and donor coordination."
      >
        <Button asChild size="lg" className="bg-red-600 hover:bg-red-700 text-white shadow-lg">
          <Link to="/requests/new">
            <Droplet className="size-4 mr-1.5" />
            Request Blood
          </Link>
        </Button>
      </PageHeader>

      <div className="mx-auto max-w-7xl px-5 py-10">
        {/* Quick stats */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-border bg-card p-6 shadow-panel">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-sm bg-red-500/10 text-red-500">
                <Activity className="size-5" />
              </span>
              <div>
                <p className="label-eyebrow">Active requests</p>
                <p className="font-display text-3xl font-extrabold tabular-nums">{activeRequests.length}</p>
              </div>
            </div>
          </div>

          <Link to="/hospital/stock" className="rounded-lg border border-border bg-card p-6 shadow-panel transition-colors hover:border-primary/40">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-sm bg-primary/10 text-primary">
                <Building2 className="size-5" />
              </span>
              <div>
                <p className="label-eyebrow">Stock entries</p>
                <p className="font-display text-3xl font-extrabold tabular-nums">{myStock.length}</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-primary font-medium inline-flex items-center gap-1">
              Manage stock <ArrowRight className="size-3" />
            </p>
          </Link>

          <Link to="/hospital/drives" className="rounded-lg border border-border bg-card p-6 shadow-panel transition-colors hover:border-primary/40">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-sm bg-primary/10 text-primary">
                <Calendar className="size-5" />
              </span>
              <div>
                <p className="label-eyebrow">My drives</p>
                <p className="font-display text-3xl font-extrabold tabular-nums">{myDrives.length}</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-primary font-medium inline-flex items-center gap-1">
              Manage drives <ArrowRight className="size-3" />
            </p>
          </Link>

          <Link to="/donors" className="rounded-lg border border-border bg-card p-6 shadow-panel transition-colors hover:border-primary/40">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-sm bg-primary/10 text-primary">
                <Users className="size-5" />
              </span>
              <div>
                <p className="label-eyebrow">Donor registry</p>
                <p className="text-sm font-medium mt-1">Browse donors</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-primary font-medium inline-flex items-center gap-1">
              View registry <ArrowRight className="size-3" />
            </p>
          </Link>
        </div>

        {/* My stock grid */}
        {myStock.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-bold mb-4">Current stock</h2>
            <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
              {BLOOD_GROUPS.map((g) => {
                const entry = myStock.find((s: any) => s.bloodGroup === g);
                const units = entry?.unitsAvailable || 0;
                return (
                  <div
                    key={g}
                    className={`rounded-lg border p-4 text-center ${units <= 3 ? "border-red-500/30 bg-red-500/5" : "border-border bg-card shadow-panel"}`}
                  >
                    <p className="font-mono text-sm font-bold text-primary">{g}</p>
                    <p className="mt-1 font-display text-2xl font-extrabold tabular-nums">{units}</p>
                    <p className="label-eyebrow">units</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Active requests */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">My blood requests</h2>
            <Button asChild variant="ghost" size="sm">
              <Link to="/requests">
                View all <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>

          {activeRequests.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
              No active requests. Click "Request Blood" to post one.
            </p>
          ) : (
            <ul className="grid gap-4">
              {activeRequests.slice(0, 5).map((req: any) => {
                const mappedUrgency = (req.urgencyLevel === "normal" ? "routine" : req.urgencyLevel) as Urgency;
                return (
                  <li key={req._id} className="flex items-center gap-5 rounded-lg border border-border bg-card p-5 shadow-panel">
                    <GroupChip group={req.bloodGroupNeeded} size="lg" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{req.bloodGroupNeeded} · {req.unitsRequired} units</p>
                        <UrgencyBadge urgency={mappedUrgency} />
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Posted {formatDistanceToNow(new Date(req.createdAt))} ago · Status: {req.status}
                      </p>
                    </div>
                    <Button asChild size="sm" variant="outline">
                      <Link to={`/requests`}>View</Link>
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
