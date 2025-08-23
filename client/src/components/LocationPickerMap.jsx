import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icon issue with webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const LocationPickerMap = ({ onLocationSelect, initialPosition }) => {
  // Use the initial position if provided, otherwise null
  const [markerPosition, setMarkerPosition] = useState(initialPosition);

  // A component to handle map click events
  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setMarkerPosition({ lat, lng });
        onLocationSelect({ lat, lng });
      },
    });
    return null;
  };

  // The center of the map, defaults to India if no position is set
  const mapCenter = markerPosition || [20.5937, 78.9629];
  const zoomLevel = markerPosition ? 15 : 5;

  return (
    <MapContainer
      center={mapCenter}
      zoom={zoomLevel}
      scrollWheelZoom={true}
      style={{ height: "450px", width: "100%", borderRadius: "12px" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {/* If a position is selected, show a marker there */}
      {markerPosition && <Marker position={markerPosition}></Marker>}
      <MapClickHandler />
    </MapContainer>
  );
};

export default LocationPickerMap;
