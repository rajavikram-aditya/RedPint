import { createFileRoute } from "@tanstack/react-router";
import { Users, Building2, Activity, Calendar, CheckCircle, XCircle, FileText, Clock } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { RequireAuth } from "@/components/require-auth";
import { useAuth } from "@/lib/auth-context";
import { PageHeader } from "@/components/redpint-ui";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({
    meta: [{ title: "Admin Dashboard — RedPint" }],
  }),
  component: () => (
    <RequireAuth allowedRoles={["admin"]}>
      <AdminDashboard />
    </RequireAuth>
  ),
});

function AdminDashboard() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  // Platform stats
  const { data: statsData } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      try {
        const res = await api.get("/admin/stats");
        return res.data.stats;
      } catch {
        return null;
      }
    },
  });

  // Pending hospitals
  const { data: pendingHospitals = [], isLoading: pendingLoading } = useQuery({
    queryKey: ["pending-hospitals"],
    queryFn: async () => {
      try {
        const res = await api.get("/admin/hospitals/pending");
        return res.data.hospitals || [];
      } catch {
        return [];
      }
    },
  });

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: (hospitalId: string) =>
      api.patch(`/admin/hospitals/${hospitalId}/verify`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-hospitals"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      toast.success("Hospital approved successfully.");
    },
    onError: () => {
      toast.error("Failed to approve hospital. Please try again.");
    },
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: (hospitalId: string) =>
      api.patch(`/admin/hospitals/${hospitalId}/reject`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-hospitals"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      toast.success("Hospital registration rejected.");
    },
    onError: () => {
      toast.error("Failed to reject hospital. Please try again.");
    },
  });

  const stats = statsData ?? {
    totalDonors: 0,
    totalHospitalsVerified: 0,
    totalHospitalsPending: 0,
    totalActiveRequests: 0,
    totalDrives: 0,
    totalDonations: 0,
  };

  return (
    <>
      <PageHeader
        eyebrow="Admin dashboard"
        title={`Welcome, ${profile?.name || "Admin"}`}
        description="Manage hospital approvals and monitor platform activity."
      />

      <div className="mx-auto max-w-7xl px-5 py-10">
        {/* Stats row */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 stagger-in">
          <div className="rounded-lg border border-border bg-card p-6 shadow-panel">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-sm bg-primary/10 text-primary">
                <Users className="size-5" />
              </span>
              <div>
                <p className="label-eyebrow">Total donors</p>
                <p className="font-display text-3xl font-extrabold tabular-nums">{stats.totalDonors}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6 shadow-panel">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-sm bg-primary/10 text-primary">
                <Building2 className="size-5" />
              </span>
              <div>
                <p className="label-eyebrow">Hospitals</p>
                <p className="font-display text-3xl font-extrabold tabular-nums">{stats.totalHospitalsVerified}</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              {stats.totalHospitalsPending} pending approval
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-6 shadow-panel">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-sm bg-primary/10 text-primary">
                <Activity className="size-5" />
              </span>
              <div>
                <p className="label-eyebrow">Active requests</p>
                <p className="font-display text-3xl font-extrabold tabular-nums">{stats.totalActiveRequests}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6 shadow-panel">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-sm bg-primary/10 text-primary">
                <Calendar className="size-5" />
              </span>
              <div>
                <p className="label-eyebrow">Blood drives</p>
                <p className="font-display text-3xl font-extrabold tabular-nums">{stats.totalDrives}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pending hospitals table */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">
              Pending hospital approvals
              {pendingHospitals.length > 0 && (
                <span className="ml-2 inline-flex items-center rounded-full bg-warning/10 px-2.5 py-0.5 text-sm font-semibold text-warning">
                  {pendingHospitals.length}
                </span>
              )}
            </h2>
          </div>

          {pendingLoading ? (
            <div className="flex items-center justify-center rounded-lg border border-border p-12">
              <div className="size-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : pendingHospitals.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
              No hospitals pending approval. All registrations are up to date.
            </p>
          ) : (
            <ul className="grid gap-4">
              {pendingHospitals.map((hospital: any) => (
                <li
                  key={hospital._id}
                  className="rounded-lg border border-border bg-card p-5 shadow-panel"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-base">{hospital.name}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{hospital.address}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{hospital.contactNumber}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        {hospital.licenseDocUrl ? (
                          <a
                            href={hospital.licenseDocUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-md border border-primary/25 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
                          >
                            <FileText className="size-3.5" />
                            View license doc
                          </a>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                            <FileText className="size-3.5" />
                            No license doc uploaded
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="size-3.5" />
                          Registered {formatDistanceToNow(new Date(hospital.createdAt))} ago
                        </span>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-critical/40 text-critical hover:bg-critical/5 hover:border-critical/60"
                        disabled={rejectMutation.isPending || approveMutation.isPending}
                        onClick={() => rejectMutation.mutate(hospital._id)}
                      >
                        <XCircle className="size-4 mr-1.5" />
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                        disabled={approveMutation.isPending || rejectMutation.isPending}
                        onClick={() => approveMutation.mutate(hospital._id)}
                      >
                        <CheckCircle className="size-4 mr-1.5" />
                        Approve
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
