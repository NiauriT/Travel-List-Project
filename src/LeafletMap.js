import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

// Recenter map when position changes
function SetView({ coords }) {
  const map = useMap();
  map.setView(coords, 14);
  return null;
}

export default function LeafletMap() {
  const defaultPosition = [41.7151, 44.8271]; // Tbilisi
  const [position, setPosition] = useState(defaultPosition);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setPosition([pos.coords.latitude, pos.coords.longitude]),
        () => console.log("Geolocation not available or denied")
      );
    }
  }, []);

  return (
    <MapContainer
      center={position}
      zoom={14}
      className="map-container"
      scrollWheelZoom={true}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      <Marker position={position} />
      <SetView coords={position} />
    </MapContainer>
  );
}
