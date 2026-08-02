import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, Clock, MapPin, Plus, Users, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RequireAuth } from "@/components/require-auth";
import { useAuth } from "@/lib/auth-context";
import { PageHeader } from "@/components/redpint-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import api from "@/lib/api";

export const Route = createFileRoute("/hospital/drives")({
  head: () => ({
    meta: [{ title: "Manage Drives — RedPint" }],
  }),
  component: () => (
    <RequireAuth allowedRoles={["hospital"]}>
      <HospitalDrives />
    </RequireAuth>
  ),
});

function HospitalDrives() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    date: "",
    time: "",
    description: "",
  });

  const { data: allDrives = [], isLoading } = useQuery({
    queryKey: ["drives"],
    queryFn: async () => {
      const res = await api.get("/drives");
      return res.data.drives || [];
    },
  });

  const myDrives = allDrives.filter(
    (d: any) => d.hospitalId?._id === profile?._id || d.hospitalId === profile?._id
  );

  const createMutation = useMutation({
    mutationFn: async () => {
      const dateTime = new Date(`${formData.date}T${formData.time || "09:00"}`);
      const res = await api.post("/drives", {
        name: formData.name,
        location: formData.location || profile?.address,
        latitude: profile?.latitude || 19.076,
        longitude: profile?.longitude || 72.8777,
        date: dateTime.toISOString(),
        description: formData.description,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drives"] });
      toast.success("Drive created successfully");
      setShowForm(false);
      setFormData({ name: "", location: "", date: "", time: "", description: "" });
    },
    onError: () => {
      toast.error("Failed to create drive");
    },
  });

  return (
    <>
      <PageHeader
        eyebrow="Hospital"
        title="Donation drives"
        description="Schedule and manage blood donation drives for your hospital."
      >
        <Button size="lg" onClick={() => setShowForm(!showForm)}>
          <Plus className="size-4 mr-1.5" />
          {showForm ? "Cancel" : "Create drive"}
        </Button>
      </PageHeader>

      <div className="mx-auto max-w-4xl px-5 py-10">
        {/* Create form */}
        {showForm && (
          <form
            className="mb-8 rounded-lg border border-border bg-card p-6 shadow-panel"
            onSubmit={(e) => {
              e.preventDefault();
              createMutation.mutate();
            }}
          >
            <h2 className="text-lg font-bold mb-4">Schedule a new drive</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="name">Drive Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Summer Blood Drive 2026"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData((p) => ({ ...p, date: e.target.value }))}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData((p) => ({ ...p, time: e.target.value }))}
                  className="mt-2"
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData((p) => ({ ...p, location: e.target.value }))}
                  placeholder={profile?.address || "Hospital address"}
                  className="mt-2"
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Community blood drive — all groups welcome"
                  className="mt-2"
                  rows={3}
                />
              </div>
            </div>
            <Button type="submit" className="mt-6" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create drive"}
            </Button>
          </form>
        )}

        {/* My drives */}
        {isLoading ? (
          <p className="text-center p-10 text-muted-foreground">Loading drives...</p>
        ) : myDrives.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            No drives scheduled yet. Click "Create drive" to schedule one.
          </p>
        ) : (
          <ul className="grid gap-5">
            {myDrives.map((d: any) => {
              const dateObj = new Date(d.date);
              return (
                <li key={d._id} className="rounded-lg border border-border bg-card p-6 shadow-panel">
                  <div className="flex items-start gap-4">
                    <div className="rounded-sm gradient-pint px-3 py-2 text-center text-primary-foreground shrink-0">
                      <p className="font-display text-lg font-extrabold leading-none">{dateObj.getDate()}</p>
                      <p className="mt-1 text-[10px] font-semibold uppercase tracking-widest">
                        {dateObj.toLocaleString("en-US", { month: "short" })}
                      </p>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold">{d.name || d.description || "Community Drive"}</h3>
                      <ul className="mt-2 grid gap-1 text-sm text-muted-foreground">
                        <li className="flex items-center gap-2">
                          <MapPin className="size-4 shrink-0" /> {d.location || profile?.address}
                        </li>
                        <li className="flex items-center gap-2">
                          <Clock className="size-4 shrink-0" />
                          {dateObj.toLocaleString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}
                        </li>
                        <li className="flex items-center gap-2">
                          <CalendarDays className="size-4 shrink-0" /> Open to all groups
                        </li>
                      </ul>
                      
                      <div className="mt-4 border-t border-border pt-4">
                        <p className="flex items-center gap-2 text-sm font-semibold">
                          <Users className="size-4" /> Registered Donors ({d.registeredDonors?.length || 0})
                        </p>
                        {d.registeredDonors && d.registeredDonors.length > 0 ? (
                          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                            {d.registeredDonors.map((donor: any) => (
                              <li key={donor._id} className="flex items-center gap-2 rounded bg-surface p-2 text-sm">
                                <User className="size-3.5 text-muted-foreground" />
                                <span className="font-medium">{donor.name}</span>
                                <span className="text-xs text-muted-foreground">({donor.bloodGroup})</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="mt-2 text-sm text-muted-foreground">No donors have registered yet.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
