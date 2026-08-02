import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/components/require-auth";
import { Check, MapPin, Phone, Timer, X } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GroupChip, PageHeader, UrgencyBadge } from "@/components/redpint-ui";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { URGENCY_META, type Urgency } from "@/lib/redpint-data";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/matches")({
  head: () => ({
    meta: [
      { title: "Match Inbox — Accept or Decline Blood Requests | RedPint" },
    ],
  }),
  component: () => (
    <RequireAuth allowedRoles={["donor"]}>
      <MatchInbox />
    </RequireAuth>
  ),
});

function MatchInbox() {
  const queryClient = useQueryClient();

  const { data: matches = [], isLoading } = useQuery({
    queryKey: ["my-matches"],
    queryFn: async () => {
      try {
        const res = await api.get("/donors/me/matches");
        return res.data.matches || [];
      } catch (err) {
        // May fail if not logged in as donor
        return [];
      }
    },
  });

  const mutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await api.patch(`/matches/${id}/respond`, { responseStatus: status });
      return { id, status, data: res.data };
    },
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: ["my-matches"] });
      if (variables.status === "accepted") {
        toast.success("Acceptance sent", {
          description: `The hospital can now see your contact details for coordination.`,
        });
      } else {
        toast("Declined", { description: "The slot has been re-opened to other matched donors." });
      }
    },
    onError: () => {
      toast.error("Failed to update response");
    }
  });

  const pendingCount = matches.filter((m: any) => m.responseStatus === "pending").length;

  return (
    <>
      <PageHeader
        eyebrow="Donor view"
        title="Match inbox"
        description="You only appear here when a nearby hospital needs a group you can give and you are past the cooldown. Declining costs you nothing."
      >
        <div className="rounded-lg border border-border bg-card px-5 py-3 shadow-panel">
          <p className="label-eyebrow">Awaiting your response</p>
          <p className="font-display text-2xl font-extrabold tabular-nums">{pendingCount}</p>
        </div>
      </PageHeader>

      <div className="mx-auto max-w-4xl px-5 py-10">
        <ul className="grid gap-5">
          {isLoading && <p className="text-center p-10 text-muted-foreground">Loading matches... (Make sure you are logged in as a donor)</p>}
          {matches.map((m: any) => {
            const status = m.responseStatus;
            const hospital = m.requestId?.hospitalId;
            const mappedUrgency = (m.requestId?.urgencyLevel === "normal" ? "routine" : m.requestId?.urgencyLevel) as Urgency;
            
            // Calculate a mock score since backend doesn't provide one
            const score = Math.max(0, 100 - Math.round(m.distanceKm * 2));
            
            return (
              <li
                key={m._id}
                className="rounded-lg border border-border bg-card p-6 shadow-panel"
              >
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:flex-wrap">
                  <div className="flex gap-5 sm:contents">
                    <GroupChip group={m.requestId?.bloodGroupNeeded || "O+"} size="lg" />
                    <div className="flex-1 sm:min-w-56">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-bold">{hospital?.name || "Unknown Hospital"}</h2>
                        {mappedUrgency && <UrgencyBadge urgency={mappedUrgency} />}
                      </div>
                      <p className="mt-1.5 text-sm text-muted-foreground">Exact group · eligible past cooldown</p>
                      <p className="mt-3 flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-x-5 gap-y-1 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="size-3" /> {Number(m.distanceKm).toFixed(1)} km away
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Timer className="size-3" /> {mappedUrgency ? URGENCY_META[mappedUrgency].window : "ASAP"} · notified{" "}
                          {formatDistanceToNow(new Date(m.createdAt))} ago
                        </span>
                        <span className="font-mono">REQ-{m.requestId?._id?.substring(0,6).toUpperCase()}</span>
                      </p>
                    </div>
                  </div>
                  <div className="w-full sm:w-44">
                    <div className="flex items-baseline justify-between">
                      <span className="label-eyebrow">Match score</span>
                      <span className="font-display text-lg font-extrabold tabular-nums">
                        {score}
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-2">
                      <div
                        className="h-full rounded-full gradient-pint"
                        style={{ width: `${score}%` }}
                      />
                    </div>

                    {status === "pending" ? (
                      <div className="mt-4 flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => mutation.mutate({ id: m._id, status: "accepted" })}
                          disabled={mutation.isPending}
                        >
                          <Check className="size-4" /> Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => mutation.mutate({ id: m._id, status: "declined" })}
                          disabled={mutation.isPending}
                        >
                          <X className="size-4" /> Decline
                        </Button>
                      </div>
                    ) : (
                      <p
                        className={
                          status === "accepted"
                            ? "mt-4 rounded-sm bg-routine/15 px-3 py-2 text-center text-xs font-semibold uppercase tracking-wider text-routine"
                            : "mt-4 rounded-sm bg-surface-2 px-3 py-2 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                        }
                      >
                        {status === "accepted" ? "Accepted" : "Declined"}
                      </p>
                    )}
                  </div>
                </div>

                {status === "accepted" && hospital ? (
                  <div className="mt-5 flex flex-wrap items-center gap-3 rounded-sm border border-primary/25 bg-primary/8 p-4">
                    <Phone className="size-4 text-primary" />
                    <p className="text-sm">
                      Coordination line unlocked —{" "}
                      <span className="font-mono">{hospital.contactNumber || "+91 000 000 0000"}</span> · Blood bank desk,{" "}
                      {hospital.name}
                    </p>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
        
        {!isLoading && matches.length === 0 && (
          <p className="mt-8 rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            No active matches.
          </p>
        )}
      </div>
    </>
  );
}
