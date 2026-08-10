import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, Clock, MapPin, Users } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { PageHeader } from "@/components/redpint-ui";
import { MapView, MapMarker } from "@/components/MapView";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import api from "@/lib/api";

export const Route = createFileRoute("/drives")({
  head: () => ({
    meta: [
      { title: "Blood Donation Drives — RedPint Network Events" },
    ],
  }),
  component: Drives,
});

function Drives() {
  const { data: drives = [], isLoading } = useQuery({
    queryKey: ["drives"],
    queryFn: async () => {
      const res = await api.get("/drives");
      return res.data.drives || [];
    },
  });

  const queryClient = useQueryClient();
  const { user, profile, role } = useAuth();

  const registerMutation = useMutation({
    mutationFn: async (driveId: string) => {
      const res = await api.post(`/drives/${driveId}/register`);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Registered successfully!");
      queryClient.invalidateQueries({ queryKey: ["drives"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to register for drive");
    }
  });

  return (
    <>
      <PageHeader
        eyebrow="Events"
        title="Donation drives"
        description="Drives are scheduled against network shortages, so the groups flagged low on the stock board get priority screening slots."
      />

      <div className="mx-auto max-w-7xl px-5 py-10">
        {!isLoading && drives.length > 0 && (
          <div className="mb-8 overflow-hidden rounded-lg border border-border bg-card shadow-panel h-96">
            <MapView
              center={[profile?.latitude || 19.076, profile?.longitude || 72.8777]}
              zoom={11}
              className="h-full w-full"
              markers={drives.map((d: any) => ({
                id: d._id,
                lat: d.hospitalId?.latitude || 19.076,
                lng: d.hospitalId?.longitude || 72.8777,
                label: d.name || d.description || "Community Blood Drive",
                popup: d.hospitalId?.name || "RedPint Partner",
              }))}
            />
          </div>
        )}

        <ul className="grid gap-6 lg:grid-cols-3">
          {isLoading && <p className="col-span-3 text-center p-10 text-muted-foreground">Loading drives...</p>}
          {drives.map((d: any) => {
            const dateObj = new Date(d.date);
            const month = dateObj.toLocaleString('en-US', { month: 'short' });
            const day = dateObj.getDate();
            const time = dateObj.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
            
            const capacity = 100;
            const registeredDonors = d.registeredDonors || [];
            const registered = registeredDonors.length;
            const pct = Math.round((registered / capacity) * 100);
            const isRegistered = profile?._id && registeredDonors.some((donor: any) => donor._id === profile._id || donor === profile._id);
            
            return (
              <li
                key={d._id}
                className="flex flex-col rounded-lg border border-border bg-card p-6 shadow-panel"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="rounded-sm gradient-pint px-3 py-2 text-center text-primary-foreground">
                    <p className="font-display text-lg font-extrabold leading-none">
                      {day}
                    </p>
                    <p className="mt-1 text-[10px] font-semibold uppercase tracking-widest">
                      {month}
                    </p>
                  </div>
                  <span className="font-mono text-xs text-muted-foreground">DRV-{d._id.substring(d._id.length - 4).toUpperCase()}</span>
                </div>

                <h2 className="mt-5 text-xl font-bold">{d.name || d.description || "Community Blood Drive"}</h2>
                <p className="mt-1 text-sm text-muted-foreground">Hosted by {d.hospitalId?.name || "RedPint Partner"}</p>

                <ul className="mt-4 grid gap-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <MapPin className="size-4 shrink-0" /> {d.location || d.hospitalId?.address || "Mumbai"}
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock className="size-4 shrink-0" /> {time}
                  </li>
                  <li className="flex items-center gap-2">
                    <CalendarDays className="size-4 shrink-0" /> Open to all groups
                  </li>
                </ul>

                <div className="mt-6">
                  <div className="flex items-center justify-between text-xs">
                    <span className="label-eyebrow inline-flex items-center gap-1">
                      <Users className="size-3" /> Registered
                    </span>
                    <span className="font-mono tabular-nums">
                      {registered}/{capacity}
                    </span>
                  </div>
                  <Progress value={pct} className="mt-2 h-1.5" />
                </div>

                <Button
                  className="mt-6 w-full"
                  disabled={isRegistered || role !== "donor" || registerMutation.isPending}
                  onClick={() => {
                    if (role === "donor") {
                      registerMutation.mutate(d._id);
                    }
                  }}
                >
                  {isRegistered ? "Already registered" : role === "hospital" ? "Hospital accounts cannot register" : role !== "donor" ? "Log in as donor to register" : "Reserve a slot"}
                </Button>
              </li>
            );
          })}
        </ul>
        
        {!isLoading && drives.length === 0 && (
          <p className="mt-8 rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            No upcoming drives scheduled in your area.
          </p>
        )}
      </div>
    </>
  );
}

