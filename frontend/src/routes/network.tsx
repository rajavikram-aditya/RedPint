import { createFileRoute } from "@tanstack/react-router";
import { Building2, RefreshCw } from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/redpint-ui";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { BLOOD_GROUPS } from "@/lib/redpint-data";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/network")({
  head: () => ({
    meta: [
      { title: "Inter-Hospital Blood Stock — RedPint Network" },
    ],
  }),
  component: NetworkStock,
});

const LOW = 3;

function NetworkStock() {
  const [highlight, setHighlight] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: rawStock = [], isLoading, isFetching } = useQuery({
    queryKey: ["hospital-stock"],
    queryFn: async () => {
      const res = await api.get("/hospital-stock");
      return res.data.stock || [];
    },
  });

  const { networkStock, totals } = useMemo(() => {
    const hospitalMap = new Map();
    
    // Initialize totals
    const t: Record<string, number> = {};
    BLOOD_GROUPS.forEach(g => t[g] = 0);

    rawStock.forEach((item: any) => {
      const hId = item.hospitalId?._id;
      if (!hId) return;
      
      if (!hospitalMap.has(hId)) {
        hospitalMap.set(hId, {
          hospital: item.hospitalId.name,
          area: item.hospitalId.address || "Mumbai",
          units: Object.fromEntries(BLOOD_GROUPS.map(g => [g, 0])),
          latestUpdate: new Date(0),
        });
      }
      
      const h = hospitalMap.get(hId);
      h.units[item.bloodGroup] = item.unitsAvailable;
      t[item.bloodGroup] += item.unitsAvailable;
      
      const itemDate = new Date(item.updatedAt);
      if (itemDate > h.latestUpdate) {
        h.latestUpdate = itemDate;
      }
    });

    const arr = Array.from(hospitalMap.values()).map(h => ({
      ...h,
      updatedAgo: h.latestUpdate.getTime() > 0 ? formatDistanceToNow(h.latestUpdate) + " ago" : "Unknown",
    }));

    return {
      networkStock: arr,
      totals: BLOOD_GROUPS.map(g => ({ group: g, total: t[g] }))
    };
  }, [rawStock]);

  return (
    <>
      <PageHeader
        eyebrow="Network"
        title="Inter-hospital stock visibility"
        description="Inventory is self-reported by each facility's blood bank desk. Cells shaded red are at or below the shortage threshold of 3 units."
      >
        <Button
          variant="outline"
          size="lg"
          onClick={() => {
            queryClient.invalidateQueries({ queryKey: ["hospital-stock"] });
            toast("Inventory refreshing", { description: "Fetching latest reports from the network." });
          }}
          disabled={isFetching}
        >
          <RefreshCw className={`size-4 ${isFetching ? "animate-spin" : ""}`} /> Refresh reports
        </Button>
      </PageHeader>

      <div className="mx-auto max-w-7xl px-5 py-10">
        <ul className="grid grid-cols-4 gap-3 sm:grid-cols-8">
          {totals.map((t) => (
            <li
              key={t.group}
              onMouseEnter={() => setHighlight(t.group)}
              onMouseLeave={() => setHighlight(null)}
              className={
                highlight === t.group
                  ? "rounded-lg border border-primary bg-primary/8 p-4 text-center"
                  : "rounded-lg border border-border bg-card p-4 text-center shadow-panel"
              }
            >
              <p className="font-mono text-sm font-bold text-primary">{t.group}</p>
              <p className="mt-1 font-display text-2xl font-extrabold tabular-nums">{t.total}</p>
              <p className="label-eyebrow">units</p>
            </li>
          ))}
        </ul>

        <div className="mt-8 overflow-x-auto rounded-lg border border-border bg-card shadow-panel">
          <table className="w-full min-w-3xl border-collapse text-sm">
            <caption className="sr-only">
              Self-reported blood units by hospital and blood group
            </caption>
            <thead>
              <tr className="border-b border-border bg-surface">
                <th className="label-eyebrow p-4 text-left">Facility</th>
                {BLOOD_GROUPS.map((g) => (
                  <th key={g} className="p-4 text-center font-mono text-xs font-bold text-primary">
                    {g}
                  </th>
                ))}
                <th className="label-eyebrow p-4 text-right">Updated</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={10} className="p-10 text-center text-muted-foreground">Loading network stock...</td>
                </tr>
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
                        className={
                          value <= LOW
                            ? "p-4 text-center font-mono font-bold tabular-nums text-critical"
                            : "p-4 text-center font-mono tabular-nums text-foreground"
                        }
                      >
                        <span
                          className={
                            value <= LOW
                              ? "inline-grid size-8 place-items-center rounded-sm bg-critical/12"
                              : highlight === g
                                ? "inline-grid size-8 place-items-center rounded-sm bg-primary/10"
                                : "inline-grid size-8 place-items-center"
                          }
                        >
                          {value}
                        </span>
                      </td>
                    );
                  })}
                  <td className="p-4 text-right text-xs text-muted-foreground">{row.updatedAgo}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!isLoading && networkStock.length === 0 && (
            <p className="p-10 text-center text-muted-foreground">No stock data available in the network.</p>
          )}
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-6 shadow-panel">
            <p className="label-eyebrow">Shortage threshold</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Any group at or below 3 units triggers a network flag and prioritises that group in
              upcoming drives.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6 shadow-panel">
            <p className="label-eyebrow">Self-reported inventory</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Blood bank staff update counts from their own ledger; RedPint stamps each report so
              stale numbers are obvious.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6 shadow-panel">
            <p className="label-eyebrow">Transfer requests</p>
            <p className="mt-2 text-sm text-muted-foreground">
              A facility short on a rare group can request a transfer before escalating to donor
              notifications.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

