import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Droplet } from "lucide-react";
import ReactDOMServer from "react-dom/server";

export interface MapMarker {
  lat: number;
  lng: number;
  label: string;
  popup?: string;
  id: string;
}

interface MapViewProps {
  center: [number, number];
  zoom: number;
  markers: MapMarker[];
  className?: string;
}

// Custom icon using lucide-react Droplet with RedPint styling
const customIcon = new L.DivIcon({
  html: ReactDOMServer.renderToString(
    <div style={{ color: "hsl(var(--primary))", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))" }}>
      <Droplet size={32} fill="currentColor" />
    </div>
  ),
  className: "custom-leaflet-icon bg-transparent border-none",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

export function MapView({ center, zoom, markers, className = "h-96 w-full rounded-lg overflow-hidden border border-border" }: MapViewProps) {
  return (
    <div className={className}>
      <MapContainer center={center} zoom={zoom} style={{ height: "100%", width: "100%", zIndex: 10 }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.map((m) => (
          <Marker key={m.id} position={[m.lat, m.lng]} icon={customIcon}>
            <Popup>
              <strong>{m.label}</strong>
              {m.popup && (
                <>
                  <br />
                  <span className="text-muted-foreground">{m.popup}</span>
                </>
              )}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
