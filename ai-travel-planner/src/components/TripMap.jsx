
//OdzvanAPXMDpuYyx1vl_Njl4IQHhYIK2j4bx7CzxDuU

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css'; 
import 'leaflet-control-geocoder'; 

// Fix for default markers in Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Set up default icon
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom icons for different purposes
const userLocationIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const blueIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const goldIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const TripMap = ({ 
  destination, 
  itineraryDays, 
  activeDay, 
  selectedActivity,
  onActivitySelect 
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const routingControlRef = useRef(null);
  const userMarkerRef = useRef(null);
  const activeRouteRef = useRef(null);
  const distanceControlRef = useRef(null);
  
  const [mapInitialized, setMapInitialized] = useState(false);
  const [defaultPosition, setDefaultPosition] = useState([35.3, 74.3]);
  const [userLocation, setUserLocation] = useState(null);
  const [mapError, setMapError] = useState("");
  const [isLocating, setIsLocating] = useState(true);
  const [showMainRoute, setShowMainRoute] = useState(true);
  const [destinationCoords, setDestinationCoords] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);

  // Function to fetch place image from Unsplash
  const getPlaceImage = async (placeName) => {
    try {
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(placeName)}&per_page=1&client_id=OdzvanAPXMDpuYyx1vl_Njl4IQHhYIK2j4bx7CzxDuU`
      );
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        return data.results[0].urls.small;
      }
      return null;
    } catch (error) {
      console.error("Error fetching image:", error);
      return null;
    }
  };

  // Get user's current location
  useEffect(() => {
    if (!navigator.geolocation) {
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setIsLocating(false);
      },
      (error) => {
        console.log("Location access denied or error:", error);
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    try {
      mapInstanceRef.current = L.map(mapRef.current).setView(defaultPosition, 8);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(mapInstanceRef.current);

      L.control.scale({ imperial: false, metric: true }).addTo(mapInstanceRef.current);

      setMapInitialized(true);
      console.log("Map initialized successfully");
    } catch (error) {
      console.error("Error initializing map:", error);
      setMapError("Failed to initialize map");
    }

    return () => {
      if (routingControlRef.current) {
        mapInstanceRef.current?.removeControl(routingControlRef.current);
      }
      if (activeRouteRef.current) {
        mapInstanceRef.current?.removeControl(activeRouteRef.current);
      }
      if (distanceControlRef.current) {
        mapInstanceRef.current?.removeControl(distanceControlRef.current);
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Add user location marker when available
  useEffect(() => {
    if (!mapInstanceRef.current || !userLocation || !mapInitialized) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
    }

    userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { 
      icon: userLocationIcon,
      zIndexOffset: 1000
    })
      .addTo(mapInstanceRef.current)
      .bindPopup(`
        <div style="min-width: 200px;">
          <h4 style="margin: 0 0 5px 0; color: #22c55e;">📍 Your Location</h4>
          <p style="margin: 0; font-size: 12px;">You are here</p>
          <p style="margin: 5px 0; font-size: 11px; color: #666;">
            Lat: ${userLocation.lat.toFixed(4)}, Lng: ${userLocation.lng.toFixed(4)}
          </p>
        </div>
      `);
  }, [userLocation, mapInitialized]);

  // Search for destination coordinates
  useEffect(() => {
    if (!mapInstanceRef.current || !destination || !mapInitialized) return;

    const searchDestination = async () => {
      try {
        console.log("Searching for destination:", destination);
        
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destination)}&limit=1`,
          {
            headers: {
              'User-Agent': 'AITravelPlanner/1.0'
            }
          }
        );
        
        const data = await response.json();
        
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          console.log("Found coordinates:", lat, lon);
          
          setDefaultPosition([lat, lon]);
          setDestinationCoords({ lat, lng: lon });
          mapInstanceRef.current.setView([lat, lon], 10);
          
          // Add destination marker
          L.marker([lat, lon], { icon: redIcon })
            .addTo(mapInstanceRef.current)
            .bindPopup(`
              <div style="min-width: 200px;">
                <h4 style="margin: 0 0 5px 0; color: #ef4444;">📍 ${destination}</h4>
                <p style="margin: 0; font-size: 12px;">Your destination</p>
                <p style="margin: 5px 0; font-size: 11px; color: #666;">
                  Lat: ${lat.toFixed(4)}, Lng: ${lon.toFixed(4)}
                </p>
              </div>
            `);
        } else {
          console.log("No coordinates found for destination, using default");
        }
      } catch (error) {
        console.error("Error geocoding destination:", error);
      }
    };

    const timer = setTimeout(() => {
      searchDestination();
    }, 1000);

    return () => clearTimeout(timer);
  }, [destination, mapInitialized]);

  // Create main route from user to destination
  useEffect(() => {
    if (!mapInstanceRef.current || !userLocation || !destinationCoords || !mapInitialized) return;

    if (showMainRoute) {
      if (routingControlRef.current) {
        mapInstanceRef.current.removeControl(routingControlRef.current);
      }

      routingControlRef.current = L.Routing.control({
        waypoints: [
          L.latLng(userLocation.lat, userLocation.lng),
          L.latLng(destinationCoords.lat, destinationCoords.lng)
        ],
        routeWhileDragging: true,
        showAlternatives: true,
        fitSelectedRoutes: false,
        lineOptions: {
          styles: [{ color: '#3b82f6', weight: 5, opacity: 0.7 }]
        },
        createMarker: function() { return null; },
        show: false, // Hide default UI
        addWaypoints: false,
        routeDragInterval: 500
      }).addTo(mapInstanceRef.current);

      // Listen for route calculation to get distance and duration
      routingControlRef.current.on('routesfound', function(e) {
        const routes = e.routes;
        const route = routes[0];
        const distance = (route.summary.totalDistance / 1000).toFixed(1); // km
        const duration = Math.round(route.summary.totalTime / 60); // minutes
        
        setRouteInfo({ distance, duration });
        
        // Add distance control
        if (distanceControlRef.current) {
          mapInstanceRef.current.removeControl(distanceControlRef.current);
        }
        
        const DistanceControl = L.Control.extend({
          options: { position: 'bottomleft' },
          onAdd: function() {
            const div = L.DomUtil.create('div', 'distance-control');
            div.innerHTML = `
              <div style="
                background: #1e3a5f;
                color: white;
                padding: 12px 20px;
                border-radius: 30px;
                border: 2px solid #FFD700;
                box-shadow: 0 4px 15px rgba(0,0,0,0.3);
                font-weight: bold;
                display: flex;
                gap: 20px;
              ">
                <div>
                  <i class="fas fa-road" style="color: #FFD700; margin-right: 5px;"></i>
                  <span>${distance} km</span>
                </div>
                <div>
                  <i class="fas fa-clock" style="color: #FFD700; margin-right: 5px;"></i>
                  <span>${duration} min</span>
                </div>
              </div>
            `;
            return div;
          }
        });
        
        distanceControlRef.current = new DistanceControl();
        distanceControlRef.current.addTo(mapInstanceRef.current);
      });
    } else {
      if (routingControlRef.current) {
        mapInstanceRef.current.removeControl(routingControlRef.current);
        routingControlRef.current = null;
      }
      if (distanceControlRef.current) {
        mapInstanceRef.current.removeControl(distanceControlRef.current);
        distanceControlRef.current = null;
      }
      setRouteInfo(null);
    }

  }, [userLocation, destinationCoords, showMainRoute, mapInitialized]);

  // Add markers for current day's places
  useEffect(() => {
    if (!mapInstanceRef.current || !itineraryDays[activeDay] || !mapInitialized) return;

    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    const places = itineraryDays[activeDay].places || [];

    places.forEach(async (place, index) => {
      const lat = defaultPosition[0] + (Math.random() - 0.5) * 0.05;
      const lng = defaultPosition[1] + (Math.random() - 0.5) * 0.05;
      
      const icon = index === 0 ? blueIcon : (index === 1 ? goldIcon : redIcon);
      
      // Fetch place image
      const imageUrl = await getPlaceImage(place.name);
      
      const marker = L.marker([lat, lng], { icon })
        .addTo(mapInstanceRef.current)
        .bindPopup(`
          <div style="min-width: 280px; max-width: 320px;">
            ${imageUrl ? `
              <div style="margin: -12px -12px 10px -12px;">
                <img src="${imageUrl}" alt="${place.name}" 
                  style="width: 100%; height: 150px; object-fit: cover; border-radius: 8px 8px 0 0;">
              </div>
            ` : ''}
            <h3 style="margin: 0 0 5px 0; color: #2563eb; font-size: 18px;">${place.name}</h3>
            <p style="margin: 0 0 10px 0; font-size: 14px; color: #4b5563;">${place.description || 'A must-visit location.'}</p>
            <div style="background: #f3f4f6; padding: 8px; border-radius: 6px; margin-bottom: 10px;">
              <p style="margin: 0; font-size: 12px; color: #6b7280;">
                <i class="fas fa-map-pin"></i> ${lat.toFixed(4)}, ${lng.toFixed(4)}
              </p>
            </div>
            <div style="display: flex; gap: 8px;">
              ${userLocation ? `
                <button onclick="window.getDirectionsToPlace(${lat}, ${lng}, '${place.name}')" 
                  style="flex: 2; background: #1e3a5f; color: white; border: 1px solid #FFD700; padding: 10px; border-radius: 6px; cursor: pointer; font-weight: bold; display: flex; align-items: center; justify-content: center; gap: 5px;">
                  <i class="fas fa-route"></i> Directions
                </button>
              ` : ''}
              <button onclick="window.flyToPlace(${lat}, ${lng})" 
                style="flex: 1; background: #2a4a77; color: white; border: 1px solid #3b5f8c; padding: 10px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                <i class="fas fa-search"></i>
              </button>
            </div>
          </div>
        `);

      markersRef.current.push(marker);
    });
  }, [activeDay, itineraryDays, defaultPosition, mapInitialized, userLocation]);

  // Add global functions for place interactions
  useEffect(() => {
    window.getDirectionsToPlace = (lat, lng, name) => {
      if (!mapInstanceRef.current || !userLocation) {
        alert("Please enable location access to get directions");
        return;
      }

      // Remove any existing active route
      if (activeRouteRef.current) {
        mapInstanceRef.current.removeControl(activeRouteRef.current);
      }

      // Create new route to the place
      activeRouteRef.current = L.Routing.control({
        waypoints: [
          L.latLng(userLocation.lat, userLocation.lng),
          L.latLng(lat, lng)
        ],
        routeWhileDragging: true,
        showAlternatives: true,
        fitSelectedRoutes: true,
        lineOptions: {
          styles: [{ color: '#22c55e', weight: 6, opacity: 0.8 }]
        },
        createMarker: function() { return null; },
        show: false,
        addWaypoints: false
      }).addTo(mapInstanceRef.current);

      // Listen for route calculation
      activeRouteRef.current.on('routesfound', function(e) {
        const routes = e.routes;
        const route = routes[0];
        const distance = (route.summary.totalDistance / 1000).toFixed(1);
        const duration = Math.round(route.summary.totalTime / 60);
        
        // Show detailed route info
        const infoDiv = document.createElement('div');
        infoDiv.style.cssText = `
          position: fixed;
          bottom: 30px;
          left: 50%;
          transform: translateX(-50%);
          background: #1e3a5f;
          color: white;
          padding: 15px 25px;
          border-radius: 50px;
          z-index: 1000;
          border: 2px solid #FFD700;
          box-shadow: 0 4px 20px rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          gap: 25px;
          font-size: 16px;
          animation: slideUp 0.3s ease;
        `;
        infoDiv.innerHTML = `
          <div style="display: flex; align-items: center; gap: 8px;">
            <i class="fas fa-location-dot" style="color: #FFD700;"></i>
            <span>${name}</span>
          </div>
          <div style="width: 1px; height: 20px; background: #3b5f8c;"></div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <i class="fas fa-road" style="color: #FFD700;"></i>
            <span>${distance} km</span>
          </div>
          <div style="width: 1px; height: 20px; background: #3b5f8c;"></div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <i class="fas fa-clock" style="color: #FFD700;"></i>
            <span>${duration} min</span>
          </div>
          <button onclick="this.parentElement.remove()" 
            style="background: none; border: none; color: white; margin-left: 10px; cursor: pointer; font-size: 18px;">
            ✕
          </button>
        `;
        document.body.appendChild(infoDiv);
        
        setTimeout(() => {
          if (infoDiv.parentElement) infoDiv.remove();
        }, 10000);
      });

      // Fly to show both points
      const bounds = L.latLngBounds([
        [userLocation.lat, userLocation.lng],
        [lat, lng]
      ]);
      mapInstanceRef.current.flyToBounds(bounds, { padding: [50, 50], duration: 2 });
    };

    window.flyToPlace = (lat, lng) => {
      if (!mapInstanceRef.current) return;
      mapInstanceRef.current.flyTo([lat, lng], 16, { duration: 2 });
    };

    window.clearActiveRoute = () => {
      if (activeRouteRef.current) {
        mapInstanceRef.current?.removeControl(activeRouteRef.current);
        activeRouteRef.current = null;
      }
    };

    return () => {
      window.getDirectionsToPlace = null;
      window.flyToPlace = null;
      window.clearActiveRoute = null;
    };
  }, [userLocation]);

  // Handle selected activity (when user clicks "View on Map" from main UI)
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedActivity || !mapInitialized) return;

    const focusOnPlace = async () => {
      try {
        console.log("Focusing on place:", selectedActivity.name);
        
        const searchQuery = `${selectedActivity.name}, ${destination}`;
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`,
          {
            headers: {
              'User-Agent': 'AITravelPlanner/1.0'
            }
          }
        );
        
        const data = await response.json();
        
        let lat, lng;
        
        if (data && data.length > 0) {
          lat = parseFloat(data[0].lat);
          lng = parseFloat(data[0].lon);
        } else {
          lat = defaultPosition[0] + (Math.random() - 0.5) * 0.02;
          lng = defaultPosition[1] + (Math.random() - 0.5) * 0.02;
        }

        mapInstanceRef.current.flyTo([lat, lng], 15, { duration: 2 });

        // Fetch place image
        const imageUrl = await getPlaceImage(selectedActivity.name);

        const highlightMarker = L.marker([lat, lng], { icon: redIcon })
          .addTo(mapInstanceRef.current)
          .bindPopup(`
            <div style="min-width: 280px; max-width: 320px;">
              ${imageUrl ? `
                <div style="margin: -12px -12px 10px -12px;">
                  <img src="${imageUrl}" alt="${selectedActivity.name}" 
                    style="width: 100%; height: 150px; object-fit: cover; border-radius: 8px 8px 0 0;">
                </div>
              ` : ''}
              <h3 style="margin: 0 0 5px 0; color: #dc2626; font-size: 18px;">📍 ${selectedActivity.name}</h3>
              <p style="margin: 0 0 10px 0; font-size: 14px; color: #4b5563;">${selectedActivity.description || 'Selected location'}</p>
              <div style="background: #f3f4f6; padding: 8px; border-radius: 6px; margin-bottom: 10px;">
                <p style="margin: 0; font-size: 12px; color: #6b7280;">
                  <i class="fas fa-map-pin"></i> ${lat.toFixed(4)}, ${lng.toFixed(4)}
                </p>
              </div>
              ${userLocation ? `
                <button onclick="window.getDirectionsToPlace(${lat}, ${lng}, '${selectedActivity.name}')" 
                  style="width: 100%; background: #1e3a5f; color: white; border: 1px solid #FFD700; padding: 12px; border-radius: 6px; cursor: pointer; font-weight: bold; display: flex; align-items: center; justify-content: center; gap: 8px;">
                  <i class="fas fa-route"></i> Get Directions from Your Location
                </button>
              ` : ''}
            </div>
          `)
          .openPopup();

        setTimeout(() => {
          if (mapInstanceRef.current) {
            highlightMarker.remove();
          }
        }, 15000);

      } catch (error) {
        console.error("Error focusing on place:", error);
      }
    };

    focusOnPlace();

    if (onActivitySelect) {
      setTimeout(() => onActivitySelect(null), 1000);
    }
  }, [selectedActivity, destination, defaultPosition, mapInitialized, userLocation]);

  if (mapError) {
    return (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f3f4f6',
        borderRadius: '12px',
        padding: '20px',
        textAlign: 'center'
      }}>
        <div>
          <i className="fas fa-map" style={{ fontSize: '48px', color: '#9ca3af', marginBottom: '10px' }}></i>
          <h3 style={{ color: '#4b5563', marginBottom: '5px' }}>Map unavailable</h3>
          <p style={{ color: '#6b7280' }}>{mapError}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Add animation styles */}
      <style>{`
        @keyframes slideUp {
          from {
            transform: translate(-50%, 100%);
            opacity: 0;
          }
          to {
            transform: translate(-50%, 0);
            opacity: 1;
          }
        }
      `}</style>

      {/* Location status overlay */}
      {isLocating && (
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#1e3a5f',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '20px',
          zIndex: 1000,
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
          border: '1px solid #3b5f8c',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <i className="fas fa-spinner fa-spin"></i>
          Getting your location...
        </div>
      )}

      {/* Control buttons */}
      <div style={{
        position: 'absolute',
        top: '70px',
        right: '10px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        {/* Main route toggle button */}
        {userLocation && destinationCoords && (
          <button
            onClick={() => setShowMainRoute(!showMainRoute)}
            style={{
              background: '#1e3a5f',
              border: '2px solid #3b5f8c',
              color: 'white',
              padding: '10px 15px',
              borderRadius: '8px',
              cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.3s ease',
              width: '40px',
              height: '40px',
              justifyContent: 'center'
            }}
            title={showMainRoute ? "Hide main route" : "Show main route"}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#2a4a77';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#1e3a5f';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <i className="fas fa-route" style={{ color: '#FFD700' }}></i>
          </button>
        )}

        {/* Center on user location button */}
        {userLocation && (
          <button
            onClick={() => {
              if (mapInstanceRef.current && userLocation) {
                mapInstanceRef.current.flyTo([userLocation.lat, userLocation.lng], 15, {
                  duration: 2
                });
              }
            }}
            style={{
              background: '#1e3a5f',
              border: '2px solid #3b5f8c',
              color: 'white',
              padding: '10px 15px',
              borderRadius: '8px',
              cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.3s ease',
              width: '40px',
              height: '40px',
              justifyContent: 'center'
            }}
            title="Center on my location"
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#2a4a77';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#1e3a5f';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <i className="fas fa-location-dot" style={{ color: '#FFD700' }}></i>
          </button>
        )}

        {/* Clear active route button */}
        <button
          onClick={() => {
            if (activeRouteRef.current) {
              mapInstanceRef.current?.removeControl(activeRouteRef.current);
              activeRouteRef.current = null;
            }
          }}
          style={{
            background: '#dc2626',
            border: '2px solid #ef4444',
            color: 'white',
            padding: '10px 15px',
            borderRadius: '8px',
            cursor: 'pointer',
            boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.3s ease',
            width: '40px',
            height: '40px',
            justifyContent: 'center'
          }}
          title="Clear active route"
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#b91c1c';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#dc2626';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <i className="fas fa-times"></i>
        </button>
      </div>

      {/* Map container */}
      <div 
        ref={mapRef} 
        style={{ 
          width: '100%', 
          height: '100%',
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }} 
      />
    </div>
  );
};

export default TripMap;