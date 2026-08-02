import { createFileRoute, Link } from "@tanstack/react-router";
import { RequireAuth } from "@/components/require-auth";
import { Clock, MapPin, Users } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { GroupChip, PageHeader, UrgencyBadge } from "@/components/redpint-ui";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import api from "@/lib/api";
import {
  BLOOD_GROUPS,
  URGENCY_META,
  type Urgency,
} from "@/lib/redpint-data";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/requests/")({
  head: () => ({
    meta: [
      { title: "Live Blood Requests — RedPint Hospital Board" },
    ],
  }),
  component: () => (
    <RequireAuth allowedRoles={["hospital"]}>
      <RequestBoard />
    </RequireAuth>
  ),
});

const FILTERS: (Urgency | "all")[] = ["all", "critical", "urgent", "routine"];

function RequestBoard() {
  const [urgency, setUrgency] = useState<Urgency | "all">("all");
  const [group, setGroup] = useState<string>("all");

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["blood-requests"],
    queryFn: async () => {
      const res = await api.get("/blood-requests");
      return res.data.requests || [];
    },
  });

  const rows = requests.filter(
    (r: any) => {
      const u = r.urgencyLevel === "normal" ? "routine" : r.urgencyLevel;
      return (urgency === "all" || u === urgency) && (group === "all" || r.bloodGroupNeeded === group);
    }
  );

  return (
    <>
      <PageHeader
        eyebrow="Request board"
        title="Open requests across the network"
        description="Critical entries stay pinned until units are pledged. Matched donor counts update as the engine re-runs eligibility."
      >
        <Button asChild size="lg">
          <Link to="/requests/new">Post a request</Link>
        </Button>
      </PageHeader>

      <div className="mx-auto max-w-7xl px-5 py-10">
        <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4 shadow-panel sm:flex-row sm:items-center">
          <div className="flex flex-wrap items-center gap-2">
            <span className="label-eyebrow mr-1">Urgency</span>
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setUrgency(f)}
                className={
                  urgency === f
                    ? "rounded-sm bg-primary px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary-foreground"
                    : "rounded-sm bg-surface px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
                }
              >
                {f === "all" ? "All" : URGENCY_META[f].label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
            <span className="label-eyebrow mr-1">Group</span>
            {["all", ...BLOOD_GROUPS].map((g) => (
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
        </div>

        <ul className="mt-6 grid gap-5">
          {isLoading && <p className="text-center p-10 text-muted-foreground">Loading requests...</p>}
          {rows.map((req: any) => {
            const mappedUrgency = req.urgencyLevel === "normal" ? "routine" : req.urgencyLevel;
            const units = req.unitsRequired || 1;
            const unitsPledged = 0; // Not tracked in backend directly yet
            const pct = Math.round((unitsPledged / units) * 100);
            
            // Generate string id since MongoDB _id is long
            const displayId = req._id.substring(req._id.length - 6).toUpperCase();
            
            return (
              <li
                key={req._id}
                className="rounded-lg border border-border bg-card p-6 shadow-panel"
              >
                <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:flex-wrap">
                  <div className="flex gap-6 sm:contents">
                    <GroupChip group={req.bloodGroupNeeded} size="lg" />
                    <div className="flex-1 sm:min-w-56">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-bold">{req.hospitalId?.name || "Unknown Hospital"}</h2>
                        <UrgencyBadge urgency={mappedUrgency} />
                      </div>
                      <p className="mt-1.5 text-sm text-muted-foreground">{req.status === 'matched' ? 'Matching engine has found donors.' : 'Pending matches...'}</p>
                      <p className="mt-3 flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-x-5 gap-y-1 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="size-3" /> {req.hospitalId?.address || "Mumbai"}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="size-3" /> {formatDistanceToNow(new Date(req.createdAt))} ago ·{" "}
                          {URGENCY_META[mappedUrgency as Urgency].window}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Users className="size-3" /> matches pending
                        </span>
                        <span className="font-mono">REQ-{displayId}</span>
                      </p>
                    </div>
                  </div>
                  <div className="w-full sm:w-56 sm:max-w-56">
                    <div className="flex items-baseline justify-between">
                      <span className="label-eyebrow">Units pledged</span>
                      <span className="font-display text-lg font-extrabold tabular-nums">
                        {unitsPledged}/{units}
                      </span>
                    </div>
                    <Progress value={pct} className="mt-2 h-1.5" />
                    <div className="mt-4 flex gap-2">
                      <Button asChild size="sm" className="flex-1">
                        <Link to="/hospital/request-matches" search={{ id: req._id }}>View matches</Link>
                      </Button>
                      <Button asChild size="sm" variant="outline" className="flex-1">
                        <Link to="/network">Find stock</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {!isLoading && rows.length === 0 ? (
          <p className="mt-10 rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            No open requests match these filters.
          </p>
        ) : null}
      </div>
    </>
  );
}

