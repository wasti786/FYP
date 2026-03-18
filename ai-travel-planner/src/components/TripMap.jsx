
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

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
  
  const [mapInitialized, setMapInitialized] = useState(false);
  const [defaultPosition, setDefaultPosition] = useState([35.3, 74.3]);
  const [userLocation, setUserLocation] = useState(null);
  const [mapError, setMapError] = useState("");
  const [isLocating, setIsLocating] = useState(true);
  const [showMainRoute, setShowMainRoute] = useState(true);
  const [destinationCoords, setDestinationCoords] = useState(null);

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
        <div style="min-width: 150px;">
          <h4 style="margin: 0 0 5px 0; color: #22c55e;">📍 Your Location</h4>
          <p style="margin: 0; font-size: 12px;">You are here</p>
          <button onclick="window.flyToUserLocation()" 
            style="background: #1e3a5f; color: white; border: 1px solid #FFD700; padding: 5px 10px; border-radius: 5px; cursor: pointer; width: 100%; margin-top: 5px;">
            Center on my location
          </button>
        </div>
      `);
  }, [userLocation, mapInitialized]);

  // Add global function to fly to user location
  useEffect(() => {
    window.flyToUserLocation = () => {
      if (mapInstanceRef.current && userLocation) {
        mapInstanceRef.current.flyTo([userLocation.lat, userLocation.lng], 15, {
          duration: 2
        });
      }
    };

    return () => {
      window.flyToUserLocation = null;
    };
  }, [userLocation]);

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
              <div style="min-width: 150px;">
                <h4 style="margin: 0 0 5px 0; color: #ef4444;">📍 ${destination}</h4>
                <p style="margin: 0; font-size: 12px;">Your destination</p>
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
        createMarker: function() { return null; } // Don't create additional markers
      }).addTo(mapInstanceRef.current);
    } else {
      if (routingControlRef.current) {
        mapInstanceRef.current.removeControl(routingControlRef.current);
        routingControlRef.current = null;
      }
    }

  }, [userLocation, destinationCoords, showMainRoute, mapInitialized]);

  // Add markers for current day's places
  useEffect(() => {
    if (!mapInstanceRef.current || !itineraryDays[activeDay] || !mapInitialized) return;

    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    const places = itineraryDays[activeDay].places || [];

    places.forEach((place, index) => {
      const lat = defaultPosition[0] + (Math.random() - 0.5) * 0.05;
      const lng = defaultPosition[1] + (Math.random() - 0.5) * 0.05;
      
      const icon = index === 0 ? blueIcon : (index === 1 ? goldIcon : redIcon);
      
      const marker = L.marker([lat, lng], { icon })
        .addTo(mapInstanceRef.current)
        .bindPopup(`
          <div style="min-width: 220px;">
            <h3 style="margin: 0 0 5px 0; color: #2563eb;">${place.name}</h3>
            <p style="margin: 0 0 5px 0; font-size: 14px;">${place.description || 'A must-visit location.'}</p>
            <p style="margin: 0 0 10px 0; font-size: 12px; color: #666;">
              <i>📍 ${lat.toFixed(4)}, ${lng.toFixed(4)}</i>
            </p>
            <button onclick="window.getDirectionsToPlace(${lat}, ${lng}, '${place.name}')" 
              style="background: #1e3a5f; color: white; border: 1px solid #FFD700; padding: 8px 12px; border-radius: 5px; cursor: pointer; width: 100%; font-weight: bold; margin-bottom: 5px;">
              🚗 Get Directions
            </button>
            <button onclick="window.flyToPlace(${lat}, ${lng})" 
              style="background: #2a4a77; color: white; border: 1px solid #3b5f8c; padding: 5px 10px; border-radius: 5px; cursor: pointer; width: 100%;">
              👁️ View on Map
            </button>
          </div>
        `);

      markersRef.current.push(marker);
    });
  }, [activeDay, itineraryDays, defaultPosition, mapInitialized]);

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
        createMarker: function() { return null; }
      }).addTo(mapInstanceRef.current);

      // Show notification
      const notification = document.createElement('div');
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #1e3a5f;
        color: white;
        padding: 12px 24px;
        border-radius: 50px;
        z-index: 1000;
        border: 2px solid #FFD700;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        gap: 10px;
      `;
      notification.innerHTML = `
        <i class="fas fa-route" style="color: #FFD700;"></i>
        <span>Route to ${name} created</span>
        <button onclick="this.parentElement.remove()" style="background: none; border: none; color: white; margin-left: 10px; cursor: pointer;">✕</button>
      `;
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 5000);
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

        const highlightMarker = L.marker([lat, lng], { icon: redIcon })
          .addTo(mapInstanceRef.current)
          .bindPopup(`
            <div style="min-width: 220px;">
              <h3 style="margin: 0 0 5px 0; color: #dc2626;">📍 ${selectedActivity.name}</h3>
              <p style="margin: 0 0 5px 0; font-size: 14px;">${selectedActivity.description || 'Selected location'}</p>
              ${userLocation ? `
                <button onclick="window.getDirectionsToPlace(${lat}, ${lng}, '${selectedActivity.name}')" 
                  style="background: #1e3a5f; color: white; border: 1px solid #FFD700; padding: 8px 12px; border-radius: 5px; cursor: pointer; width: 100%; font-weight: bold; margin-top: 10px;">
                  🚗 Get Directions from Your Location
                </button>
              ` : ''}
            </div>
          `)
          .openPopup();

        setTimeout(() => {
          if (mapInstanceRef.current) {
            highlightMarker.remove();
          }
        }, 10000);

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