
// import React, { useState, useEffect } from "react";
// import { useAuth } from "../context/AuthContext";
// import { db } from "../firebase";
// import { useNavigate } from "react-router-dom";
// import {
//   collection,
//   addDoc,
//   serverTimestamp,
//   query,
//   where,
//   getDocs,
//   deleteDoc,
//   doc,
//   orderBy,
// } from "firebase/firestore";
// import "../CSS/Planner.css";

// export default function Planner() {
//   const { currentUser } = useAuth();
//   const navigate = useNavigate();
//   const saved = JSON.parse(localStorage.getItem("tripInput") || "{}");

//   const [form, setForm] = useState({
//     destination: saved.destination || "",
//     startDate: "",
//     endDate: "",
//     interests: "",
//     travelers: "",
//   });

//   const [message, setMessage] = useState("");
//   const [savedTrips, setSavedTrips] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [activeTab, setActiveTab] = useState("plan");
//   const [editingTrip, setEditingTrip] = useState(null);
//   const [editForm, setEditForm] = useState({});

//   // Dropdown options
//   const interestOptions = [
//     "Adventure",
//     "Relaxation",
//     "Culture",
//     "Beach",
//     "Mountains",
//     "City Tour",
//     "History",
//     "Nature",
//     "Wildlife",
//     "Sports",
//     "Luxury",
//   ];

//   const travelerOptions = [
//     "Solo Travel",
//     "Couple (2 people)",
//     "Family (3-4 people)",
//     "Group (5-8 people)",
//     "Large Group (9+ people)",
//   ];

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   // Handle AI Plan Generation
//   const handleGeneratePlan = () => {
//     const errors = [];

//     if (!form.destination?.trim()) {
//       errors.push("Destination is required");
//     }
//     if (!form.startDate) {
//       errors.push("Start date is required");
//     }
//     if (!form.endDate) {
//       errors.push("End date is required");
//     }
//     if (!form.interests) {
//       errors.push("Please select your interests");
//     }
//     if (!form.travelers) {
//       errors.push("Please select number of travelers");
//     }

//     if (form.startDate && form.endDate) {
//       const start = new Date(form.startDate);
//       const end = new Date(form.endDate);
//       if (end <= start) {
//         errors.push("End date must be after start date");
//       }
//     }

//     if (errors.length > 0) {
//       setMessage(`Please fix the following: ${errors.join(", ")}`);
//       return;
//     }

//     const tripData = {
//       destination: form.destination.trim(),
//       startDate: form.startDate,
//       endDate: form.endDate,
//       interests: form.interests,
//       travelers: form.travelers,
//     };

//     localStorage.setItem("tripInput", JSON.stringify(tripData));
//     navigate("/generate-plan", { state: tripData });
//   };

//   // Fetch saved trips from Firebase
//   const fetchSavedTrips = async () => {
//     if (!currentUser) {
//       console.log("No user logged in");
//       return;
//     }
    
//     try {
//       setLoading(true);
//       console.log("Fetching trips for user:", currentUser.uid);
      
//       // Query with userId filter - orderBy will work once index is created
//       // If index is still building, this will work without orderBy
//       const q = query(
//         collection(db, "savedTrips"),
//         where("userId", "==", currentUser.uid),
//         orderBy("savedAt", "desc")
//       );
      
//       const querySnapshot = await getDocs(q);
//       const trips = [];
      
//       querySnapshot.forEach((docSnap) => {
//         const data = docSnap.data();
//         trips.push({ 
//           id: docSnap.id, 
//           ...data 
//         });
//       });
      
//       console.log("Total trips found:", trips.length);
//       setSavedTrips(trips);
      
//     } catch (err) {
//       console.error("Error fetching saved trips:", err);
      
//       // If index error, try without orderBy
//       if (err.code === 'failed-precondition' || err.message.includes('index')) {
//         console.log("Index building, trying without sorting...");
//         try {
//           const q = query(
//             collection(db, "savedTrips"),
//             where("userId", "==", currentUser.uid)
//           );
//           const querySnapshot = await getDocs(q);
//           const trips = [];
          
//           querySnapshot.forEach((docSnap) => {
//             trips.push({ id: docSnap.id, ...docSnap.data() });
//           });
          
//           // Sort manually
//           trips.sort((a, b) => {
//             if (a.savedAt > b.savedAt) return -1;
//             if (a.savedAt < b.savedAt) return 1;
//             return 0;
//           });
          
//           console.log("Total trips found (manual sort):", trips.length);
//           setSavedTrips(trips);
//         } catch (fallbackErr) {
//           console.error("Fallback also failed:", fallbackErr);
//           setMessage("Error fetching your trips. Please create Firebase index.");
//         }
//       } else {
//         setMessage("Error fetching your trips.");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle viewing a saved trip
// const handleViewTrip = (trip) => {
//   console.log("Viewing saved trip:", trip);
  
//   // Prepare the data structure - PASS THE FULL PLAN
//   const tripPayload = {
//     destination: trip.destination,
//     startDate: trip.startDate,
//     endDate: trip.endDate,
//     travelers: trip.travelers,
//     budget: trip.budgetLevel || trip.budget || "Mid-range",
//     preferences: trip.preferences || trip.interests || "Travel",
    
//     // CRITICAL: Pass the saved plan
//     plan: {
//       days: trip.days || [],
//       hotels: trip.hotels || [],
//       travelTips: trip.travelTips || [],
//       budget: trip.budget || null
//     },
    
//     // Flag to indicate this is a saved trip  
//     isSavedTrip: true
//   };
  
//   console.log("Navigating with saved plan:", tripPayload.plan.days?.length, "days");
//   navigate('/generate-plan', { state: tripPayload });
// };

//   // Handle deleting a saved trip
//   const handleDeleteTrip = async (tripId) => {
//     if (!window.confirm("Are you sure you want to delete this trip?")) return;
    
//     try {
//       await deleteDoc(doc(db, "savedTrips", tripId));
//       setMessage("Trip deleted successfully!");
//       fetchSavedTrips(); // Refresh the list
//     } catch (err) {
//       console.error("Error deleting trip:", err);
//       setMessage("Error deleting trip.");
//     }
//   };

//   // Fetch trips when user changes or tab becomes saved
//   useEffect(() => {
//     if (currentUser && activeTab === 'saved') {
//       fetchSavedTrips();
//     }
//   }, [currentUser, activeTab]);

//   // Check URL for tab parameter
//   useEffect(() => {
//     const params = new URLSearchParams(window.location.search);
//     const tab = params.get('tab');
//     if (tab === 'saved') {
//       setActiveTab('saved');
//     }
//   }, []);

//   // Your existing handleSave function (for the old trips collection)
//   const handleSave = async () => {
//     if (!currentUser) {
//       setMessage("Please login to save trips.");
//       return;
//     }

//     setLoading(true);
//     try {
//       await addDoc(collection(db, "trips"), {
//         uid: currentUser.uid,
//         ...form,
//         createdAt: serverTimestamp(),
//       });

//       setMessage("Trip saved successfully!");
//       setForm({
//         destination: "",
//         startDate: "",
//         endDate: "",
//         interests: "",
//         travelers: "",
//       });
//       localStorage.removeItem("tripInput");
//     } catch (err) {
//       setMessage("Error: " + err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleEditClick = (trip) => {
//     setEditingTrip(trip.id);
//     setEditForm({ ...trip });
//   };

//   const handleEditChange = (e) => {
//     setEditForm({ ...editForm, [e.target.name]: e.target.value });
//   };

//   const handleCancelEdit = () => {
//     setEditingTrip(null);
//     setEditForm({});
//   };

//   const handleUpdate = async (id) => {
//     try {
//       const tripRef = doc(db, "trips", id);
//       await updateDoc(tripRef, {
//         destination: editForm.destination,
//         startDate: editForm.startDate,
//         endDate: editForm.endDate,
//         interests: editForm.interests,
//         travelers: editForm.travelers,
//       });
//       setMessage("Trip updated successfully!");
//       setEditingTrip(null);
//       fetchSavedTrips();
//     } catch (err) {
//       console.error("Error updating trip:", err);
//       setMessage("Error updating trip.");
//     }
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm("Are you sure you want to delete this trip?")) return;
//     try {
//       await deleteDoc(doc(db, "trips", id));
//       setMessage("Trip deleted successfully!");
//       fetchSavedTrips();
//     } catch (err) {
//       console.error("Error deleting trip:", err);
//       setMessage("Error deleting trip.");
//     }
//   };

//   return (
//     <div className="planner-container">
//       <div className="container">
//         {/* Header */}
//         <div className="planner-header">
//           <h1 className="planner-title">Plan Your Next Adventure</h1>
//           <p className="planner-subtitle">
//             Create unforgettable memories with AI-powered trip planning
//           </p>
//         </div>

//         {/* Tabs */}
//         <div className="planner-tabs">
//           <ul className="planner-tab-list">
//             <li className="planner-tab-item">
//               <button
//                 className={`planner-tab-button ${activeTab === "plan" ? "active" : ""}`}
//                 onClick={() => setActiveTab("plan")}
//               >
//                 <i className="fas fa-plus-circle"></i>
//                 Plan New Trip
//               </button>
//             </li>
//             <li className="planner-tab-item">
//               <button
//                 className={`planner-tab-button ${activeTab === "saved" ? "active" : ""}`}
//                 onClick={() => {
//                   setActiveTab("saved");
//                   if (currentUser) fetchSavedTrips();
//                 }}
//               >
//                 <i className="fas fa-bookmark"></i>
//                 My Trips ({savedTrips.length})
//               </button>
//             </li>
//           </ul>
//         </div>

//         {/* Plan New Trip Section */}
//         {activeTab === "plan" && (
//           <div className="plan-trip-card">
//             <div className="plan-trip-header">
//               <h2 className="plan-trip-title">
//                 <i className="fas fa-compass"></i>
//                 Plan a New Adventure
//               </h2>
//             </div>
//             <div className="plan-trip-body">
//               <div className="planner-form-grid">
//                 {/* Destination */}
//                 <div className="form-group-full">
//                   <label className="planner-label">Destination</label>
//                   <input
//                     name="destination"
//                     type="text"
//                     value={form.destination}
//                     onChange={handleChange}
//                     className="planner-input"
//                     placeholder="Where do you want to go? e.g., Paris, Skardu, Japan..."
//                   />
//                 </div>

//                 {/* Dates */}
//                 <div className="planner-form-group">
//                   <label className="planner-label">Start Date</label>
//                   <input
//                     name="startDate"
//                     type="date"
//                     value={form.startDate}
//                     onChange={handleChange}
//                     className="planner-input"
//                   />
//                 </div>

//                 <div className="planner-form-group">
//                   <label className="planner-label">End Date</label>
//                   <input
//                     name="endDate"
//                     type="date"
//                     value={form.endDate}
//                     onChange={handleChange}
//                     className="planner-input"
//                   />
//                 </div>

//                 {/* Interests & Travelers */}
//                 <div className="planner-form-group">
//                   <label className="planner-label">Interests</label>
//                   <select
//                     name="interests"
//                     value={form.interests}
//                     onChange={handleChange}
//                     className="planner-input"
//                   >
//                     <option value="">Select your interests...</option>
//                     {interestOptions.map((interest, index) => (
//                       <option key={index} value={interest}>
//                         {interest}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 <div className="planner-form-group">
//                   <label className="planner-label">Travelers</label>
//                   <select
//                     name="travelers"
//                     value={form.travelers}
//                     onChange={handleChange}
//                     className="planner-input"
//                   >
//                     <option value="">Select number of travelers...</option>
//                     {travelerOptions.map((option, index) => (
//                       <option key={index} value={option}>
//                         {option}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//               </div>

//               {/* AI Button */}
//               <button
//                 onClick={handleGeneratePlan}
//                 className="planner-ai-button"
//                 disabled={
//                   !form.destination ||
//                   !form.startDate ||
//                   !form.endDate ||
//                   !form.interests ||
//                   !form.travelers
//                 }
//               >
//                 <i className="fas fa-magic"></i>
//                 Generate AI Travel Plan
//               </button>

//               {/* Optional Save Button */}
//               {currentUser && (
//                 <button
//                   onClick={handleSave}
//                   className="planner-save-button"
//                   disabled={loading || !form.destination}
//                   style={{
//                     marginTop: "15px",
//                     background: "#6b7280",
//                     width: "100%",
//                     padding: "12px",
//                     borderRadius: "8px",
//                     border: "none",
//                     color: "white",
//                     fontSize: "16px",
//                     cursor: loading || !form.destination ? "not-allowed" : "pointer",
//                     opacity: loading || !form.destination ? 0.7 : 1,
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "center",
//                     gap: "8px",
//                   }}
//                 >
//                   {loading ? (
//                     <>
//                       <span className="planner-loading"></span>
//                       Saving...
//                     </>
//                   ) : (
//                     <>
//                       <i className="fas fa-save"></i>
//                       Save Trip Details
//                     </>
//                   )}
//                 </button>
//               )}

//               {/* Message */}
//               {message && (
//                 <div
//                   className={`planner-message ${
//                     message.includes("Error")
//                       ? "message-error"
//                       : "message-success"
//                   }`}
//                 >
//                   {message}
//                 </div>
//               )}
//             </div>
//           </div>
//         )}

//         {/* Saved Trips Section */}
//         {activeTab === "saved" && (
//           <div className="saved-trips-section">
//             {loading ? (
//               <div style={{ textAlign: 'center', padding: '40px', color: '#a3c6ff' }}>
//                 <i className="fas fa-spinner fa-spin" style={{ fontSize: '30px', marginBottom: '15px' }}></i>
//                 <p>Loading your trips...</p>
//               </div>
//             ) : savedTrips.length > 0 ? (
//               <div className="saved-trips-grid" style={{
//                 display: 'grid',
//                 gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
//                 gap: '20px'
//               }}>
//                 {savedTrips.map((trip) => (
//                   <div
//                     key={trip.id}
//                     className="trip-card"
//                     style={{
//                       background: '#0f2740',
//                       borderRadius: '12px',
//                       padding: '20px',
//                       border: '1px solid #2a4a77',
//                       transition: 'all 0.3s ease',
//                       cursor: 'pointer'
//                     }}
//                     onClick={() => handleViewTrip(trip)}
//                     onMouseEnter={(e) => {
//                       e.currentTarget.style.transform = 'translateY(-5px)';
//                       e.currentTarget.style.borderColor = '#FFD700';
//                     }}
//                     onMouseLeave={(e) => {
//                       e.currentTarget.style.transform = 'translateY(0)';
//                       e.currentTarget.style.borderColor = '#2a4a77';
//                     }}
//                   >
//                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
//                       <h3 style={{ color: 'white', marginBottom: '10px', fontSize: '18px' }}>
//                         <i className="fas fa-map-marker-alt" style={{ color: '#FFD700', marginRight: '8px' }}></i>
//                         {trip.destination || trip.tripName || 'My Trip'}
//                       </h3>
//                       <button
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           handleDeleteTrip(trip.id);
//                         }}
//                         style={{
//                           background: 'none',
//                           border: 'none',
//                           color: '#ef4444',
//                           cursor: 'pointer',
//                           fontSize: '16px',
//                           padding: '5px'
//                         }}
//                       >
//                         <i className="fas fa-trash-alt"></i>
//                       </button>
//                     </div>
                    
//                     <p style={{ color: '#a3c6ff', marginBottom: '8px', fontSize: '14px' }}>
//                       <i className="fas fa-calendar" style={{ color: '#FFD700', marginRight: '8px', width: '16px' }}></i>
//                       {trip.startDate ? new Date(trip.startDate).toLocaleDateString() : 'Date not set'} → 
//                       {trip.endDate ? new Date(trip.endDate).toLocaleDateString() : 'Date not set'}
//                     </p>
                    
//                     <p style={{ color: '#a3c6ff', marginBottom: '8px', fontSize: '14px' }}>
//                       <i className="fas fa-users" style={{ color: '#FFD700', marginRight: '8px', width: '16px' }}></i>
//                       {trip.travelers || 'Not specified'}
//                     </p>
                    
//                     <p style={{ color: '#a3c6ff', marginBottom: '15px', fontSize: '14px' }}>
//                       <i className="fas fa-tag" style={{ color: '#FFD700', marginRight: '8px', width: '16px' }}></i>
//                       {trip.budgetLevel || trip.budget || 'Budget not specified'}
//                     </p>
                    
//                     <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
//                       <span style={{
//                         background: '#1e3a5f',
//                         color: '#FFD700',
//                         padding: '4px 10px',
//                         borderRadius: '15px',
//                         fontSize: '12px'
//                       }}>
//                         {trip.days?.length || 0} days
//                       </span>
//                       <span style={{
//                         background: '#1e3a5f',
//                         color: '#FFD700',
//                         padding: '4px 10px',
//                         borderRadius: '15px',
//                         fontSize: '12px'
//                       }}>
//                         {trip.hotels?.length || 0} hotels
//                       </span>
//                     </div>

//                     {trip.preferences && (
//                       <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '15px' }}>
//                         {trip.preferences.split(',').slice(0, 3).map((pref, idx) => (
//                           <span key={idx} style={{
//                             background: '#0a1929',
//                             color: '#a3c6ff',
//                             padding: '2px 8px',
//                             borderRadius: '12px',
//                             fontSize: '11px',
//                             border: '1px solid #1e3a5f'
//                           }}>
//                             {pref.trim()}
//                           </span>
//                         ))}
//                       </div>
//                     )}

//                     <button
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         handleViewTrip(trip);
//                       }}
//                       style={{
//                         width: '100%',
//                         marginTop: '10px',
//                         padding: '10px',
//                         background: '#1e3a5f',
//                         border: '1px solid #3b5f8c',
//                         color: 'white',
//                         borderRadius: '6px',
//                         cursor: 'pointer',
//                         display: 'flex',
//                         alignItems: 'center',
//                         justifyContent: 'center',
//                         gap: '8px',
//                         transition: 'all 0.3s ease'
//                       }}
//                       onMouseEnter={(e) => {
//                         e.currentTarget.style.background = '#2a4a77';
//                         e.currentTarget.style.borderColor = '#FFD700';
//                       }}
//                       onMouseLeave={(e) => {
//                         e.currentTarget.style.background = '#1e3a5f';
//                         e.currentTarget.style.borderColor = '#3b5f8c';
//                       }}
//                     >
//                       <i className="fas fa-eye" style={{ color: '#FFD700' }}></i>
//                       View Full Itinerary
//                     </button>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <div className="empty-state">
//                 <div className="empty-state-icon">
//                   <i className="fas fa-compass"></i>
//                 </div>
//                 <h3 className="empty-state-title">No Trips Planned Yet</h3>
//                 <p className="empty-state-text">
//                   Start planning your first adventure and let AI create the perfect itinerary for you.
//                 </p>
//                 <button
//                   className="empty-state-btn"
//                   onClick={() => setActiveTab("plan")}
//                 >
//                   Plan Your First Trip
//                 </button>
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }


import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  orderBy,
} from "firebase/firestore";
import "../CSS/Planner.css";

export default function Planner() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const saved = JSON.parse(localStorage.getItem("tripInput") || "{}");

  const [form, setForm] = useState({
    destination: saved.destination || "",
    startDate: "",
    endDate: "",
    interests: "",
    travelers: "",
    budget: saved.budget || "", // ✅ BUDGET ADDED
  });

  // --- Autocomplete State ---
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const suggestionRef = useRef(null);
  const inputRef = useRef(null);
  // -------------------------

  const [message, setMessage] = useState("");
  const [savedTrips, setSavedTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("plan");

  // Dropdown options
  const interestOptions = [
    "Adventure", "Relaxation", "Culture", "Beach", "Mountains",
    "City Tour", "History", "Nature", "Wildlife", "Sports", "Luxury",
  ];

  const travelerOptions = [
    "Solo Travel", "Couple (2 people)", "Family (3-4 people)",
    "Group (5-8 people)", "Large Group (9+ people)",
  ];

  // ✅ BUDGET OPTIONS ADDED
  const budgetOptions = [
    "💰 Budget (Under $500)",
    "💵 Economy ($500 - $1,000)",
    "💳 Standard ($1,000 - $2,000)",
    "💎 Premium ($2,000 - $4,000)",
    "👑 Luxury ($4,000+)",
  ];

  // --- Fetch Countries from REST Countries API ---
  const fetchCountries = async (query) => {
    try {
      const response = await fetch(
        `https://restcountries.com/v3.1/name/${query}?fields=name,flags`
      );
      if (!response.ok) return [];
      const data = await response.json();
      
      const filtered = data.filter(country => 
        country.name.common.toLowerCase().startsWith(query.toLowerCase())
      );
      
      return filtered.slice(0, 5).map((c) => ({
        name: c.name.common,
        type: "country",
        display: `🌍 ${c.name.common}`,
      }));
    } catch (error) {
      console.error("Error fetching countries:", error);
      return [];
    }
  };

  // --- Fetch Cities from OpenWeatherMap Geo API ---
  const fetchCities = async (query) => {
    if (!query || query.length < 2) return [];
    
    try {
      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=10&appid=bd5e378503939ddaee76f12ad7a97608`
      );
      
      if (!response.ok) {
        return await fetchCitiesFallback(query);
      }
      
      const data = await response.json();
      
      if (!data || data.length === 0) {
        return await fetchCitiesFallback(query);
      }
      
      return data.map((city) => ({
        name: city.name,
        country: city.country,
        state: city.state || "",
        type: "city",
        display: city.state 
          ? `🏙️ ${city.name}, ${city.state}, ${city.country}`
          : `🏙️ ${city.name}, ${city.country}`,
      }));
    } catch (error) {
      console.error("Error fetching cities:", error);
      return await fetchCitiesFallback(query);
    }
  };

  // --- Fallback city search ---
  const fetchCitiesFallback = async (query) => {
    try {
      const response = await fetch(
        `https://public.opendatasoft.com/api/records/1.0/search/?dataset=geonames-all-cities-with-a-population-1000&q=${encodeURIComponent(query)}&rows=8&sort=population`
      );
      
      if (!response.ok) return [];
      
      const data = await response.json();
      
      if (!data.records || data.records.length === 0) return [];
      
      return data.records.map((record) => {
        const fields = record.fields;
        return {
          name: fields.name,
          country: fields.country_name || fields.cou_name_en || "Unknown",
          type: "city",
          display: `🏙️ ${fields.name}, ${fields.country_name || fields.cou_name_en || "Unknown"}`,
        };
      });
    } catch (error) {
      console.error("Error in fallback city search:", error);
      return [];
    }
  };

  // --- Main search function ---
  const fetchSuggestions = async (query) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoadingSuggestions(true);

    try {
      const [cities, countries] = await Promise.all([
        fetchCities(query),
        fetchCountries(query),
      ]);
      
      const combined = [...cities, ...countries];
      
      const unique = combined.filter(
        (item, index, self) => index === self.findIndex((t) => t.name === item.name)
      );
      
      setSuggestions(unique);
      setShowSuggestions(unique.length > 0);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestions([]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  // --- Handle destination typing ---
  const handleDestinationChange = (e) => {
    const value = e.target.value;
    setForm({ ...form, destination: value });
    fetchSuggestions(value);
  };

  // --- Select a suggestion ---
  const selectSuggestion = (suggestion) => {
    setForm({ ...form, destination: suggestion.name });
    setSuggestions([]);
    setShowSuggestions(false);
  };

  // --- Click outside handler ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionRef.current &&
        !suggestionRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle AI Plan Generation
  const handleGeneratePlan = () => {
    const errors = [];

    if (!form.destination?.trim()) errors.push("Destination is required");
    if (!form.startDate) errors.push("Start date is required");
    if (!form.endDate) errors.push("End date is required");
    if (!form.interests) errors.push("Please select your interests");
    if (!form.travelers) errors.push("Please select number of travelers");
    if (!form.budget) errors.push("Please select your budget"); // ✅ BUDGET VALIDATION

    if (form.startDate && form.endDate) {
      const start = new Date(form.startDate);
      const end = new Date(form.endDate);
      if (end <= start) errors.push("End date must be after start date");
    }

    if (errors.length > 0) {
      setMessage(`Please fix the following: ${errors.join(", ")}`);
      return;
    }

    const tripData = {
      destination: form.destination.trim(),
      startDate: form.startDate,
      endDate: form.endDate,
      interests: form.interests,
      travelers: form.travelers,
      budget: form.budget, // ✅ BUDGET INCLUDED
    };

    localStorage.setItem("tripInput", JSON.stringify(tripData));
    navigate("/generate-plan", { state: tripData });
  };

  // Fetch saved trips from Firebase
  const fetchSavedTrips = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const q = query(
        collection(db, "savedTrips"),
        where("userId", "==", currentUser.uid),
        orderBy("savedAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      const trips = [];
      querySnapshot.forEach((docSnap) => {
        trips.push({ id: docSnap.id, ...docSnap.data() });
      });
      setSavedTrips(trips);
    } catch (err) {
      console.error("Error fetching saved trips:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewTrip = (trip) => {
    const tripPayload = {
      destination: trip.destination,
      startDate: trip.startDate,
      endDate: trip.endDate,
      travelers: trip.travelers,
      budget: trip.budgetLevel || trip.budget || "Mid-range",
      preferences: trip.preferences || trip.interests || "Travel",
      plan: {
        days: trip.days || [],
        hotels: trip.hotels || [],
        travelTips: trip.travelTips || [],
        budget: trip.budget || null,
      },
      isSavedTrip: true,
    };
    navigate("/generate-plan", { state: tripPayload });
  };

  const handleDeleteTrip = async (tripId) => {
    if (!window.confirm("Are you sure you want to delete this trip?")) return;
    try {
      await deleteDoc(doc(db, "savedTrips", tripId));
      setMessage("Trip deleted successfully!");
      fetchSavedTrips();
    } catch (err) {
      console.error("Error deleting trip:", err);
      setMessage("Error deleting trip.");
    }
  };

  useEffect(() => {
    if (currentUser && activeTab === "saved") {
      fetchSavedTrips();
    }
  }, [currentUser, activeTab]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (tab === "saved") setActiveTab("saved");
  }, []);

  const handleSave = async () => {
    if (!currentUser) {
      setMessage("Please login to save trips.");
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, "trips"), {
        uid: currentUser.uid,
        ...form,
        createdAt: serverTimestamp(),
      });
      setMessage("Trip saved successfully!");
      setForm({
        destination: "",
        startDate: "",
        endDate: "",
        interests: "",
        travelers: "",
        budget: "", // ✅ RESET BUDGET
      });
      localStorage.removeItem("tripInput");
    } catch (err) {
      setMessage("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="planner-container">
      <div className="container">
        <div className="planner-header">
          <h1 className="planner-title">Plan Your Next Adventure</h1>
          <p className="planner-subtitle">
            Create unforgettable memories with AI-powered trip planning
          </p>
        </div>

        <div className="planner-tabs">
          <ul className="planner-tab-list">
            <li className="planner-tab-item">
              <button
                className={`planner-tab-button ${activeTab === "plan" ? "active" : ""}`}
                onClick={() => setActiveTab("plan")}
              >
                <i className="fas fa-plus-circle"></i>
                Plan New Trip
              </button>
            </li>
            <li className="planner-tab-item">
              <button
                className={`planner-tab-button ${activeTab === "saved" ? "active" : ""}`}
                onClick={() => {
                  setActiveTab("saved");
                  if (currentUser) fetchSavedTrips();
                }}
              >
                <i className="fas fa-bookmark"></i>
                My Trips ({savedTrips.length})
              </button>
            </li>
          </ul>
        </div>

        {activeTab === "plan" && (
          <div className="plan-trip-card">
            <div className="plan-trip-header">
              <h2 className="plan-trip-title">
                <i className="fas fa-compass"></i>
                Plan a New Adventure
              </h2>
            </div>
            <div className="plan-trip-body">
              <div className="planner-form-grid">
                {/* Destination with Autocomplete */}
                <div className="form-group-full" style={{ position: "relative" }}>
                  <label className="planner-label">🌍 Destination</label>
                  <input
                    ref={inputRef}
                    name="destination"
                    type="text"
                    value={form.destination}
                    onChange={handleDestinationChange}
                    onFocus={() => {
                      if (form.destination && form.destination.length >= 2 && suggestions.length > 0) {
                        setShowSuggestions(true);
                      }
                    }}
                    className="planner-input"
                    placeholder="Search any city or country worldwide... e.g., Tokyo, Paris, New York, Lahore..."
                    autoComplete="off"
                  />

                  {isLoadingSuggestions && (
                    <div
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        right: 0,
                        background: "#1a2a3a",
                        border: "1px solid #3b5f8c",
                        borderRadius: "8px",
                        padding: "10px",
                        color: "#a3c6ff",
                        textAlign: "center",
                        zIndex: 1000,
                        marginTop: "4px",
                      }}
                    >
                      <i className="fas fa-spinner fa-spin"></i> Searching worldwide...
                    </div>
                  )}

                  {!isLoadingSuggestions && showSuggestions && suggestions.length > 0 && (
                    <div
                      ref={suggestionRef}
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        right: 0,
                        background: "#1a2a3a",
                        border: "1px solid #3b5f8c",
                        borderRadius: "8px",
                        maxHeight: "300px",
                        overflowY: "auto",
                        zIndex: 1000,
                        marginTop: "4px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                      }}
                    >
                      {suggestions.map((suggestion, idx) => (
                        <div
                          key={idx}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            selectSuggestion(suggestion);
                          }}
                          style={{
                            padding: "12px 15px",
                            cursor: "pointer",
                            color: "white",
                            borderBottom: "1px solid #2a4a77",
                            transition: "background 0.2s",
                            fontSize: "14px",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "#2a4a77";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                          }}
                        >
                          {suggestion.display}
                        </div>
                      ))}
                    </div>
                  )}

                  <small
                    style={{
                      display: "block",
                      marginTop: "5px",
                      color: "#6c8fb3",
                      fontSize: "12px",
                    }}
                  >
                    💡 Search any city 🏙️ or country 🌍 worldwide
                  </small>
                </div>

                {/* Dates */}
                <div className="planner-form-group">
                  <label className="planner-label">📅 Start Date</label>
                  <input
                    name="startDate"
                    type="date"
                    value={form.startDate}
                    onChange={handleChange}
                    className="planner-input"
                  />
                </div>

                <div className="planner-form-group">
                  <label className="planner-label">📅 End Date</label>
                  <input
                    name="endDate"
                    type="date"
                    value={form.endDate}
                    onChange={handleChange}
                    className="planner-input"
                  />
                </div>

                {/* Interests */}
                <div className="planner-form-group">
                  <label className="planner-label">🎯 Interests</label>
                  <select
                    name="interests"
                    value={form.interests}
                    onChange={handleChange}
                    className="planner-input"
                  >
                    <option value="">Select your interests...</option>
                    {interestOptions.map((interest, index) => (
                      <option key={index} value={interest}>
                        {interest}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Travelers */}
                <div className="planner-form-group">
                  <label className="planner-label">👥 Travelers</label>
                  <select
                    name="travelers"
                    value={form.travelers}
                    onChange={handleChange}
                    className="planner-input"
                  >
                    <option value="">Select number of travelers...</option>
                    {travelerOptions.map((option, index) => (
                      <option key={index} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                {/* ✅ BUDGET FIELD ADDED */}
                <div className="planner-form-group">
                  <label className="planner-label">💰 Budget Level</label>
                  <select
                    name="budget"
                    value={form.budget}
                    onChange={handleChange}
                    className="planner-input"
                  >
                    <option value="">Select your budget...</option>
                    {budgetOptions.map((option, index) => (
                      <option key={index} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* AI Button */}
              <button
                onClick={handleGeneratePlan}
                className="planner-ai-button"
                disabled={
                  !form.destination ||
                  !form.startDate ||
                  !form.endDate ||
                  !form.interests ||
                  !form.travelers ||
                  !form.budget // ✅ BUDGET REQUIRED
                }
              >
                <i className="fas fa-magic"></i>
                Generate AI Travel Plan
              </button>

              {/* Optional Save Button */}
              {currentUser && (
                <button
                  onClick={handleSave}
                  className="planner-save-button"
                  disabled={loading || !form.destination}
                  style={{
                    marginTop: "15px",
                    background: "#6b7280",
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "none",
                    color: "white",
                    fontSize: "16px",
                    cursor: loading || !form.destination ? "not-allowed" : "pointer",
                    opacity: loading || !form.destination ? 0.7 : 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                >
                  {loading ? (
                    <>
                      <span className="planner-loading"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save"></i>
                      Save Trip Details
                    </>
                  )}
                </button>
              )}

              {/* Message */}
              {message && (
                <div
                  className={`planner-message ${
                    message.includes("Error") ? "message-error" : "message-success"
                  }`}
                >
                  {message}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "saved" && (
          <div className="saved-trips-section">
            {loading ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#a3c6ff" }}>
                <i className="fas fa-spinner fa-spin" style={{ fontSize: "30px", marginBottom: "15px" }}></i>
                <p>Loading your trips...</p>
              </div>
            ) : savedTrips.length > 0 ? (
              <div
                className="saved-trips-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                  gap: "20px",
                }}
              >
                {savedTrips.map((trip) => (
                  <div
                    key={trip.id}
                    className="trip-card"
                    style={{
                      background: "#0f2740",
                      borderRadius: "12px",
                      padding: "20px",
                      border: "1px solid #2a4a77",
                      transition: "all 0.3s ease",
                      cursor: "pointer",
                    }}
                    onClick={() => handleViewTrip(trip)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-5px)";
                      e.currentTarget.style.borderColor = "#FFD700";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.borderColor = "#2a4a77";
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <h3 style={{ color: "white", marginBottom: "10px", fontSize: "18px" }}>
                        <i className="fas fa-map-marker-alt" style={{ color: "#FFD700", marginRight: "8px" }}></i>
                        {trip.destination || trip.tripName || "My Trip"}
                      </h3>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTrip(trip.id);
                        }}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#ef4444",
                          cursor: "pointer",
                          fontSize: "16px",
                          padding: "5px",
                        }}
                      >
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </div>

                    <p style={{ color: "#a3c6ff", marginBottom: "8px", fontSize: "14px" }}>
                      <i className="fas fa-calendar" style={{ color: "#FFD700", marginRight: "8px", width: "16px" }}></i>
                      {trip.startDate ? new Date(trip.startDate).toLocaleDateString() : "Date not set"} →{" "}
                      {trip.endDate ? new Date(trip.endDate).toLocaleDateString() : "Date not set"}
                    </p>

                    <p style={{ color: "#a3c6ff", marginBottom: "8px", fontSize: "14px" }}>
                      <i className="fas fa-users" style={{ color: "#FFD700", marginRight: "8px", width: "16px" }}></i>
                      {trip.travelers || "Not specified"}
                    </p>

                    <p style={{ color: "#a3c6ff", marginBottom: "15px", fontSize: "14px" }}>
                      <i className="fas fa-tag" style={{ color: "#FFD700", marginRight: "8px", width: "16px" }}></i>
                      {trip.budgetLevel || trip.budget || "Budget not specified"}
                    </p>

                    <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
                      <span
                        style={{
                          background: "#1e3a5f",
                          color: "#FFD700",
                          padding: "4px 10px",
                          borderRadius: "15px",
                          fontSize: "12px",
                        }}
                      >
                        {trip.days?.length || 0} days
                      </span>
                      <span
                        style={{
                          background: "#1e3a5f",
                          color: "#FFD700",
                          padding: "4px 10px",
                          borderRadius: "15px",
                          fontSize: "12px",
                        }}
                      >
                        {trip.hotels?.length || 0} hotels
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewTrip(trip);
                      }}
                      style={{
                        width: "100%",
                        marginTop: "10px",
                        padding: "10px",
                        background: "#1e3a5f",
                        border: "1px solid #3b5f8c",
                        color: "white",
                        borderRadius: "6px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        transition: "all 0.3s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#2a4a77";
                        e.currentTarget.style.borderColor = "#FFD700";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "#1e3a5f";
                        e.currentTarget.style.borderColor = "#3b5f8c";
                      }}
                    >
                      <i className="fas fa-eye" style={{ color: "#FFD700" }}></i>
                      View Full Itinerary
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <i className="fas fa-compass"></i>
                </div>
                <h3 className="empty-state-title">No Trips Planned Yet</h3>
                <p className="empty-state-text">
                  Start planning your first adventure and let AI create the perfect itinerary for you.
                </p>
                <button className="empty-state-btn" onClick={() => setActiveTab("plan")}>
                  Plan Your First Trip
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}