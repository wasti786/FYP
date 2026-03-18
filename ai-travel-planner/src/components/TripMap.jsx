import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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
  const [mapInitialized, setMapInitialized] = useState(false);
  const [defaultPosition, setDefaultPosition] = useState([35.3, 74.3]); // Default for Gilgit Baltistan
  const [mapError, setMapError] = useState("");

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    try {
      // Create map instance
      mapInstanceRef.current = L.map(mapRef.current).setView(defaultPosition, 8);

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(mapInstanceRef.current);

      // Add scale control
      L.control.scale({ imperial: false, metric: true }).addTo(mapInstanceRef.current);

      setMapInitialized(true);
      console.log("Map initialized successfully");
    } catch (error) {
      console.error("Error initializing map:", error);
      setMapError("Failed to initialize map");
    }

    // Cleanup on unmount
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Search for destination coordinates
  useEffect(() => {
    if (!mapInstanceRef.current || !destination || !mapInitialized) return;

    const searchDestination = async () => {
      try {
        console.log("Searching for destination:", destination);
        
        // Using Nominatim for geocoding (free, no API key required)
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destination)}&limit=1`,
          {
            headers: {
              'User-Agent': 'AITravelPlanner/1.0' // Required by Nominatim
            }
          }
        );
        
        const data = await response.json();
        
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          console.log("Found coordinates:", lat, lon);
          
          setDefaultPosition([lat, lon]);
          mapInstanceRef.current.setView([lat, lon], 10);
        } else {
          console.log("No coordinates found for destination, using default");
        }
      } catch (error) {
        console.error("Error geocoding destination:", error);
      }
    };

    // Add a small delay to avoid rate limiting
    const timer = setTimeout(() => {
      searchDestination();
    }, 1000);

    return () => clearTimeout(timer);
  }, [destination, mapInitialized]);

  // Add markers for current day's places
  useEffect(() => {
    if (!mapInstanceRef.current || !itineraryDays[activeDay] || !mapInitialized) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    const places = itineraryDays[activeDay].places || [];
    console.log("Adding markers for places:", places);

    // If no places, show a message
    if (places.length === 0) {
      return;
    }

    // Geocode each place (in a real app, you'd want to batch these or have coordinates from backend)
    places.forEach(async (place, index) => {
      try {
        // For demo purposes, we'll offset from the destination position
        // In production, you'd want actual coordinates from your backend
        const offset = 0.01 * (index + 1);
        const lat = defaultPosition[0] + (Math.random() - 0.5) * 0.1;
        const lng = defaultPosition[1] + (Math.random() - 0.5) * 0.1;
        
        // Choose icon based on index
        const icon = index === 0 ? blueIcon : (index === 1 ? redIcon : goldIcon);
        
        // Create marker
        const marker = L.marker([lat, lng], { icon })
          .addTo(mapInstanceRef.current)
          .bindPopup(`
            <div style="min-width: 200px;">
              <h3 style="margin: 0 0 5px 0; color: #2563eb;">${place.name}</h3>
              <p style="margin: 0 0 5px 0; font-size: 14px;">${place.description || 'A must-visit location.'}</p>
              <p style="margin: 0; font-size: 12px; color: #666;">
                <i>📍 Click marker for details</i>
              </p>
            </div>
          `);

        // Add click handler
        marker.on('click', () => {
          marker.openPopup();
        });

        markersRef.current.push(marker);

        // If this is the first place, center map slightly
        if (index === 0) {
          // mapInstanceRef.current.setView([lat, lng], 12);
        }
      } catch (error) {
        console.error(`Error adding marker for ${place.name}:`, error);
      }
    });
  }, [activeDay, itineraryDays, defaultPosition, mapInitialized]);

  // Handle selected activity (when user clicks "View on Map")
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedActivity || !mapInitialized) return;

    const focusOnPlace = async () => {
      try {
        console.log("Focusing on place:", selectedActivity.name);
        
        // Try to geocode the specific place
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
          // Fallback to destination with offset
          lat = defaultPosition[0] + (Math.random() - 0.5) * 0.05;
          lng = defaultPosition[1] + (Math.random() - 0.5) * 0.05;
        }

        // Fly to the location
        mapInstanceRef.current.flyTo([lat, lng], 15, {
          duration: 2 // animation duration in seconds
        });

        // Add a temporary highlighted marker
        const highlightMarker = L.marker([lat, lng], { icon: redIcon })
          .addTo(mapInstanceRef.current)
          .bindPopup(`
            <div style="min-width: 200px;">
              <h3 style="margin: 0 0 5px 0; color: #dc2626;">📍 Selected: ${selectedActivity.name}</h3>
              <p style="margin: 0; font-size: 14px;">${selectedActivity.description || 'Your selected location'}</p>
            </div>
          `)
          .openPopup();

        // Remove highlight marker after 5 seconds
        setTimeout(() => {
          if (mapInstanceRef.current) {
            highlightMarker.remove();
          }
        }, 5000);

      } catch (error) {
        console.error("Error focusing on place:", error);
      }
    };

    focusOnPlace();

    // Clear selection after handling
    if (onActivitySelect) {
      setTimeout(() => onActivitySelect(null), 1000);
    }
  }, [selectedActivity, destination, defaultPosition, mapInitialized]);

  // Show error state if map fails to initialize
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
    <div 
      ref={mapRef} 
      style={{ 
        width: '100%', 
        height: '100%',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }} 
    />
  );
};

export default TripMap;

//new one 
// import React, { useEffect, useRef, useState } from 'react';
// import L from 'leaflet';
// import 'leaflet/dist/leaflet.css';
// import 'leaflet-routing-machine';
// import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

// // Fix for default markers in Leaflet
// import icon from 'leaflet/dist/images/marker-icon.png';
// import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// // Set up default icon
// let DefaultIcon = L.icon({
//   iconUrl: icon,
//   shadowUrl: iconShadow,
//   iconSize: [25, 41],
//   iconAnchor: [12, 41],
//   popupAnchor: [1, -34],
//   shadowSize: [41, 41]
// });
// L.Marker.prototype.options.icon = DefaultIcon;

// // Custom icons for different purposes
// const userLocationIcon = new L.Icon({
//   iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
//   shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
//   iconSize: [25, 41],
//   iconAnchor: [12, 41],
//   popupAnchor: [1, -34],
//   shadowSize: [41, 41]
// });

// const blueIcon = new L.Icon({
//   iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
//   shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
//   iconSize: [25, 41],
//   iconAnchor: [12, 41],
//   popupAnchor: [1, -34],
//   shadowSize: [41, 41]
// });

// const redIcon = new L.Icon({
//   iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
//   shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
//   iconSize: [25, 41],
//   iconAnchor: [12, 41],
//   popupAnchor: [1, -34],
//   shadowSize: [41, 41]
// });

// const goldIcon = new L.Icon({
//   iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
//   shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
//   iconSize: [25, 41],
//   iconAnchor: [12, 41],
//   popupAnchor: [1, -34],
//   shadowSize: [41, 41]
// });

// const TripMap = ({ 
//   destination, 
//   itineraryDays, 
//   activeDay, 
//   selectedActivity,
//   onActivitySelect 
// }) => {
//   const mapRef = useRef(null);
//   const mapInstanceRef = useRef(null);
//   const markersRef = useRef([]);
//   const routingControlRef = useRef(null);
//   const userMarkerRef = useRef(null);
  
//   const [mapInitialized, setMapInitialized] = useState(false);
//   const [defaultPosition, setDefaultPosition] = useState([35.3, 74.3]);
//   const [userLocation, setUserLocation] = useState(null);
//   const [mapError, setMapError] = useState("");
//   const [isLocating, setIsLocating] = useState(true);

//   // Get user's current location
//   useEffect(() => {
//     if (!navigator.geolocation) {
//       setIsLocating(false);
//       return;
//     }

//     navigator.geolocation.getCurrentPosition(
//       (position) => {
//         const { latitude, longitude } = position.coords;
//         setUserLocation({ lat: latitude, lng: longitude });
//         setIsLocating(false);
//       },
//       (error) => {
//         console.log("Location access denied or error:", error);
//         setIsLocating(false);
//       },
//       {
//         enableHighAccuracy: true,
//         timeout: 10000,
//         maximumAge: 0
//       }
//     );
//   }, []);

//   // Initialize map
//   useEffect(() => {
//     if (!mapRef.current || mapInstanceRef.current) return;

//     try {
//       mapInstanceRef.current = L.map(mapRef.current).setView(defaultPosition, 8);

//       L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//         attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
//         maxZoom: 19,
//       }).addTo(mapInstanceRef.current);

//       L.control.scale({ imperial: false, metric: true }).addTo(mapInstanceRef.current);

//       setMapInitialized(true);
//     } catch (error) {
//       console.error("Error initializing map:", error);
//       setMapError("Failed to initialize map");
//     }

//     return () => {
//       if (routingControlRef.current) {
//         mapInstanceRef.current?.removeControl(routingControlRef.current);
//       }
//       if (mapInstanceRef.current) {
//         mapInstanceRef.current.remove();
//         mapInstanceRef.current = null;
//       }
//     };
//   }, []);

//   // Add user location marker when available
//   useEffect(() => {
//     if (!mapInstanceRef.current || !userLocation || !mapInitialized) return;

//     if (userMarkerRef.current) {
//       userMarkerRef.current.remove();
//     }

//     userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { 
//       icon: userLocationIcon,
//       zIndexOffset: 1000
//     })
//       .addTo(mapInstanceRef.current)
//       .bindPopup(`
//         <div style="min-width: 150px;">
//           <h4 style="margin: 0 0 5px 0; color: #22c55e;">📍 Your Location</h4>
//           <p style="margin: 0; font-size: 12px;">You are here</p>
//         </div>
//       `);
//   }, [userLocation, mapInitialized]);

//   // Search for destination coordinates
//   useEffect(() => {
//     if (!mapInstanceRef.current || !destination || !mapInitialized) return;

//     const searchDestination = async () => {
//       try {
//         const response = await fetch(
//           `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destination)}&limit=1`,
//           {
//             headers: {
//               'User-Agent': 'AITravelPlanner/1.0'
//             }
//           }
//         );
        
//         const data = await response.json();
        
//         if (data && data.length > 0) {
//           const lat = parseFloat(data[0].lat);
//           const lon = parseFloat(data[0].lon);
          
//           setDefaultPosition([lat, lon]);
//           mapInstanceRef.current.setView([lat, lon], 10);
          
//           // Add destination marker
//           L.marker([lat, lon], { icon: redIcon })
//             .addTo(mapInstanceRef.current)
//             .bindPopup(`
//               <div style="min-width: 150px;">
//                 <h4 style="margin: 0 0 5px 0; color: #ef4444;">📍 ${destination}</h4>
//                 <p style="margin: 0; font-size: 12px;">Your destination</p>
//               </div>
//             `);
//         }
//       } catch (error) {
//         console.error("Error geocoding destination:", error);
//       }
//     };

//     const timer = setTimeout(() => {
//       searchDestination();
//     }, 1000);

//     return () => clearTimeout(timer);
//   }, [destination, mapInitialized]);

//   // Create route when both locations are available
//   useEffect(() => {
//     if (!mapInstanceRef.current || !userLocation || !defaultPosition || !mapInitialized) return;

//     if (routingControlRef.current) {
//       mapInstanceRef.current.removeControl(routingControlRef.current);
//     }

//     routingControlRef.current = L.Routing.control({
//       waypoints: [
//         L.latLng(userLocation.lat, userLocation.lng),
//         L.latLng(defaultPosition[0], defaultPosition[1])
//       ],
//       routeWhileDragging: true,
//       showAlternatives: true,
//       fitSelectedRoutes: true,
//       lineOptions: {
//         styles: [{ color: '#3b82f6', weight: 5, opacity: 0.7 }]
//       }
//     }).addTo(mapInstanceRef.current);

//   }, [userLocation, defaultPosition, mapInitialized]);

//   // Add markers for current day's places
//   useEffect(() => {
//     if (!mapInstanceRef.current || !itineraryDays[activeDay] || !mapInitialized) return;

//     markersRef.current.forEach(marker => marker.remove());
//     markersRef.current = [];

//     const places = itineraryDays[activeDay].places || [];

//     places.forEach((place, index) => {
//       const lat = defaultPosition[0] + (Math.random() - 0.5) * 0.05;
//       const lng = defaultPosition[1] + (Math.random() - 0.5) * 0.05;
      
//       const icon = index === 0 ? blueIcon : (index === 1 ? goldIcon : redIcon);
      
//       const marker = L.marker([lat, lng], { icon })
//         .addTo(mapInstanceRef.current)
//         .bindPopup(`
//           <div style="min-width: 200px;">
//             <h3 style="margin: 0 0 5px 0; color: #2563eb;">${place.name}</h3>
//             <p style="margin: 0 0 5px 0; font-size: 14px;">${place.description || 'A must-visit location.'}</p>
//           </div>
//         `);

//       markersRef.current.push(marker);
//     });
//   }, [activeDay, itineraryDays, defaultPosition, mapInitialized]);

//   // Handle selected activity (when user clicks "View on Map")
//   useEffect(() => {
//     if (!mapInstanceRef.current || !selectedActivity || !mapInitialized) return;

//     const focusOnPlace = async () => {
//       try {
//         const searchQuery = `${selectedActivity.name}, ${destination}`;
//         const response = await fetch(
//           `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`,
//           {
//             headers: {
//               'User-Agent': 'AITravelPlanner/1.0'
//             }
//           }
//         );
        
//         const data = await response.json();
        
//         let lat, lng;
        
//         if (data && data.length > 0) {
//           lat = parseFloat(data[0].lat);
//           lng = parseFloat(data[0].lon);
//         } else {
//           lat = defaultPosition[0] + (Math.random() - 0.5) * 0.02;
//           lng = defaultPosition[1] + (Math.random() - 0.5) * 0.02;
//         }

//         mapInstanceRef.current.flyTo([lat, lng], 15, { duration: 2 });

//         const highlightMarker = L.marker([lat, lng], { icon: redIcon })
//           .addTo(mapInstanceRef.current)
//           .bindPopup(`
//             <div style="min-width: 200px;">
//               <h3 style="margin: 0 0 5px 0; color: #dc2626;">📍 ${selectedActivity.name}</h3>
//               <p style="margin: 0; font-size: 14px;">${selectedActivity.description || 'Selected location'}</p>
//             </div>
//           `)
//           .openPopup();

//         setTimeout(() => {
//           if (mapInstanceRef.current) {
//             highlightMarker.remove();
//           }
//         }, 5000);

//       } catch (error) {
//         console.error("Error focusing on place:", error);
//       }
//     };

//     focusOnPlace();

//     if (onActivitySelect) {
//       setTimeout(() => onActivitySelect(null), 1000);
//     }
//   }, [selectedActivity, destination, defaultPosition, mapInitialized]);

//   if (mapError) {
//     return (
//       <div style={{
//         width: '100%',
//         height: '100%',
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'center',
//         backgroundColor: '#f3f4f6',
//         borderRadius: '12px',
//         padding: '20px',
//         textAlign: 'center'
//       }}>
//         <div>
//           <i className="fas fa-map" style={{ fontSize: '48px', color: '#9ca3af', marginBottom: '10px' }}></i>
//           <h3 style={{ color: '#4b5563', marginBottom: '5px' }}>Map unavailable</h3>
//           <p style={{ color: '#6b7280' }}>{mapError}</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div style={{ position: 'relative', width: '100%', height: '100%' }}>
//       {isLocating && (
//         <div style={{
//           position: 'absolute',
//           top: '10px',
//           left: '50%',
//           transform: 'translateX(-50%)',
//           background: '#1e3a5f',
//           color: 'white',
//           padding: '8px 16px',
//           borderRadius: '20px',
//           zIndex: 1000,
//           boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
//           border: '1px solid #3b5f8c',
//           display: 'flex',
//           alignItems: 'center',
//           gap: '8px'
//         }}>
//           <i className="fas fa-spinner fa-spin"></i>
//           Getting your location...
//         </div>
//       )}

//       <div 
//         ref={mapRef} 
//         style={{ 
//           width: '100%', 
//           height: '100%',
//           borderRadius: '12px',
//           boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
//         }} 
//       />
//     </div>
//   );
// };

// export default TripMap;