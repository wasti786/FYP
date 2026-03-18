// import React, { useEffect, useState } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import "../CSS/generatePlan.css";
// import TripMap from "../components/TripMap";

// const fallbackSVG =
//   "data:image/svg+xml;utf8," +
//   encodeURIComponent(`
//     <svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
//       <rect width="400" height="300" fill="#f1f5f9"/>
//       <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
//             font-family="Arial" font-size="20" fill="#94a3b8">
//         No Image
//       </text>
//     </svg>
//   `);

// export default function GeneratePlan() {
//   const navigate = useNavigate();
//   const location = useLocation();

//   // Payload from Planner page or fallback
//   const [payload] = useState(
//     location.state || {
//       destination: "Gilgit Baltistan",
//       startDate: "2026-01-29",
//       endDate: "2026-01-31",
//       travelers: "Couple (2 people)",
//       budget: "Mid-range",
//       preferences: "Wildlife, nature, sightseeing",
//     },
//   );

//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [plan, setPlan] = useState(null);
//   const [activeDay, setActiveDay] = useState(0);
//   const [toast, setToast] = useState("");
//   const [selectedMapActivity, setSelectedMapActivity] = useState(null);

//   // ---------- Fetch AI Plan ----------
//   useEffect(() => {
//     generatePlan();
//   }, []);

//   const generatePlan = async () => {
//     try {
//       setLoading(true);
//       setError("");

//       const res = await fetch("http://localhost:5000/api/generate-plan", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });

//       if (!res.ok) {
//         throw new Error(`Server error: ${res.status}`);
//       }

//       const data = await res.json();
//       console.log("AI Response:", data);

//       if (!data.success) {
//         throw new Error(data.error || "AI generation failed");
//       }

//       if (!data.plan?.days?.length) {
//         throw new Error("No itinerary returned from AI");
//       }

//       setPlan(data.plan);
//       setActiveDay(0);
//     } catch (err) {
//       console.error("Generate Plan Error:", err);
//       setError(
//         err.message || "Failed to generate itinerary. Please try again.",
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ---------- Helpers ----------
//   const itineraryDays = plan?.days || [];
//   const hotels = plan?.hotels || [];
//   const budget = plan?.budget || payload.budget;
//   const travelTips = plan?.travelTips || [];

//   const formatDate = (dateString) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString("en-US", {
//       weekday: "short",
//       month: "short",
//       day: "numeric",
//       year: "numeric",
//     });
//   };

//   const calculateDuration = () => {
//     const start = new Date(payload.startDate);
//     const end = new Date(payload.endDate);
//     const diffTime = Math.abs(end - start);
//     return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
//   };

//   const showToast = (msg) => {
//     setToast(msg);
//     setTimeout(() => setToast(""), 3000);
//   };

//   // ---------- Handlers ----------
//   const handleBack = () => navigate("/planner");
//   const handleRetry = () => generatePlan();
//   const handleSave = () => showToast("✅ Itinerary saved to your trips!");
//   const handleShare = () => {
//     navigator.clipboard.writeText(window.location.href);
//     showToast("🔗 Link copied to clipboard!");
//   };

//   // ---------- LOADING ----------
//   if (loading) {
//     return (
//       <div className="generate-plan-container" style={{ paddingTop: "94px" }}>
//         <div className="loading-screen">
//           <div className="ai-loading">
//             <div className="ai-brain-container">
//               <div className="ai-brain">
//                 <div className="brain-pulse"></div>
//                 <div className="brain-glow"></div>
//                 <i className="fas fa-brain"></i>
//               </div>
//             </div>
//             <div className="ai-loading-text">
//               <h2>🤖 Crafting Your Perfect Journey</h2>
//               <p className="loading-subtitle">
//                 Analyzing {payload.destination} for {payload.travelers}{" "}
//                 interested in {payload.preferences}
//               </p>
//             </div>
//             <div className="loading-progress">
//               <div className="progress-bar">
//                 <div className="progress-fill"></div>
//               </div>
//               <div className="loading-steps">
//                 <div className="loading-step active">
//                   <div className="step-icon">📍</div>
//                   <span className="step-text">Researching Destinations</span>
//                 </div>
//                 <div className="loading-step">
//                   <div className="step-icon">🏨</div>
//                   <span className="step-text">Finding Accommodations</span>
//                 </div>
//                 <div className="loading-step">
//                   <div className="step-icon">🍽️</div>
//                   <span className="step-text">Selecting Dining Options</span>
//                 </div>
//                 <div className="loading-step">
//                   <div className="step-icon">📅</div>
//                   <span className="step-text">Optimizing Itinerary</span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // ---------- ERROR ----------
//   if (error && !plan) {
//     return (
//       <div className="generate-plan-container">
//         <div className="error-state">
//           <div className="error-icon-container">
//             <div className="error-glow"></div>
//             <i className="fas fa-exclamation-triangle"></i>
//           </div>
//           <h2 className="error-title">Oops! Something went wrong</h2>
//           <p className="error-message">{error}</p>
//           <div className="error-buttons">
//             <button
//               onClick={handleRetry}
//               disabled={loading}
//               className="retry-btn"
//             >
//               <div className="btn-icon">
//                 <i className="fas fa-redo"></i>
//               </div>
//               <span className="btn-text">Try Again</span>
//             </button>
//             <button onClick={handleBack} className="back-btn">
//               <div className="btn-icon">
//                 <i className="fas fa-arrow-left"></i>
//               </div>
//               <span className="btn-text">Back to Planner</span>
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // ---------- MAIN UI ----------
//   return (
//     <div className="generate-plan-container" style={{ 
//       paddingTop: "74px",
//       background: "linear-gradient(135deg, #0B1E33 0%, #1a2f45 100%)",
//       minHeight: "100vh"
//     }}>
//       {/* Toast Notification - Enhanced with navy blue */}
//       {toast && (
//         <div className="toast-notification" style={{
//           position: 'fixed',
//           top: '20px',
//           right: '20px',
//           background: '#1e3a5f',
//           color: 'white',
//           padding: '12px 24px',
//           borderRadius: '50px',
//           boxShadow: '0 4px 20px rgba(0,20,40,0.3)',
//           zIndex: 9999,
//           animation: 'slideIn 0.3s ease',
//           border: '1px solid #3b5f8c'
//         }}>
//           <div className="toast-content" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
//             <i className="fas fa-check-circle" style={{ color: '#4CAF50' }}></i>
//             <span>{toast}</span>
//           </div>
//           <div className="toast-progress" style={{
//             position: 'absolute',
//             bottom: '0',
//             left: '0',
//             height: '3px',
//             background: 'linear-gradient(90deg, #4CAF50, #81c784)',
//             animation: 'progress 3s linear'
//           }}></div>
//         </div>
//       )}

//       {/* Floating Action Button - Navy blue theme */}
//       <button 
//         className="floating-action-btn" 
//         onClick={handleSave}
//         style={{
//           position: 'fixed',
//           bottom: '30px',
//           right: '30px',
//           width: '60px',
//           height: '60px',
//           borderRadius: '30px',
//           background: '#1e3a5f',
//           border: '2px solid #3b5f8c',
//           color: 'white',
//           cursor: 'pointer',
//           boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
//           transition: 'all 0.3s ease',
//           zIndex: 999
//         }}
//         onMouseEnter={(e) => {
//           e.currentTarget.style.transform = 'scale(1.1)';
//           e.currentTarget.style.background = '#2a4a77';
//         }}
//         onMouseLeave={(e) => {
//           e.currentTarget.style.transform = 'scale(1)';
//           e.currentTarget.style.background = '#1e3a5f';
//         }}
//       >
//         <i className="fas fa-bookmark"></i>
//         <span className="fab-tooltip" style={{
//           position: 'absolute',
//           right: '70px',
//           top: '50%',
//           transform: 'translateY(-50%)',
//           background: '#1e3a5f',
//           color: 'white',
//           padding: '5px 10px',
//           borderRadius: '5px',
//           fontSize: '14px',
//           whiteSpace: 'nowrap',
//           border: '1px solid #3b5f8c',
//           display: 'none'
//         }}>Save Itinerary</span>
//       </button>

//       {/* HEADER - Enhanced with navy blue gradient */}
//       <div className="plan-header" style={{
//         background: 'linear-gradient(135deg, #0a1929 0%, #0f2740 100%)',
//         color: 'white',
//         padding: '40px 20px',
//         marginBottom: '20px',
//         borderBottom: '3px solid #2a4a77'
//       }}>
//         <div className="header-background">
//           <div className="header-gradient"></div>
//           <div className="header-map-effect"></div>
//         </div>
//         <div className="header-content-wrapper" style={{ maxWidth: '1400px', margin: '0 auto' }}>
//           <button 
//             onClick={handleBack} 
//             className="back-to-planner"
//             style={{
//               background: 'rgba(255,255,255,0.1)',
//               border: '1px solid #3b5f8c',
//               color: 'white',
//               padding: '8px 16px',
//               borderRadius: '8px',
//               cursor: 'pointer',
//               marginBottom: '20px'
//             }}
//           >
//             <div className="back-icon" style={{ display: 'inline-block', marginRight: '8px' }}>
//               <i className="fas fa-arrow-left"></i>
//             </div>
//             <span className="back-text">Back to Planner</span>
//           </button>

//           <div className="header-main">
//             <div className="destination-badge" style={{ marginBottom: '15px' }}>
//               <i className="fas fa-map-marker-alt badge-icon" style={{ color: '#FFD700', marginRight: '8px' }}></i>
//               <span className="badge-text" style={{ color: '#a3c6ff' }}>Your Journey to</span>
//             </div>
//             <h1 className="destination-title" style={{ 
//               fontSize: '48px', 
//               marginBottom: '15px',
//               textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
//             }}>
//               {payload.destination}
//             </h1>
//             <div className="header-meta" style={{ display: 'flex', gap: '30px' }}>
//               <div className="meta-item">
//                 <i className="fas fa-calendar-alt" style={{ color: '#FFD700', marginRight: '8px' }}></i>
//                 <span>
//                   {formatDate(payload.startDate)} → {formatDate(payload.endDate)}
//                 </span>
//               </div>
//               <div className="meta-item">
//                 <i className="fas fa-users" style={{ color: '#FFD700', marginRight: '8px' }}></i>
//                 <span>{payload.travelers}</span>
//               </div>
//               <div className="meta-item">
//                 <i className="fas fa-tag" style={{ color: '#FFD700', marginRight: '8px' }}></i>
//                 <span>{budget} Budget</span>
//               </div>
//             </div>
//           </div>

//           <div className="header-actions" style={{ marginTop: '20px' }}>
//             <div className="action-buttons-header" style={{ display: 'flex', gap: '10px' }}>
//               <button 
//                 className="action-btn-header share" 
//                 onClick={handleShare}
//                 style={{
//                   background: 'rgba(255,255,255,0.1)',
//                   border: '1px solid #3b5f8c',
//                   color: 'white',
//                   padding: '10px 20px',
//                   borderRadius: '8px',
//                   cursor: 'pointer'
//                 }}
//               >
//                 <i className="fas fa-share-alt" style={{ marginRight: '8px' }}></i>
//                 <span>Share</span>
//               </button>
//               <button
//                 className="action-btn-header print"
//                 onClick={() => window.print()}
//                 style={{
//                   background: 'rgba(255,255,255,0.1)',
//                   border: '1px solid #3b5f8c',
//                   color: 'white',
//                   padding: '10px 20px',
//                   borderRadius: '8px',
//                   cursor: 'pointer'
//                 }}
//               >
//                 <i className="fas fa-print" style={{ marginRight: '8px' }}></i>
//                 <span>Print</span>
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* TRIP STATS - Navy blue cards */}
//       <div className="trip-stats-container" style={{ maxWidth: '1400px', margin: '0 auto 30px', padding: '0 20px' }}>
//         <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
//           {[
//             { icon: 'clock', label: 'Trip Duration', value: `${calculateDuration()} Days` },
//             { icon: 'hiking', label: 'Activities', value: `${itineraryDays.length * 3}+` },
//             { icon: 'bed', label: 'Hotels', value: hotels.length },
//             { icon: 'lightbulb', label: 'AI Generated', value: '100% Custom' }
//           ].map((stat, idx) => (
//             <div key={idx} className="stat-card" style={{
//               background: '#0f2740',
//               borderRadius: '12px',
//               padding: '20px',
//               border: '1px solid #2a4a77',
//               boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
//             }}>
//               <div className="stat-icon-wrapper" style={{
//                 width: '50px',
//                 height: '50px',
//                 background: '#1e3a5f',
//                 borderRadius: '25px',
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 marginBottom: '15px'
//               }}>
//                 <i className={`fas fa-${stat.icon}`} style={{ color: '#FFD700', fontSize: '24px' }}></i>
//               </div>
//               <div className="stat-content">
//                 <h3 className="stat-label" style={{ color: '#a3c6ff', marginBottom: '5px' }}>{stat.label}</h3>
//                 <p className="stat-value" style={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}>{stat.value}</p>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* MAIN CONTENT */}
//       <div
//         className="content-grid with-map"
//         style={{ 
//           display: "flex", 
//           gap: "30px", 
//           alignItems: "flex-start",
//           maxWidth: '1400px',
//           margin: '0 auto',
//           padding: '0 20px'
//         }}
//       >
//         {/* LEFT SIDE - ITINERARY */}
//         <div className="content-left" style={{ flex: 2, minWidth: "50%" }}>
//           {/* DAY NAVIGATION */}
//           <div className="day-navigation-card" style={{
//             background: '#0f2740',
//             borderRadius: '12px',
//             padding: '20px',
//             marginBottom: '20px',
//             border: '1px solid #2a4a77'
//           }}>
//             <div className="day-nav-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
//               <h2 style={{ color: 'white' }}>
//                 <i className="fas fa-calendar-alt" style={{ color: '#FFD700', marginRight: '10px' }}></i> Daily Itinerary
//               </h2>
//               <div className="duration-badge" style={{
//                 background: '#1e3a5f',
//                 color: '#FFD700',
//                 padding: '5px 15px',
//                 borderRadius: '20px',
//                 border: '1px solid #3b5f8c'
//               }}>{calculateDuration()} Days</div>
//             </div>

//             <div className="day-tabs" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
//               {itineraryDays.map((day, idx) => (
//                 <button
//                   key={idx}
//                   className={`day-tab ${activeDay === idx ? "active" : ""}`}
//                   onClick={() => setActiveDay(idx)}
//                   style={{
//                     flex: '1',
//                     minWidth: '100px',
//                     padding: '12px',
//                     background: activeDay === idx ? '#1e3a5f' : '#0a1929',
//                     border: activeDay === idx ? '2px solid #FFD700' : '1px solid #2a4a77',
//                     borderRadius: '8px',
//                     color: 'white',
//                     cursor: 'pointer',
//                     transition: 'all 0.3s ease'
//                   }}
//                 >
//                   <div className="day-tab-content">
//                     <div className="day-number" style={{ fontWeight: 'bold' }}>Day {day.day || idx + 1}</div>
//                     <div className="day-status" style={{ fontSize: '12px', marginTop: '5px' }}>
//                       {idx === 0 && (
//                         <span style={{ color: '#4CAF50' }}>🚀 Arrival</span>
//                       )}
//                       {idx === itineraryDays.length - 1 && (
//                         <span style={{ color: '#ff6b6b' }}>🏁 Departure</span>
//                       )}
//                       {idx > 0 && idx < itineraryDays.length - 1 && (
//                         <span style={{ color: '#FFD700' }}>🗺️ Explore</span>
//                       )}
//                     </div>
//                   </div>
//                 </button>
//               ))}
//             </div>
//           </div>

//           {/* ACTIVITY PLACES */}
//           <div className="timeline-card" style={{
//             background: '#0f2740',
//             borderRadius: '12px',
//             padding: '20px',
//             border: '1px solid #2a4a77'
//           }}>
//             <div className="timeline-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
//               <h2 style={{ color: 'white' }}>
//                 Day {itineraryDays[activeDay]?.day || activeDay + 1} – Places to Visit
//               </h2>
//               <div className="timeline-date" style={{ color: '#a3c6ff' }}>
//                 {formatDate(
//                   new Date(payload.startDate).getTime() + activeDay * 86400000,
//                 )}
//               </div>
//             </div>

//             {/* Place cards */}
//             <div className="places-container" style={{ display: 'grid', gap: '20px' }}>
//               {itineraryDays[activeDay]?.places?.map((place, idx) => (
//                 <div key={idx} className="place-card" style={{
//                   background: '#0a1929',
//                   borderRadius: '12px',
//                   overflow: 'hidden',
//                   border: '1px solid #2a4a77',
//                   display: 'flex'
//                 }}>
//                   <div className="place-image" style={{ width: '200px', height: '150px' }}>
//                     <img
//                       src={`https://source.unsplash.com/400x300/?${encodeURIComponent(
//                         (place.imageQuery || place.name).replace(/\s+/g, ","),
//                       )}`}
//                       alt={place.name}
//                       style={{ width: '100%', height: '100%', objectFit: 'cover' }}
//                       loading="lazy"
//                       onError={(e) => {
//                         e.currentTarget.onerror = null;
//                         e.currentTarget.src = fallbackSVG;
//                       }}
//                     />
//                   </div>
//                   <div className="place-content" style={{ padding: '15px', flex: 1 }}>
//                     <h3 className="place-name" style={{ color: 'white', marginBottom: '10px' }}>{place.name}</h3>
//                     <p className="place-description" style={{ color: '#a3c6ff', marginBottom: '15px' }}>
//                       {place.description || "A must-visit location."}
//                     </p>
//                     <div className="place-actions">
//                       <button
//                         className="map-btn"
//                         onClick={() => {
//                           // Enhanced data for map component
//                           setSelectedMapActivity({
//                             ...place,
//                             lat: place.lat,
//                             lng: place.lng,
//                             destination: payload.destination,
//                             selectedAt: Date.now(),
//                           });

//                           // Auto-switch to correct day
//                           const dayIndex = itineraryDays.findIndex((day) =>
//                             day.places?.some((p) => p.name === place.name),
//                           );
//                           if (dayIndex !== -1 && dayIndex !== activeDay) {
//                             setActiveDay(dayIndex);
//                             showToast(`📅 Switched to Day ${dayIndex + 1} for ${place.name}`);
//                           }
//                         }}
//                         style={{
//                           background: '#1e3a5f',
//                           border: '1px solid #3b5f8c',
//                           color: 'white',
//                           padding: '8px 16px',
//                           borderRadius: '6px',
//                           cursor: 'pointer',
//                           display: 'inline-flex',
//                           alignItems: 'center',
//                           gap: '8px'
//                         }}
//                       >
//                         <i className="fas fa-map-marker-alt" style={{ color: '#FFD700' }}></i> View on Map
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             {/* DAY TIPS */}
//             {itineraryDays[activeDay]?.tips && (
//               <div className="day-tips-card" style={{
//                 marginTop: '20px',
//                 padding: '15px',
//                 background: '#1e3a5f',
//                 borderRadius: '8px',
//                 border: '1px solid #3b5f8c'
//               }}>
//                 <div className="tips-header" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
//                   <div className="tips-icon">
//                     <i className="fas fa-lightbulb" style={{ color: '#FFD700' }}></i>
//                   </div>
//                   <h3 style={{ color: 'white' }}>Travel Tips for Today</h3>
//                 </div>
//                 <p className="tips-content" style={{ color: '#a3c6ff' }}>{itineraryDays[activeDay].tips}</p>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* RIGHT SIDE - MAP + SIDEBAR */}
//         <div
//           className="content-right"
//           style={{
//             flex: 1,
//             minWidth: "40%",
//             display: "flex",
//             flexDirection: "column",
//             gap: "20px",
//           }}
//         >
//           {/* MAP */}
//           <div style={{ height: "600px", width: "100%" }}>
//             <TripMap
//               destination={payload.destination}
//               itineraryDays={itineraryDays}
//               activeDay={activeDay}
//               selectedActivity={selectedMapActivity}
//               onActivitySelect={setSelectedMapActivity}
//             />
//           </div>

//           {/* HOTELS SECTION */}
//           {hotels.length > 0 && (
//             <div className="sidebar-card hotels-section" style={{
//               background: '#0f2740',
//               borderRadius: '12px',
//               padding: '20px',
//               border: '1px solid #2a4a77'
//             }}>
//               <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
//                 <div className="header-icon" style={{
//                   width: '40px',
//                   height: '40px',
//                   background: '#1e3a5f',
//                   borderRadius: '20px',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center'
//                 }}>
//                   <i className="fas fa-bed" style={{ color: '#FFD700' }}></i>
//                 </div>
//                 <div className="header-content">
//                   <h3 style={{ color: 'white', marginBottom: '5px' }}>Recommended Stays</h3>
//                   <p className="card-subtitle" style={{ color: '#a3c6ff' }}>
//                     Carefully selected for {payload.travelers}
//                   </p>
//                 </div>
//               </div>
//               <div className="hotels-list" style={{ display: 'grid', gap: '15px' }}>
//                 {hotels.map((hotel, idx) => (
//                   <div key={idx} className="hotel-item" style={{
//                     background: '#0a1929',
//                     borderRadius: '8px',
//                     padding: '15px',
//                     border: '1px solid #2a4a77'
//                   }}>
//                     <div className="hotel-details">
//                       <h4 className="hotel-name" style={{ color: 'white', marginBottom: '10px' }}>{hotel.name}</h4>
//                       <div className="hotel-info" style={{ display: 'flex', gap: '15px', marginBottom: '10px' }}>
//                         <span className="hotel-price" style={{ color: '#FFD700' }}>{hotel.price}</span>
//                         <span className="hotel-type" style={{ color: '#a3c6ff' }}>4-star Hotel</span>
//                       </div>
//                       <div className="hotel-features" style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
//                         <span className="feature-tag" style={{ color: '#a3c6ff', fontSize: '12px' }}>
//                           <i className="fas fa-wifi" style={{ marginRight: '5px' }}></i> WiFi
//                         </span>
//                         <span className="feature-tag" style={{ color: '#a3c6ff', fontSize: '12px' }}>
//                           <i className="fas fa-swimming-pool" style={{ marginRight: '5px' }}></i> Pool
//                         </span>
//                         <span className="feature-tag" style={{ color: '#a3c6ff', fontSize: '12px' }}>
//                           <i className="fas fa-utensils" style={{ marginRight: '5px' }}></i> Breakfast
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* TRAVEL TIPS */}
//           {travelTips.length > 0 && (
//             <div className="sidebar-card tips-section" style={{
//               background: '#0f2740',
//               borderRadius: '12px',
//               padding: '20px',
//               border: '1px solid #2a4a77'
//             }}>
//               <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
//                 <div className="header-icon" style={{
//                   width: '40px',
//                   height: '40px',
//                   background: '#1e3a5f',
//                   borderRadius: '20px',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center'
//                 }}>
//                   <i className="fas fa-compass" style={{ color: '#FFD700' }}></i>
//                 </div>
//                 <div className="header-content">
//                   <h3 style={{ color: 'white', marginBottom: '5px' }}>Essential Tips</h3>
//                   <p className="card-subtitle" style={{ color: '#a3c6ff' }}>For a smooth journey</p>
//                 </div>
//               </div>
//               <div className="tips-list" style={{ display: 'grid', gap: '15px' }}>
//                 {travelTips.map((tip, idx) => (
//                   <div key={idx} className="tip-item" style={{ display: 'flex', gap: '15px' }}>
//                     <div className="tip-number" style={{
//                       width: '24px',
//                       height: '24px',
//                       background: '#1e3a5f',
//                       borderRadius: '12px',
//                       display: 'flex',
//                       alignItems: 'center',
//                       justifyContent: 'center',
//                       color: '#FFD700',
//                       fontSize: '12px'
//                     }}>{idx + 1}</div>
//                     <div className="tip-content" style={{ color: '#a3c6ff', flex: 1 }}>{tip}</div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* PACKING LIST */}
//           <div className="sidebar-card packing-section" style={{
//             background: '#0f2740',
//             borderRadius: '12px',
//             padding: '20px',
//             border: '1px solid #2a4a77'
//           }}>
//             <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
//               <div className="header-icon" style={{
//                 width: '40px',
//                 height: '40px',
//                 background: '#1e3a5f',
//                 borderRadius: '20px',
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center'
//               }}>
//                 <i className="fas fa-suitcase-rolling" style={{ color: '#FFD700' }}></i>
//               </div>
//               <div className="header-content">
//                 <h3 style={{ color: 'white', marginBottom: '5px' }}>Packing Essentials</h3>
//                 <p className="card-subtitle" style={{ color: '#a3c6ff' }}>For {payload.preferences}</p>
//               </div>
//             </div>
//             <div className="packing-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
//               <div className="packing-category">
//                 <h4 className="category-title" style={{ color: '#FFD700', marginBottom: '10px' }}>Clothing</h4>
//                 <div className="category-items" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
//                   <span className="packing-item" style={{ color: '#a3c6ff' }}>✓ Comfortable shoes</span>
//                   <span className="packing-item" style={{ color: '#a3c6ff' }}>✓ Weather layers</span>
//                   <span className="packing-item" style={{ color: '#a3c6ff' }}>✓ Swimwear</span>
//                 </div>
//               </div>
//               <div className="packing-category">
//                 <h4 className="category-title" style={{ color: '#FFD700', marginBottom: '10px' }}>Essentials</h4>
//                 <div className="category-items" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
//                   <span className="packing-item" style={{ color: '#a3c6ff' }}>✓ Travel adapter</span>
//                   <span className="packing-item" style={{ color: '#a3c6ff' }}>✓ Power bank</span>
//                   <span className="packing-item" style={{ color: '#a3c6ff' }}>✓ First aid kit</span>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* QUICK ACTIONS */}
//           <div className="sidebar-card actions-section" style={{
//             background: '#0f2740',
//             borderRadius: '12px',
//             padding: '20px',
//             border: '1px solid #2a4a77'
//           }}>
//             <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
//               <div className="header-icon" style={{
//                 width: '40px',
//                 height: '40px',
//                 background: '#1e3a5f',
//                 borderRadius: '20px',
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center'
//               }}>
//                 <i className="fas fa-bolt" style={{ color: '#FFD700' }}></i>
//               </div>
//               <h3 style={{ color: 'white' }}>Quick Actions</h3>
//             </div>
//             <div className="action-buttons-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
//               <button 
//                 className="action-btn-card save" 
//                 onClick={handleSave}
//                 style={{
//                   background: '#1e3a5f',
//                   border: '1px solid #3b5f8c',
//                   color: 'white',
//                   padding: '12px',
//                   borderRadius: '8px',
//                   cursor: 'pointer',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   gap: '8px'
//                 }}
//               >
//                 <i className="fas fa-bookmark" style={{ color: '#FFD700' }}></i>
//                 <span>Save Trip</span>
//               </button>
//               <button
//                 className="action-btn-card export"
//                 onClick={() => window.print()}
//                 style={{
//                   background: '#1e3a5f',
//                   border: '1px solid #3b5f8c',
//                   color: 'white',
//                   padding: '12px',
//                   borderRadius: '8px',
//                   cursor: 'pointer',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   gap: '8px'
//                 }}
//               >
//                 <i className="fas fa-file-export" style={{ color: '#FFD700' }}></i>
//                 <span>Export PDF</span>
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* AI FOOTER */}
//       <div className="ai-footer" style={{
//         marginTop: '40px',
//         padding: '30px',
//         background: '#0a1929',
//         borderTop: '3px solid #2a4a77'
//       }}>
//         <div className="ai-footer-content" style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '30px' }}>
//           <div className="ai-footer-icon">
//             <div className="ai-glow"></div>
//             <i className="fas fa-robot" style={{ fontSize: '48px', color: '#FFD700' }}></i>
//           </div>
//           <div className="ai-footer-text" style={{ flex: 1 }}>
//             <h4 style={{ color: 'white', marginBottom: '10px' }}>✨ AI-Powered Itinerary</h4>
//             <p style={{ color: '#a3c6ff' }}>
//               This personalized journey was crafted by artificial intelligence,
//               tailored specifically for {payload.travelers} interested in {payload.preferences}. 
//               The itinerary optimizes your experience in {payload.destination} with smart scheduling and local insights.
//             </p>
//           </div>
//           <div className="ai-footer-actions" style={{ display: 'flex', gap: '15px' }}>
//             <button className="ai-feedback-btn" style={{
//               background: '#1e3a5f',
//               border: '1px solid #3b5f8c',
//               color: 'white',
//               padding: '12px 24px',
//               borderRadius: '8px',
//               cursor: 'pointer'
//             }}>
//               <i className="fas fa-thumbs-up" style={{ marginRight: '8px', color: '#FFD700' }}></i> Like this plan?
//             </button>
//             <button className="ai-regenerate-btn" onClick={handleRetry} style={{
//               background: '#2a4a77',
//               border: '1px solid #3b5f8c',
//               color: 'white',
//               padding: '12px 24px',
//               borderRadius: '8px',
//               cursor: 'pointer'
//             }}>
//               <i className="fas fa-sync-alt" style={{ marginRight: '8px' }}></i> Regenerate
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Add animation styles */}
//       <style jsx>{`
//         @keyframes slideIn {
//           from {
//             transform: translateX(100%);
//             opacity: 0;
//           }
//           to {
//             transform: translateX(0);
//             opacity: 1;
//           }
//         }
        
//         @keyframes progress {
//           from {
//             width: 100%;
//           }
//           to {
//             width: 0%;
//           }
//         }
        
//         .floating-action-btn:hover .fab-tooltip {
//           display: block;
//         }
//       `}</style>
//     </div>
//   );
// }
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { collection, addDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import "../CSS/generatePlan.css";
import TripMap from "../components/TripMap";

const fallbackSVG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
      <rect width="400" height="300" fill="#f1f5f9"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
            font-family="Arial" font-size="20" fill="#94a3b8">
        No Image
      </text>
    </svg>
  `);

export default function GeneratePlan() {
  const navigate = useNavigate();
  const location = useLocation();

  // Payload from Planner page or fallback
  const [payload] = useState(
    location.state || {
      destination: "Gilgit Baltistan",
      startDate: "2026-01-29",
      endDate: "2026-01-31",
      travelers: "Couple (2 people)",
      budget: "Mid-range",
      preferences: "Wildlife, nature, sightseeing",
    },
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [plan, setPlan] = useState(null);
  const [activeDay, setActiveDay] = useState(0);
  const [toast, setToast] = useState("");
  const [selectedMapActivity, setSelectedMapActivity] = useState(null);
  const [saving, setSaving] = useState(false);

  // ---------- Fetch AI Plan ----------
  useEffect(() => {
    generatePlan();
  }, []);

  const generatePlan = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("http://localhost:5000/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();
      console.log("AI Response:", data);

      if (!data.success) {
        throw new Error(data.error || "AI generation failed");
      }

      if (!data.plan?.days?.length) {
        throw new Error("No itinerary returned from AI");
      }

      setPlan(data.plan);
      setActiveDay(0);
    } catch (err) {
      console.error("Generate Plan Error:", err);
      setError(
        err.message || "Failed to generate itinerary. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ---------- Helpers ----------
  const itineraryDays = plan?.days || [];
  const hotels = plan?.hotels || [];
  const budget = plan?.budget || payload.budget;
  const travelTips = plan?.travelTips || [];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const calculateDuration = () => {
    const start = new Date(payload.startDate);
    const end = new Date(payload.endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  // ---------- Handlers ----------
  const handleBack = () => navigate("/planner");
  const handleRetry = () => generatePlan();
  
  // Updated handleSave with Firebase
  const handleSave = async () => {
    try {
      setSaving(true);
      
      const user = auth?.currentUser;
      const userId = user?.uid || 'guest-user';

      const tripData = {
        userId,
        destination: payload.destination,
        startDate: payload.startDate,
        endDate: payload.endDate,
        travelers: payload.travelers,
        budget: payload.budget,
        preferences: payload.preferences,
        plan: plan,
        savedAt: new Date().toISOString(),
        tripName: `${payload.destination} - ${formatDate(payload.startDate)}`
      };

      await addDoc(collection(db, 'savedTrips'), tripData);
      showToast("✅ Trip saved successfully!");
      
    } catch (error) {
      console.error("Error saving:", error);
      showToast("❌ Failed to save trip");
    } finally {
      setSaving(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast("🔗 Link copied to clipboard!");
  };

  // ---------- LOADING ----------
  if (loading) {
    return (
      <div className="generate-plan-container" style={{ paddingTop: "94px" }}>
        <div className="loading-screen">
          <div className="ai-loading">
            <div className="ai-brain-container">
              <div className="ai-brain">
                <div className="brain-pulse"></div>
                <div className="brain-glow"></div>
                <i className="fas fa-brain"></i>
              </div>
            </div>
            <div className="ai-loading-text">
              <h2>🤖 Crafting Your Perfect Journey</h2>
              <p className="loading-subtitle">
                Analyzing {payload.destination} for {payload.travelers}{" "}
                interested in {payload.preferences}
              </p>
            </div>
            <div className="loading-progress">
              <div className="progress-bar">
                <div className="progress-fill"></div>
              </div>
              <div className="loading-steps">
                <div className="loading-step active">
                  <div className="step-icon">📍</div>
                  <span className="step-text">Researching Destinations</span>
                </div>
                <div className="loading-step">
                  <div className="step-icon">🏨</div>
                  <span className="step-text">Finding Accommodations</span>
                </div>
                <div className="loading-step">
                  <div className="step-icon">🍽️</div>
                  <span className="step-text">Selecting Dining Options</span>
                </div>
                <div className="loading-step">
                  <div className="step-icon">📅</div>
                  <span className="step-text">Optimizing Itinerary</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------- ERROR ----------
  if (error && !plan) {
    return (
      <div className="generate-plan-container">
        <div className="error-state">
          <div className="error-icon-container">
            <div className="error-glow"></div>
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <h2 className="error-title">Oops! Something went wrong</h2>
          <p className="error-message">{error}</p>
          <div className="error-buttons">
            <button
              onClick={handleRetry}
              disabled={loading}
              className="retry-btn"
            >
              <div className="btn-icon">
                <i className="fas fa-redo"></i>
              </div>
              <span className="btn-text">Try Again</span>
            </button>
            <button onClick={handleBack} className="back-btn">
              <div className="btn-icon">
                <i className="fas fa-arrow-left"></i>
              </div>
              <span className="btn-text">Back to Planner</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---------- MAIN UI ----------
  return (
    <div className="generate-plan-container" style={{ 
      paddingTop: "74px",
      background: "linear-gradient(135deg, #0B1E33 0%, #1a2f45 100%)",
      minHeight: "100vh"
    }}>
      {/* Toast Notification - Enhanced with navy blue */}
      {toast && (
        <div className="toast-notification" style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#1e3a5f',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '50px',
          boxShadow: '0 4px 20px rgba(0,20,40,0.3)',
          zIndex: 9999,
          animation: 'slideIn 0.3s ease',
          border: '1px solid #3b5f8c'
        }}>
          <div className="toast-content" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className="fas fa-check-circle" style={{ color: '#4CAF50' }}></i>
            <span>{toast}</span>
          </div>
          <div className="toast-progress" style={{
            position: 'absolute',
            bottom: '0',
            left: '0',
            height: '3px',
            background: 'linear-gradient(90deg, #4CAF50, #81c784)',
            animation: 'progress 3s linear'
          }}></div>
        </div>
      )}

      {/* Floating Action Button - Navy blue theme */}
      <button 
        className="floating-action-btn" 
        onClick={handleSave}
        disabled={saving}
        style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          width: '60px',
          height: '60px',
          borderRadius: '30px',
          background: saving ? '#94a3b8' : '#1e3a5f',
          border: '2px solid #3b5f8c',
          color: 'white',
          cursor: saving ? 'not-allowed' : 'pointer',
          boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
          transition: 'all 0.3s ease',
          zIndex: 999
        }}
        onMouseEnter={(e) => {
          if (!saving) {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.background = '#2a4a77';
          }
        }}
        onMouseLeave={(e) => {
          if (!saving) {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.background = '#1e3a5f';
          }
        }}
      >
        {saving ? (
          <i className="fas fa-spinner fa-spin"></i>
        ) : (
          <i className="fas fa-bookmark"></i>
        )}
        <span className="fab-tooltip" style={{
          position: 'absolute',
          right: '70px',
          top: '50%',
          transform: 'translateY(-50%)',
          background: '#1e3a5f',
          color: 'white',
          padding: '5px 10px',
          borderRadius: '5px',
          fontSize: '14px',
          whiteSpace: 'nowrap',
          border: '1px solid #3b5f8c',
          display: 'none'
        }}>{saving ? 'Saving...' : 'Save Itinerary'}</span>
      </button>

      {/* HEADER - Enhanced with navy blue gradient */}
      <div className="plan-header" style={{
        background: 'linear-gradient(135deg, #0a1929 0%, #0f2740 100%)',
        color: 'white',
        padding: '40px 20px',
        marginBottom: '20px',
        borderBottom: '3px solid #2a4a77'
      }}>
        <div className="header-background">
          <div className="header-gradient"></div>
          <div className="header-map-effect"></div>
        </div>
        <div className="header-content-wrapper" style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <button 
            onClick={handleBack} 
            className="back-to-planner"
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid #3b5f8c',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              marginBottom: '20px'
            }}
          >
            <div className="back-icon" style={{ display: 'inline-block', marginRight: '8px' }}>
              <i className="fas fa-arrow-left"></i>
            </div>
            <span className="back-text">Back to Planner</span>
          </button>

          <div className="header-main">
            <div className="destination-badge" style={{ marginBottom: '15px' }}>
              <i className="fas fa-map-marker-alt badge-icon" style={{ color: '#FFD700', marginRight: '8px' }}></i>
              <span className="badge-text" style={{ color: '#a3c6ff' }}>Your Journey to</span>
            </div>
            <h1 className="destination-title" style={{ 
              fontSize: '48px', 
              marginBottom: '15px',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
            }}>
              {payload.destination}
            </h1>
            <div className="header-meta" style={{ display: 'flex', gap: '30px' }}>
              <div className="meta-item">
                <i className="fas fa-calendar-alt" style={{ color: '#FFD700', marginRight: '8px' }}></i>
                <span>
                  {formatDate(payload.startDate)} → {formatDate(payload.endDate)}
                </span>
              </div>
              <div className="meta-item">
                <i className="fas fa-users" style={{ color: '#FFD700', marginRight: '8px' }}></i>
                <span>{payload.travelers}</span>
              </div>
              <div className="meta-item">
                <i className="fas fa-tag" style={{ color: '#FFD700', marginRight: '8px' }}></i>
                <span>{budget} Budget</span>
              </div>
            </div>
          </div>

          <div className="header-actions" style={{ marginTop: '20px' }}>
            <div className="action-buttons-header" style={{ display: 'flex', gap: '10px' }}>
              <button 
                className="action-btn-header share" 
                onClick={handleShare}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid #3b5f8c',
                  color: 'white',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                <i className="fas fa-share-alt" style={{ marginRight: '8px' }}></i>
                <span>Share</span>
              </button>
              <button
                className="action-btn-header print"
                onClick={() => window.print()}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid #3b5f8c',
                  color: 'white',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                <i className="fas fa-print" style={{ marginRight: '8px' }}></i>
                <span>Print</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* TRIP STATS - Navy blue cards */}
      <div className="trip-stats-container" style={{ maxWidth: '1400px', margin: '0 auto 30px', padding: '0 20px' }}>
        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
          {[
            { icon: 'clock', label: 'Trip Duration', value: `${calculateDuration()} Days` },
            { icon: 'hiking', label: 'Activities', value: `${itineraryDays.length * 3}+` },
            { icon: 'bed', label: 'Hotels', value: hotels.length },
            { icon: 'lightbulb', label: 'AI Generated', value: '100% Custom' }
          ].map((stat, idx) => (
            <div key={idx} className="stat-card" style={{
              background: '#0f2740',
              borderRadius: '12px',
              padding: '20px',
              border: '1px solid #2a4a77',
              boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
            }}>
              <div className="stat-icon-wrapper" style={{
                width: '50px',
                height: '50px',
                background: '#1e3a5f',
                borderRadius: '25px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '15px'
              }}>
                <i className={`fas fa-${stat.icon}`} style={{ color: '#FFD700', fontSize: '24px' }}></i>
              </div>
              <div className="stat-content">
                <h3 className="stat-label" style={{ color: '#a3c6ff', marginBottom: '5px' }}>{stat.label}</h3>
                <p className="stat-value" style={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}>{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div
        className="content-grid with-map"
        style={{ 
          display: "flex", 
          gap: "30px", 
          alignItems: "flex-start",
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 20px'
        }}
      >
        {/* LEFT SIDE - ITINERARY */}
        <div className="content-left" style={{ flex: 2, minWidth: "50%" }}>
          {/* DAY NAVIGATION */}
          <div className="day-navigation-card" style={{
            background: '#0f2740',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '20px',
            border: '1px solid #2a4a77'
          }}>
            <div className="day-nav-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ color: 'white' }}>
                <i className="fas fa-calendar-alt" style={{ color: '#FFD700', marginRight: '10px' }}></i> Daily Itinerary
              </h2>
              <div className="duration-badge" style={{
                background: '#1e3a5f',
                color: '#FFD700',
                padding: '5px 15px',
                borderRadius: '20px',
                border: '1px solid #3b5f8c'
              }}>{calculateDuration()} Days</div>
            </div>

            <div className="day-tabs" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {itineraryDays.map((day, idx) => (
                <button
                  key={idx}
                  className={`day-tab ${activeDay === idx ? "active" : ""}`}
                  onClick={() => setActiveDay(idx)}
                  style={{
                    flex: '1',
                    minWidth: '100px',
                    padding: '12px',
                    background: activeDay === idx ? '#1e3a5f' : '#0a1929',
                    border: activeDay === idx ? '2px solid #FFD700' : '1px solid #2a4a77',
                    borderRadius: '8px',
                    color: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div className="day-tab-content">
                    <div className="day-number" style={{ fontWeight: 'bold' }}>Day {day.day || idx + 1}</div>
                    <div className="day-status" style={{ fontSize: '12px', marginTop: '5px' }}>
                      {idx === 0 && (
                        <span style={{ color: '#4CAF50' }}>🚀 Arrival</span>
                      )}
                      {idx === itineraryDays.length - 1 && (
                        <span style={{ color: '#ff6b6b' }}>🏁 Departure</span>
                      )}
                      {idx > 0 && idx < itineraryDays.length - 1 && (
                        <span style={{ color: '#FFD700' }}>🗺️ Explore</span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* ACTIVITY PLACES */}
          <div className="timeline-card" style={{
            background: '#0f2740',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #2a4a77'
          }}>
            <div className="timeline-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ color: 'white' }}>
                Day {itineraryDays[activeDay]?.day || activeDay + 1} – Places to Visit
              </h2>
              <div className="timeline-date" style={{ color: '#a3c6ff' }}>
                {formatDate(
                  new Date(payload.startDate).getTime() + activeDay * 86400000,
                )}
              </div>
            </div>

            {/* Place cards */}
            <div className="places-container" style={{ display: 'grid', gap: '20px' }}>
              {itineraryDays[activeDay]?.places?.map((place, idx) => (
                <div key={idx} className="place-card" style={{
                  background: '#0a1929',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '1px solid #2a4a77',
                  display: 'flex'
                }}>
                  <div className="place-image" style={{ width: '200px', height: '150px' }}>
                    <img
                      src={`https://source.unsplash.com/400x300/?${encodeURIComponent(
                        (place.imageQuery || place.name).replace(/\s+/g, ","),
                      )}`}
                      alt={place.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = fallbackSVG;
                      }}
                    />
                  </div>
                  <div className="place-content" style={{ padding: '15px', flex: 1 }}>
                    <h3 className="place-name" style={{ color: 'white', marginBottom: '10px' }}>{place.name}</h3>
                    <p className="place-description" style={{ color: '#a3c6ff', marginBottom: '15px' }}>
                      {place.description || "A must-visit location."}
                    </p>
                    <div className="place-actions">
                      <button
                        className="map-btn"
                        onClick={() => {
                          // Enhanced data for map component
                          setSelectedMapActivity({
                            ...place,
                            lat: place.lat,
                            lng: place.lng,
                            destination: payload.destination,
                            selectedAt: Date.now(),
                          });

                          // Auto-switch to correct day
                          const dayIndex = itineraryDays.findIndex((day) =>
                            day.places?.some((p) => p.name === place.name),
                          );
                          if (dayIndex !== -1 && dayIndex !== activeDay) {
                            setActiveDay(dayIndex);
                            showToast(`📅 Switched to Day ${dayIndex + 1} for ${place.name}`);
                          }
                        }}
                        style={{
                          background: '#1e3a5f',
                          border: '1px solid #3b5f8c',
                          color: 'white',
                          padding: '8px 16px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        <i className="fas fa-map-marker-alt" style={{ color: '#FFD700' }}></i> View on Map
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* DAY TIPS */}
            {itineraryDays[activeDay]?.tips && (
              <div className="day-tips-card" style={{
                marginTop: '20px',
                padding: '15px',
                background: '#1e3a5f',
                borderRadius: '8px',
                border: '1px solid #3b5f8c'
              }}>
                <div className="tips-header" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <div className="tips-icon">
                    <i className="fas fa-lightbulb" style={{ color: '#FFD700' }}></i>
                  </div>
                  <h3 style={{ color: 'white' }}>Travel Tips for Today</h3>
                </div>
                <p className="tips-content" style={{ color: '#a3c6ff' }}>{itineraryDays[activeDay].tips}</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SIDE - MAP + SIDEBAR */}
        <div
          className="content-right"
          style={{
            flex: 1,
            minWidth: "40%",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          {/* MAP */}
          <div style={{ height: "600px", width: "100%" }}>
            <TripMap
              destination={payload.destination}
              itineraryDays={itineraryDays}
              activeDay={activeDay}
              selectedActivity={selectedMapActivity}
              onActivitySelect={setSelectedMapActivity}
            />
          </div>

          {/* HOTELS SECTION */}
          {hotels.length > 0 && (
            <div className="sidebar-card hotels-section" style={{
              background: '#0f2740',
              borderRadius: '12px',
              padding: '20px',
              border: '1px solid #2a4a77'
            }}>
              <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                <div className="header-icon" style={{
                  width: '40px',
                  height: '40px',
                  background: '#1e3a5f',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <i className="fas fa-bed" style={{ color: '#FFD700' }}></i>
                </div>
                <div className="header-content">
                  <h3 style={{ color: 'white', marginBottom: '5px' }}>Recommended Stays</h3>
                  <p className="card-subtitle" style={{ color: '#a3c6ff' }}>
                    Carefully selected for {payload.travelers}
                  </p>
                </div>
              </div>
              <div className="hotels-list" style={{ display: 'grid', gap: '15px' }}>
                {hotels.map((hotel, idx) => (
                  <div key={idx} className="hotel-item" style={{
                    background: '#0a1929',
                    borderRadius: '8px',
                    padding: '15px',
                    border: '1px solid #2a4a77'
                  }}>
                    <div className="hotel-details">
                      <h4 className="hotel-name" style={{ color: 'white', marginBottom: '10px' }}>{hotel.name}</h4>
                      <div className="hotel-info" style={{ display: 'flex', gap: '15px', marginBottom: '10px' }}>
                        <span className="hotel-price" style={{ color: '#FFD700' }}>{hotel.price}</span>
                        <span className="hotel-type" style={{ color: '#a3c6ff' }}>4-star Hotel</span>
                      </div>
                      <div className="hotel-features" style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                        <span className="feature-tag" style={{ color: '#a3c6ff', fontSize: '12px' }}>
                          <i className="fas fa-wifi" style={{ marginRight: '5px' }}></i> WiFi
                        </span>
                        <span className="feature-tag" style={{ color: '#a3c6ff', fontSize: '12px' }}>
                          <i className="fas fa-swimming-pool" style={{ marginRight: '5px' }}></i> Pool
                        </span>
                        <span className="feature-tag" style={{ color: '#a3c6ff', fontSize: '12px' }}>
                          <i className="fas fa-utensils" style={{ marginRight: '5px' }}></i> Breakfast
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TRAVEL TIPS */}
          {travelTips.length > 0 && (
            <div className="sidebar-card tips-section" style={{
              background: '#0f2740',
              borderRadius: '12px',
              padding: '20px',
              border: '1px solid #2a4a77'
            }}>
              <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                <div className="header-icon" style={{
                  width: '40px',
                  height: '40px',
                  background: '#1e3a5f',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <i className="fas fa-compass" style={{ color: '#FFD700' }}></i>
                </div>
                <div className="header-content">
                  <h3 style={{ color: 'white', marginBottom: '5px' }}>Essential Tips</h3>
                  <p className="card-subtitle" style={{ color: '#a3c6ff' }}>For a smooth journey</p>
                </div>
              </div>
              <div className="tips-list" style={{ display: 'grid', gap: '15px' }}>
                {travelTips.map((tip, idx) => (
                  <div key={idx} className="tip-item" style={{ display: 'flex', gap: '15px' }}>
                    <div className="tip-number" style={{
                      width: '24px',
                      height: '24px',
                      background: '#1e3a5f',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFD700',
                      fontSize: '12px'
                    }}>{idx + 1}</div>
                    <div className="tip-content" style={{ color: '#a3c6ff', flex: 1 }}>{tip}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PACKING LIST */}
          <div className="sidebar-card packing-section" style={{
            background: '#0f2740',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #2a4a77'
          }}>
            <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
              <div className="header-icon" style={{
                width: '40px',
                height: '40px',
                background: '#1e3a5f',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <i className="fas fa-suitcase-rolling" style={{ color: '#FFD700' }}></i>
              </div>
              <div className="header-content">
                <h3 style={{ color: 'white', marginBottom: '5px' }}>Packing Essentials</h3>
                <p className="card-subtitle" style={{ color: '#a3c6ff' }}>For {payload.preferences}</p>
              </div>
            </div>
            <div className="packing-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="packing-category">
                <h4 className="category-title" style={{ color: '#FFD700', marginBottom: '10px' }}>Clothing</h4>
                <div className="category-items" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span className="packing-item" style={{ color: '#a3c6ff' }}>✓ Comfortable shoes</span>
                  <span className="packing-item" style={{ color: '#a3c6ff' }}>✓ Weather layers</span>
                  <span className="packing-item" style={{ color: '#a3c6ff' }}>✓ Swimwear</span>
                </div>
              </div>
              <div className="packing-category">
                <h4 className="category-title" style={{ color: '#FFD700', marginBottom: '10px' }}>Essentials</h4>
                <div className="category-items" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span className="packing-item" style={{ color: '#a3c6ff' }}>✓ Travel adapter</span>
                  <span className="packing-item" style={{ color: '#a3c6ff' }}>✓ Power bank</span>
                  <span className="packing-item" style={{ color: '#a3c6ff' }}>✓ First aid kit</span>
                </div>
              </div>
            </div>
          </div>

          {/* QUICK ACTIONS */}
          <div className="sidebar-card actions-section" style={{
            background: '#0f2740',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #2a4a77'
          }}>
            <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
              <div className="header-icon" style={{
                width: '40px',
                height: '40px',
                background: '#1e3a5f',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <i className="fas fa-bolt" style={{ color: '#FFD700' }}></i>
              </div>
              <h3 style={{ color: 'white' }}>Quick Actions</h3>
            </div>
            <div className="action-buttons-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button 
                className="action-btn-card save" 
                onClick={handleSave}
                disabled={saving}
                style={{
                  background: saving ? '#94a3b8' : '#1e3a5f',
                  border: '1px solid #3b5f8c',
                  color: 'white',
                  padding: '12px',
                  borderRadius: '8px',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {saving ? (
                  <i className="fas fa-spinner fa-spin"></i>
                ) : (
                  <i className="fas fa-bookmark" style={{ color: '#FFD700' }}></i>
                )}
                <span>{saving ? 'Saving...' : 'Save Trip'}</span>
              </button>
              <button
                className="action-btn-card export"
                onClick={() => window.print()}
                style={{
                  background: '#1e3a5f',
                  border: '1px solid #3b5f8c',
                  color: 'white',
                  padding: '12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <i className="fas fa-file-export" style={{ color: '#FFD700' }}></i>
                <span>Export PDF</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* AI FOOTER */}
      <div className="ai-footer" style={{
        marginTop: '40px',
        padding: '30px',
        background: '#0a1929',
        borderTop: '3px solid #2a4a77'
      }}>
        <div className="ai-footer-content" style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '30px' }}>
          <div className="ai-footer-icon">
            <div className="ai-glow"></div>
            <i className="fas fa-robot" style={{ fontSize: '48px', color: '#FFD700' }}></i>
          </div>
          <div className="ai-footer-text" style={{ flex: 1 }}>
            <h4 style={{ color: 'white', marginBottom: '10px' }}>✨ AI-Powered Itinerary</h4>
            <p style={{ color: '#a3c6ff' }}>
              This personalized journey was crafted by artificial intelligence,
              tailored specifically for {payload.travelers} interested in {payload.preferences}. 
              The itinerary optimizes your experience in {payload.destination} with smart scheduling and local insights.
            </p>
          </div>
          <div className="ai-footer-actions" style={{ display: 'flex', gap: '15px' }}>
            <button className="ai-feedback-btn" style={{
              background: '#1e3a5f',
              border: '1px solid #3b5f8c',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer'
            }}>
              <i className="fas fa-thumbs-up" style={{ marginRight: '8px', color: '#FFD700' }}></i> Like this plan?
            </button>
            <button className="ai-regenerate-btn" onClick={handleRetry} style={{
              background: '#2a4a77',
              border: '1px solid #3b5f8c',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer'
            }}>
              <i className="fas fa-sync-alt" style={{ marginRight: '8px' }}></i> Regenerate
            </button>
          </div>
        </div>
      </div>

      {/* Add animation styles */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes progress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
        
        .floating-action-btn:hover .fab-tooltip {
          display: block;
        }
      `}</style>
    </div>
  );
}

