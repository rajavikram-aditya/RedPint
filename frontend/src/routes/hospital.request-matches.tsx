import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Check, Clock, Phone, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RequireAuth } from "@/components/require-auth";
import { PageHeader, GroupChip } from "@/components/redpint-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";

export const Route = createFileRoute("/hospital/request-matches")({
  // The actual route in TanStack file-based routing with params usually uses $id
  // but since we specified this as `hospital.request-matches.tsx`, let's map it 
  // to a query param or re-write the filename. Wait, TanStack start uses `$` for path params.
  // Actually, I should name the file `hospital.request.$id.matches.tsx` or similar if I want path params.
  // Let's use search params `?id=` for simplicity here since the file is already named `hospital.request-matches.tsx` in my plan.
  validateSearch: (search: Record<string, unknown>) => ({
    id: search['id'] as string,
  }),
  head: () => ({
    meta: [{ title: "Request Matches — RedPint" }],
  }),
  component: () => (
    <RequireAuth allowedRoles={["hospital"]}>
      <RequestMatches />
    </RequireAuth>
  ),
});

function RequestMatches() {
  const { id } = Route.useSearch();
  const queryClient = useQueryClient();
  const [unitsDonated, setUnitsDonated] = useState<Record<string, string>>({});

  const { data: request, isLoading: requestLoading } = useQuery({
    queryKey: ["request", id],
    queryFn: async () => {
      const res = await api.get(`/blood-requests/${id}`);
      return res.data.request;
    },
    enabled: !!id,
  });

  const { data: matches = [], isLoading: matchesLoading } = useQuery({
    queryKey: ["request-matches", id],
    queryFn: async () => {
      const res = await api.get(`/blood-requests/${id}/matches`);
      return res.data.matches || [];
    },
    enabled: !!id,
  });

  const recordDonationMutation = useMutation({
    mutationFn: async ({ donorId, units }: { donorId: string; units: number }) => {
      const res = await api.post("/donations", {
        donorId,
        requestId: id,
        unitsDonated: units,
      });
      return res.data;
    },
    onSuccess: (data) => {
      toast.success("Donation recorded!");
      queryClient.invalidateQueries({ queryKey: ["request-matches", id] });
      queryClient.invalidateQueries({ queryKey: ["request", id] });
      setUnitsDonated({});
      if (data.requestFulfilled) {
        toast("Request fully fulfilled!");
      }
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to record donation");
    },
  });

  if (!id) {
    return (
      <div className="p-10 text-center text-muted-foreground">
        No request ID provided. <Link to="/requests" className="text-primary underline">Go back</Link>.
      </div>
    );
  }

  const isLoading = requestLoading || matchesLoading;
  
  const acceptedMatches = matches.filter((m: any) => m.responseStatus === "accepted");
  const pendingMatches = matches.filter((m: any) => m.responseStatus === "pending");
  const declinedMatches = matches.filter((m: any) => m.responseStatus === "declined");

  return (
    <>
      <PageHeader
        eyebrow="Hospital view"
        title="Matched donors"
        description="Donors who matched your request and their response status."
      >
        <Button asChild variant="outline" size="sm">
          <Link to="/requests">
            <ArrowLeft className="size-4 mr-1.5" /> Back to requests
          </Link>
        </Button>
      </PageHeader>

      <div className="mx-auto max-w-5xl px-5 py-10">
        {isLoading ? (
          <p className="text-center p-10 text-muted-foreground">Loading matches...</p>
        ) : (
          <div className="grid gap-8">
            {/* Request Summary */}
            <div className="rounded-lg border border-border bg-card p-6 shadow-panel">
              <h2 className="text-lg font-bold mb-4">Request summary</h2>
              <div className="flex items-center gap-4">
                <GroupChip group={request?.bloodGroupNeeded || "O+"} size="lg" />
                <div>
                  <p className="font-semibold text-lg">{request?.unitsRequired} units required</p>
                  <p className="text-sm text-muted-foreground">Status: {request?.status}</p>
                </div>
              </div>
            </div>

            {/* Accepted Donors */}
            <div>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Check className="size-5 text-success" /> 
                Accepted ({acceptedMatches.length})
              </h2>
              {acceptedMatches.length === 0 ? (
                <p className="text-sm text-muted-foreground">No donors have accepted yet.</p>
              ) : (
                <ul className="grid gap-4">
                  {acceptedMatches.map((match: any) => {
                    const donor = match.donorId;
                    const uVal = unitsDonated[donor._id] || "1";
                    
                    return (
                      <li key={match._id} className="flex flex-col gap-5 sm:flex-row sm:items-center sm:flex-wrap rounded-lg border border-success/30 bg-success/5 p-5 shadow-panel">
                        <div className="flex gap-5 sm:contents items-center">
                          <GroupChip group={donor.bloodGroup} />
                          <div className="flex-1 min-w-0 sm:min-w-[200px]">
                            <p className="font-bold">{donor.name}</p>
                            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                              <Phone className="size-3.5" /> {donor.phone}
                            </p>
                            <p className="mt-0.5 text-xs text-muted-foreground">Email: {donor.email}</p>
                          </div>
                        </div>
                        
                        {/* Record Donation */}
                        <div className="flex w-full sm:w-auto items-center gap-2">
                          <Input 
                            type="number" 
                            min="1" 
                            max="3" 
                            value={uVal}
                            onChange={(e) => setUnitsDonated(p => ({ ...p, [donor._id]: e.target.value }))}
                            className="w-20"
                            placeholder="Units"
                          />
                          <Button 
                            size="sm" 
                            className="bg-success hover:bg-success/90 text-success-foreground"
                            onClick={() => recordDonationMutation.mutate({ 
                              donorId: donor._id, 
                              units: parseInt(uVal, 10) || 1 
                            })}
                            disabled={recordDonationMutation.isPending}
                          >
                            Record donation
                          </Button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Pending Donors */}
            <div>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-muted-foreground">
                <Clock className="size-5" /> 
                Pending response ({pendingMatches.length})
              </h2>
              {pendingMatches.length > 0 && (
                <ul className="grid gap-3 sm:grid-cols-2">
                  {pendingMatches.map((match: any) => (
                    <li key={match._id} className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 shadow-panel">
                      <GroupChip group={match.donorId.bloodGroup} size="sm" />
                      <div>
                        <p className="font-semibold text-sm">Masked Donor</p>
                        <p className="text-xs text-muted-foreground">Waiting for response...</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            {/* Declined Donors */}
            {declinedMatches.length > 0 && (
              <div>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-muted-foreground">
                  <X className="size-5 text-critical" /> 
                  Declined ({declinedMatches.length})
                </h2>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {declinedMatches.map((match: any) => (
                    <li key={match._id} className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 shadow-panel opacity-60">
                      <GroupChip group={match.donorId.bloodGroup} size="sm" />
                      <div>
                        <p className="font-semibold text-sm">Masked Donor</p>
                        <p className="text-xs text-muted-foreground">Not available</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
          </div>
        )}
      </div>
    </>
  );
}
