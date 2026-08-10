import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Phone } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { RequireAuth } from "@/components/require-auth";
import { useAuth } from "@/lib/auth-context";
import { PageHeader } from "@/components/redpint-ui";
import { MapView, MapMarker } from "@/components/MapView";
import api from "@/lib/api";

export const Route = createFileRoute("/donor/hospitals")({
  head: () => ({
    meta: [{ title: "Nearby Hospitals — RedPint" }],
  }),
  component: () => (
    <RequireAuth allowedRoles={["donor"]}>
      <DonorHospitals />
    </RequireAuth>
  ),
});

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function DonorHospitals() {
  const { profile } = useAuth();

  const { data: hospitals = [], isLoading } = useQuery({
    queryKey: ["hospitals"],
    queryFn: async () => {
      const res = await api.get("/hospitals");
      return res.data.hospitals || [];
    },
  });

  const donorLat = profile?.latitude || 19.076;
  const donorLng = profile?.longitude || 72.8777;

  const withDistance = hospitals
    .map((h: any) => ({
      ...h,
      distanceKm: Number(getDistance(donorLat, donorLng, h.latitude, h.longitude).toFixed(1)),
    }))
    .sort((a: any, b: any) => a.distanceKm - b.distanceKm);

  return (
    <>
      <PageHeader
        eyebrow="Donor view"
        title="Nearby hospitals"
        description="Hospitals in the RedPint network sorted by distance from your registered location."
      />

      <div className="mx-auto max-w-4xl px-5 py-10">
        {isLoading && (
          <p className="text-center p-10 text-muted-foreground">Loading hospitals...</p>
        )}

        {!isLoading && withDistance.length > 0 && (
          <div className="mb-8 overflow-hidden rounded-lg border border-border bg-card shadow-panel">
            <MapView
              center={[donorLat, donorLng]}
              zoom={11}
              markers={withDistance.map((h: any) => ({
                id: h._id,
                lat: h.latitude,
                lng: h.longitude,
                label: h.name,
                popup: `${h.distanceKm} km away`,
              }))}
            />
          </div>
        )}

        <ul className="grid gap-4">
          {withDistance.map((h: any) => (
            <li
              key={h._id}
              className="flex items-start gap-5 rounded-lg border border-border bg-card p-6 shadow-panel"
            >
              <span className="grid size-12 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary font-mono text-sm font-bold">
                {h.distanceKm} km
              </span>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold">{h.name}</h2>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="size-3.5 shrink-0" /> {h.address}
                </p>
                {h.contactNumber && (
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Phone className="size-3.5 shrink-0" /> {h.contactNumber}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>

        {!isLoading && withDistance.length === 0 && (
          <p className="mt-8 rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            No hospitals found in the network yet.
          </p>
        )}
      </div>
    </>
  );
}
