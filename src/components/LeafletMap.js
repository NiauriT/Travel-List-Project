import React, { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-routing-machine";
import "leaflet-control-geocoder/dist/Control.Geocoder.css";
import "leaflet-control-geocoder";
import "./LeafletMap.css";

// Component to recenter map on userPos
function RecenterMap({ userPos }) {
  const map = useMap();
  useEffect(() => {
    if (userPos) map.setView(userPos, 13);
  }, [userPos, map]);
  return null;
}

const LeafletMap = () => {
  const [userPos, setUserPos] = useState([41.7151, 44.8271]); // fallback
  const [search, setSearch] = useState("");
  const [destPos, setDestPos] = useState(null);
  const routingControlRef = useRef(null);
  const mapRef = useRef(null);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserPos([pos.coords.latitude, pos.coords.longitude]),
        (err) => console.error("Geolocation error:", err)
      );
    }
  }, []);

  // Custom marker icon
  const customIcon = new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  // Initialize routing once map is ready
  const MapInit = () => {
    const map = useMap();
    mapRef.current = map;

    useEffect(() => {
      if (!map) return;

      // Remove any existing routing container in DOM
      const container = document.querySelector(".leaflet-routing-container");
      if (container) container.remove();

      // Routing control
      routingControlRef.current = L.Routing.control({
        waypoints: destPos
          ? [L.latLng(userPos), L.latLng(destPos)]
          : [L.latLng(userPos)],
        show: false,
        addWaypoints: false,
        routeWhileDragging: true,
        createMarker: (i, wp, nWps) => {
          if (i === 0) return L.marker(wp.latLng).bindPopup("Start");
          if (i === nWps - 1) return L.marker(wp.latLng).bindPopup("Destination");
          return null;
        },
      }).addTo(map);
    }, [map, userPos, destPos]);

    return null;
  };

  // Search destination
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!search || !mapRef.current) return;

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${search}`
    );
    const data = await res.json();
    if (data.length > 0) {
      const place = data[0];
      const dest = [parseFloat(place.lat), parseFloat(place.lon)];
      setDestPos(dest);

      // Update route
      if (routingControlRef.current) {
        routingControlRef.current.setWaypoints([L.latLng(userPos), L.latLng(dest)]);
        mapRef.current.setView(dest, 14);
      }
    }
  };

  return (
    <div>
      {/* Search Bar */}
      <form onSubmit={handleSearch} style={{ margin: "10px 0" }}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search a place..."
         className="search-input"
        />
        <button type="submit" className="search-button" >
          Search
        </button>
      </form>

  <div className="map-wrapper"></div>
      <MapContainer
        center={userPos}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: "500px", width: "100%" }}
      >
        <div/>

        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {/* Markers */}
        <Marker position={userPos} icon={customIcon}>
          <Popup>You are here 🚀</Popup>
        </Marker>
        {destPos && (
          <Marker position={destPos} icon={customIcon}>
            <Popup>Destination 📍</Popup>
          </Marker>
        )}

        <RecenterMap userPos={userPos} />
        <MapInit />
      </MapContainer>
      <div/>
    </div>
  );
};

export default LeafletMap;
