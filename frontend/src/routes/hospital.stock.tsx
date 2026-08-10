import { createFileRoute } from "@tanstack/react-router";
import { Building2, RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RequireAuth } from "@/components/require-auth";
import { useAuth } from "@/lib/auth-context";
import { PageHeader } from "@/components/redpint-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import { BLOOD_GROUPS } from "@/lib/redpint-data";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/hospital/stock")({
  head: () => ({
    meta: [{ title: "Blood Stock Management — RedPint" }],
  }),
  component: () => (
    <RequireAuth allowedRoles={["hospital"]}>
      <HospitalStock />
    </RequireAuth>
  ),
});

const LOW = 3;

function HospitalStock() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [editValues, setEditValues] = useState<Record<string, string>>({});

  // My stock
  const { data: myStock = [] } = useQuery({
    queryKey: ["my-stock"],
    queryFn: async () => {
      const res = await api.get(`/hospital-stock?hospitalId=${profile?._id}`);
      return res.data.stock || [];
    },
    enabled: !!profile?._id,
  });

  // All stock (network view)
  const { data: allStock = [], isLoading, isFetching } = useQuery({
    queryKey: ["hospital-stock"],
    queryFn: async () => {
      const res = await api.get("/hospital-stock");
      return res.data.stock || [];
    },
  });

  // Bulk update mutation
  const bulkMutation = useMutation({
    mutationFn: async (stocks: { bloodGroup: string; unitsAvailable: number }[]) => {
      const res = await api.post("/hospital-stock/bulk", { stocks });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-stock"] });
      queryClient.invalidateQueries({ queryKey: ["hospital-stock"] });
      toast.success("Stock updated successfully");
      setEditValues({});
    },
    onError: () => {
      toast.error("Failed to update stock");
    },
  });

  const handleSave = () => {
    const stocks = BLOOD_GROUPS.map((g) => ({
      bloodGroup: g,
      unitsAvailable: parseInt(editValues[g] || "0", 10) || 0,
    })).filter((s) => s.unitsAvailable >= 0);
    bulkMutation.mutate(stocks);
  };

  // Initialize edit values from current stock
  const initEdit = () => {
    const vals: Record<string, string> = {};
    BLOOD_GROUPS.forEach((g) => {
      const entry = myStock.find((s: any) => s.bloodGroup === g);
      vals[g] = String(entry?.unitsAvailable || 0);
    });
    setEditValues(vals);
  };

  // Network stock aggregation
  const hospitalMap = new Map();
  allStock.forEach((item: any) => {
    const hId = item.hospitalId?._id;
    if (!hId || hId === profile?._id) return; // Exclude own hospital
    if (!hospitalMap.has(hId)) {
      hospitalMap.set(hId, {
        hospital: item.hospitalId.name,
        area: item.hospitalId.address || "Mumbai",
        units: Object.fromEntries(BLOOD_GROUPS.map((g) => [g, 0])),
        latestUpdate: new Date(0),
      });
    }
    const h = hospitalMap.get(hId);
    h.units[item.bloodGroup] = item.unitsAvailable;
    const itemDate = new Date(item.updatedAt);
    if (itemDate > h.latestUpdate) h.latestUpdate = itemDate;
  });
  const networkStock = Array.from(hospitalMap.values());

  const isEditing = Object.keys(editValues).length > 0;

  return (
    <>
      <PageHeader
        eyebrow="Hospital"
        title="Blood stock management"
        description="Update your own inventory and view other hospitals' stock across the network."
      >
        <Button
          variant="outline"
          size="lg"
          onClick={() => {
            queryClient.invalidateQueries({ queryKey: ["hospital-stock"] });
            toast("Refreshing network stock...");
          }}
          disabled={isFetching}
        >
          <RefreshCw className={`size-4 ${isFetching ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </PageHeader>

      <div className="mx-auto max-w-7xl px-5 py-10">
        {/* My stock — editable */}
        <div className="rounded-lg border border-border bg-card p-6 shadow-panel">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">My stock</h2>
            {!isEditing ? (
              <Button size="sm" onClick={initEdit}>Edit stock</Button>
            ) : (
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSave} disabled={bulkMutation.isPending}>
                  {bulkMutation.isPending ? "Saving..." : "Save"}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setEditValues({})}>
                  Cancel
                </Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
            {BLOOD_GROUPS.map((g) => {
              const entry = myStock.find((s: any) => s.bloodGroup === g);
              const value = isEditing ? editValues[g] || "0" : String(entry?.unitsAvailable || 0);
              const numValue = parseInt(value, 10) || 0;
              return (
                <div
                  key={g}
                  className={`rounded-lg border p-4 text-center ${numValue <= LOW ? "border-critical/30 bg-critical/5" : "border-border"}`}
                >
                  <p className="font-mono text-sm font-bold text-primary">{g}</p>
                  {isEditing ? (
                    <Input
                      type="number"
                      min={0}
                      value={value}
                      onChange={(e) => setEditValues((prev) => ({ ...prev, [g]: e.target.value }))}
                      className="mt-2 text-center font-display text-lg font-extrabold h-10"
                    />
                  ) : (
                    <p className="mt-1 font-display text-2xl font-extrabold tabular-nums">{numValue}</p>
                  )}
                  <p className="label-eyebrow mt-1">units</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Other hospitals' stock — read only */}
        <div className="mt-10">
          <h2 className="text-xl font-bold mb-4">Other hospitals' stock</h2>
          <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-panel">
            <table className="w-full min-w-3xl border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-surface">
                  <th className="label-eyebrow p-4 text-left">Facility</th>
                  {BLOOD_GROUPS.map((g) => (
                    <th key={g} className="p-4 text-center font-mono text-xs font-bold text-primary">{g}</th>
                  ))}
                  <th className="label-eyebrow p-4 text-right">Updated</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr><td colSpan={10} className="p-10 text-center text-muted-foreground">Loading...</td></tr>
                )}
                {networkStock.map((row) => (
                  <tr key={row.hospital} className="border-b border-border last:border-0">
                    <td className="p-4">
                      <p className="inline-flex items-center gap-2 font-semibold">
                        <Building2 className="size-4 text-muted-foreground" />
                        {row.hospital}
                      </p>
                      <p className="mt-0.5 pl-6 text-xs text-muted-foreground">{row.area}</p>
                    </td>
                    {BLOOD_GROUPS.map((g) => {
                      const value = row.units[g];
                      return (
                        <td
                          key={g}
                          className={value <= LOW ? "p-4 text-center font-mono font-bold tabular-nums text-critical" : "p-4 text-center font-mono tabular-nums text-foreground"}
                        >
                          <span className={value <= LOW ? "inline-grid size-8 place-items-center rounded-sm bg-critical/12" : "inline-grid size-8 place-items-center"}>
                            {value}
                          </span>
                        </td>
                      );
                    })}
                    <td className="p-4 text-right text-xs text-muted-foreground">
                      {row.latestUpdate.getTime() > 0 ? formatDistanceToNow(row.latestUpdate) + " ago" : "Unknown"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!isLoading && networkStock.length === 0 && (
              <p className="p-10 text-center text-muted-foreground">No other hospitals in the network yet.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
