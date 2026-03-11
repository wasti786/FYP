// components/TripMap.jsx
import React, { useEffect, useRef, useCallback } from "react";

export default function TripMap({ destination, itineraryDays, activeDay, selectedActivity }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const geocodeCache = useRef(new Map()); // Cache { placeName: latLng }

  const clearMarkers = useCallback(() => {
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];
  }, []);

  const geocodePlace = useCallback((geocoder, placeName) => {
    return new Promise((resolve) => {
      if (geocodeCache.current.has(placeName)) {
        resolve(geocodeCache.current.get(placeName));
      } else {
        geocoder.geocode({ address: placeName }, (results, status) => {
          if (status === "OK" && results[0]) {
            const location = results[0].geometry.location;
            geocodeCache.current.set(placeName, location);
            resolve(location);
          } else {
            console.warn(`Geocoding failed for ${placeName}: ${status}`);
            resolve(null);
          }
        });
      }
    });
  }, []);

  // Sequential geocoding with delay to avoid 429
  const geocodePlacesSequentially = useCallback(async (geocoder, places) => {
    const locations = [];
    for (const place of places) {
      const loc = await geocodePlace(geocoder, place.name);
      locations.push(loc);
      // Wait 200ms between requests to avoid hitting quota
      await new Promise((res) => setTimeout(res, 200));
    }
    return locations;
  }, [geocodePlace]);

  useEffect(() => {
    if (!window.google) {
      console.error("Google Maps API not loaded.");
      return;
    }

    const geocoder = new window.google.maps.Geocoder();

    const initializeMap = (center) => {
      const map = new window.google.maps.Map(mapRef.current, {
        center,
        zoom: 10,
        mapTypeControl: false,
        fullscreenControl: true,
        streetViewControl: false,
        zoomControl: true,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
        ],
      });
      mapInstanceRef.current = map;
      updateMarkers(map, geocoder, activeDay);
    };

    const updateMarkers = async (map, geocoder, dayIndex) => {
      clearMarkers();
      const places = itineraryDays[dayIndex]?.places || [];
      if (!places.length) return;

      const locations = await geocodePlacesSequentially(geocoder, places);

      locations.forEach((location, idx) => {
        if (!location) return;
        const place = places[idx];
        const isSelected = selectedActivity?.name === place.name;

        const marker = new window.google.maps.Marker({
          position: location,
          map,
          title: place.name,
          animation: window.google.maps.Animation.DROP,
          icon: isSelected
            ? {
                url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                scaledSize: new window.google.maps.Size(40, 40),
              }
            : {
                url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
                scaledSize: new window.google.maps.Size(32, 32),
              },
        });

        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="max-width: 200px; padding: 8px;">
              <h4 style="margin: 0 0 5px; color: #1e293b;">${place.name}</h4>
              <p style="margin: 0; font-size: 0.9rem; color: #475569;">
                ${place.description || "A must-visit location."}
              </p>
            </div>
          `,
        });

        marker.addListener("click", () => infoWindow.open(map, marker));
        markersRef.current.push(marker);
      });

      // Pan to selected activity or first place
      if (selectedActivity) {
        const selectedIndex = places.findIndex(p => p.name === selectedActivity.name);
        if (selectedIndex !== -1 && locations[selectedIndex]) map.panTo(locations[selectedIndex]);
      } else if (locations[0]) {
        map.panTo(locations[0]);
      }
    };

    // Initialize or update map
    if (!mapInstanceRef.current) {
      geocoder.geocode({ address: destination }, (results, status) => {
        if (status === "OK" && results[0]) initializeMap(results[0].geometry.location);
        else initializeMap({ lat: 40.7128, lng: -74.0060 }); // fallback
      });
    } else {
      updateMarkers(mapInstanceRef.current, geocoder, activeDay);
    }
  }, [destination, itineraryDays, activeDay, selectedActivity, clearMarkers, geocodePlacesSequentially]);

  useEffect(() => () => clearMarkers(), [clearMarkers]);

  return (
    <div
      ref={mapRef}
      style={{
        width: "100%",
        height: "100%",
        borderRadius: "20px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
      }}
    />
  );
}