// src/pages/MapTest.jsx
import React from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";

export default function MapTest() {
  // Load Google Maps script
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  if (loadError) {
    console.error("MapTest: Google Maps failed to load", loadError);
    return <div>Error loading map</div>;
  }

  if (!isLoaded) {
    console.log("MapTest: Google Maps NOT loaded yet");
    return <div>Loading test map...</div>;
  }

  console.log("MapTest: Google Maps LOADED");

  const center = { lat: 31.5204, lng: 74.3587 }; // Lahore for example

  return (
    <div style={{ height: "100vh", padding: 20 }}>
      <h2>Google Maps Test</h2>
      <div style={{ height: "600px", border: "3px solid red" }}>
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "100%" }}
          center={center}
          zoom={10}
          options={{
            disableDefaultUI: false,
            zoomControl: true,
          }}
        >
          {/* Marker example */}
          <Marker position={center} />
        </GoogleMap>
      </div>
    </div>
  );
}
