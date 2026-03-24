import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { collection, addDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { itineraryAgent, budgetAgent, mapAgent, imageAgent } from "../agents";
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
const [payload] = useState(() => {
  const state = location.state || {};
  return {
    destination: state.destination || "Gilgit Baltistan",
    startDate: state.startDate || "2026-01-29",
    endDate: state.endDate || "2026-01-31",
    travelers: state.travelers || "Couple (2 people)",
    budget: state.budget || "Mid-range",
    preferences: state.preferences || "Wildlife, nature, sightseeing",
    isSavedTrip: !!state.plan, // detect if it's a saved trip
    plan: state.plan || null,
  };
});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [plan, setPlan] = useState(null); 
  const [budget, setBudget] = useState(null);
  const [activeDay, setActiveDay] = useState(0);
  const [toast, setToast] = useState("");
  const [selectedMapActivity, setSelectedMapActivity] = useState(null);
  const [saving, setSaving] = useState(false);
  const [placeImages, setPlaceImages] = useState({});
  const [agentStatus, setAgentStatus] = useState({
    itinerary: "pending",
    budget: "pending",
    map: "pending",
  });

  // ---------- Generate Plan with Agents (ONLY FOR NEW TRIPS) ----------
  const generatePlan = async () => {
    try {
      setLoading(true);
      setError("");
      
      console.log("🚀 Starting AI Agents for new trip...");
      console.log("Destination:", payload.destination);
      console.log("Travelers:", payload.travelers);
      console.log("Preferences:", payload.preferences);

      // Step 1: Itinerary Agent - Generate the plan
      setAgentStatus((prev) => ({ ...prev, itinerary: "working" }));
      console.log("🤖 Itinerary Agent is planning your trip...");

      const itinerary = await itineraryAgent.generateItinerary(
        payload.destination,
        payload.startDate,
        payload.endDate,
        payload.preferences,
        payload.travelers,
      );

      if (!itinerary || !itinerary.days) {
        throw new Error("Invalid itinerary response");
      }

      console.log("✅ Itinerary generated:", itinerary.days.length, "days");
      setPlan(itinerary);
      setAgentStatus((prev) => ({ ...prev, itinerary: "done" }));

      // Step 2: Budget Agent - Calculate budget
      setAgentStatus((prev) => ({ ...prev, budget: "working" }));
      console.log("🤖 Budget Agent is calculating your budget...");

      const budgetData = budgetAgent.calculateBudget(itinerary, payload);
      console.log("✅ Budget calculated:", budgetData.total);
      setBudget(budgetData);
      setAgentStatus((prev) => ({ ...prev, budget: "done" }));

      // Step 3: Map Agent - Add coordinates
      setAgentStatus((prev) => ({ ...prev, map: "working" }));
      console.log("🤖 Map Agent is adding coordinates to places...");

      const itineraryWithCoords = await mapAgent.processItineraryCoordinates(
        itinerary,
        payload.destination,
      );
      setPlan(itineraryWithCoords);
      console.log("✅ Map coordinates added");
      setAgentStatus((prev) => ({ ...prev, map: "done" }));

      setActiveDay(0);
      setLoading(false);
      
    } catch (err) {
      console.error("Generate Plan Error:", err);
      setError(err.message || "Failed to generate itinerary. Please try again.");
      setLoading(false);
    }
  };

  // ---------- Load Saved Trip (NO API CALLS) ----------
  const loadSavedTrip = () => {
  try {
    console.log("📀 Loading saved trip - NO API CALLS");
    console.log("Payload received:", payload);
    console.log("Saved plan:", payload.plan);

    // Check if we have a valid saved plan
    if (!payload.plan || !payload.plan.days) {
      console.error("Invalid saved plan data");
      setError("Invalid saved trip data. Please try again.");
      setLoading(false);
      return;
    }

    console.log("Saved plan days:", payload.plan.days.length);

    // Set the plan directly
    setPlan(payload.plan);

    // Set budget if available, otherwise fill defaults
    if (payload.budget) {
      // Ensure breakdown exists
      const cleanBudget = {
        total: payload.budget.total ?? 0,
        daily: payload.budget.daily ?? 0,
        breakdown: {
          accommodation: payload.budget.breakdown?.accommodation ?? 0,
          food: payload.budget.breakdown?.food ?? 0,
          transport: payload.budget.breakdown?.transport ?? 0,
          activities: payload.budget.breakdown?.activities ?? 0,
          miscellaneous: payload.budget.breakdown?.miscellaneous ?? 0,
        },
        recommendations: payload.budget.recommendations ?? [],
        currency: payload.budget.currency ?? "USD",
      };
      setBudget(cleanBudget);
    } else if (payload.budgetLevel) {
      // Calculate simple budget if only level provided
      const duration = itineraryAgent.calculateDays(payload.startDate, payload.endDate);
      const travelerCount = payload.travelers?.includes("Solo")
        ? 1
        : payload.travelers?.includes("Couple")
        ? 2
        : 3;
      const dailyRate =
        payload.budgetLevel === "Luxury"
          ? 250
          : payload.budgetLevel === "Mid-range"
          ? 150
          : 80;
      const total = dailyRate * duration * travelerCount;

      setBudget({
        total,
        daily: total / duration,
        breakdown: {
          accommodation: total * 0.4,
          food: total * 0.25,
          transport: total * 0.15,
          activities: total * 0.15,
          miscellaneous: total * 0.05,
        },
        recommendations: [
          "Book accommodations in advance for better rates",
          "Use local transportation to save money",
          "Look for combo deals for attractions",
        ],
        currency: "USD",
      });
    } else {
      // If no budget info at all, set safe defaults
      setBudget({
        total: 0,
        daily: 0,
        breakdown: {
          accommodation: 0,
          food: 0,
          transport: 0,
          activities: 0,
          miscellaneous: 0,
        },
        recommendations: [],
        currency: "USD",
      });
    }

    setActiveDay(0);
    setLoading(false);
    console.log("✅ Saved trip loaded successfully!");
  } catch (err) {
    console.error("Error loading saved trip:", err);
    setError("Failed to load saved trip: " + err.message);
    setLoading(false);
  }
};

  // ---------- Initialize Component - CHECK SAVED TRIP FIRST ----------
 useEffect(() => {
  console.log("Component initialized");
  console.log("Payload:", payload);

  // Safely handle saved trips
  if (payload.plan?.days?.length > 0) {
    console.log("📀 SAVED TRIP DETECTED - Loading directly");
    loadSavedTrip();
  } else if (payload.isSavedTrip) {
    // Plan exists but days are missing
    setError("Saved trip data is incomplete.");
    setLoading(false);
  } else {
    console.log("🆕 NEW TRIP - Calling API to generate plan");
    generatePlan();
  }
}, []);

  // ---------- Fetch images for current day's places using ImageAgent ----------
  useEffect(() => {
    const loadImages = async () => {
      // Only run if plan exists and not loading
      if (!plan || loading) return;

      const places = plan.days?.[activeDay]?.places || [];
      if (places.length === 0) return;

      // Check if we already have images for these places
      const needImages = places.some((place) => !placeImages[place.name]);
      if (!needImages) return;

      console.log(
        `🖼️ Image Agent is fetching images for Day ${activeDay + 1}...`,
      );

      const images = await imageAgent.fetchImagesForDay(places);
      setPlaceImages((prev) => ({ ...prev, ...images }));
    };

    loadImages();
  }, [activeDay, plan, loading]);

  // ---------- Helpers ----------
  const itineraryDays = plan?.days || [];
  const hotels = plan?.hotels || [];
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
  const handleRetry = () => {
    setPlan(null);
    setBudget(null);
    setPlaceImages({});
    setAgentStatus({
      itinerary: "pending",
      budget: "pending",
      map: "pending",
    });
    generatePlan();
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      showToast("⏳ Saving your trip...");

      const user = auth?.currentUser;
      const userId = user?.uid || "guest-user";

      // Validate and clean all data - prevent undefined values
      const cleanItineraryDays = (itineraryDays || []).map((day) => ({
        day: day?.day || 1,
        places: (day?.places || []).map((place) => ({
          name: place?.name || "Unknown Place",
          description: place?.description || "No description available",
          lat: place?.lat || null,
          lng: place?.lng || null,
        })),
        tips: day?.tips || "Enjoy your day!",
      }));

      const cleanHotels = (hotels || []).map((hotel) => ({
        name: hotel?.name || "Hotel",
        price: hotel?.price || "Price not available",
        rating: hotel?.rating || 4.0,
        description: hotel?.description || "Comfortable accommodation",
      }));

      const cleanTravelTips = (travelTips || []).filter(
        (tip) => tip && tip.trim() !== "",
      );

      const tripData = {
        userId: userId,
        destination: payload?.destination || "Unknown Destination",
        startDate: payload?.startDate || new Date().toISOString().split("T")[0],
        endDate: payload?.endDate || new Date().toISOString().split("T")[0],
        travelers: payload?.travelers || "Not specified",
        budgetLevel: payload?.budget || "Mid-range",
        preferences: payload?.preferences || "General travel",
        days: cleanItineraryDays,
        hotels: cleanHotels,
        travelTips: cleanTravelTips,
        budget: budget
          ? {
              total: budget?.total || 0,
              daily: budget?.daily || 0,
              breakdown: budget?.breakdown || {
                accommodation: 0,
                food: 0,
                transport: 0,
                activities: 0,
                miscellaneous: 0,
              },
              recommendations: budget?.recommendations || [],
            }
          : null,
        savedAt: new Date().toISOString(),
        tripName: `${payload?.destination || "My Trip"} - ${formatDate(payload?.startDate || new Date())}`,
        createdAt: new Date().toISOString(),
      };

      console.log("Saving trip data:", tripData);

      const docRef = await addDoc(collection(db, "savedTrips"), tripData);
      console.log("✅ Trip saved! ID:", docRef.id);
      showToast("✅ Trip saved successfully!");

      setTimeout(() => {
        if (
          window.confirm("Trip saved! Would you like to view your saved trips?")
        ) {
          navigate("/planner?tab=saved");
        }
      }, 1500);
    } catch (error) {
      console.error("Save error:", error);
      showToast("❌ Failed to save trip: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast("🔗 Link copied to clipboard!");
  };

  const handleViewSavedTrips = () => {
    navigate("/planner?tab=saved");
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
              <h2>🤖 AI Agents At Work</h2>
              <p className="loading-subtitle">
                {agentStatus.itinerary === "working" &&
                  "📝 Itinerary Agent is planning your trip..."}
                {agentStatus.budget === "working" &&
                  "💰 Budget Agent is calculating costs..."}
                {agentStatus.map === "working" &&
                  "📍 Map Agent is locating places..."}
                {agentStatus.itinerary === "done" &&
                  agentStatus.budget === "done" &&
                  agentStatus.map === "done" &&
                  "✨ Almost ready..."}
              </p>
            </div>
            <div className="loading-progress">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${(agentStatus.itinerary === "done" ? 33 : 0) + (agentStatus.budget === "done" ? 33 : 0) + (agentStatus.map === "done" ? 33 : 0)}%`,
                  }}
                ></div>
              </div>
              <div className="loading-steps">
                <div
                  className={`loading-step ${agentStatus.itinerary !== "pending" ? "active" : ""}`}
                >
                  <div className="step-icon">🗺️</div>
                  <span className="step-text">Itinerary Agent</span>
                  {agentStatus.itinerary === "working" && (
                    <i className="fas fa-spinner fa-spin"></i>
                  )}
                  {agentStatus.itinerary === "done" && (
                    <i
                      className="fas fa-check-circle"
                      style={{ color: "#4CAF50" }}
                    ></i>
                  )}
                </div>
                <div
                  className={`loading-step ${agentStatus.budget !== "pending" ? "active" : ""}`}
                >
                  <div className="step-icon">💰</div>
                  <span className="step-text">Budget Agent</span>
                  {agentStatus.budget === "working" && (
                    <i className="fas fa-spinner fa-spin"></i>
                  )}
                  {agentStatus.budget === "done" && (
                    <i
                      className="fas fa-check-circle"
                      style={{ color: "#4CAF50" }}
                    ></i>
                  )}
                </div>
                <div
                  className={`loading-step ${agentStatus.map !== "pending" ? "active" : ""}`}
                >
                  <div className="step-icon">📍</div>
                  <span className="step-text">Map Agent</span>
                  {agentStatus.map === "working" && (
                    <i className="fas fa-spinner fa-spin"></i>
                  )}
                  {agentStatus.map === "done" && (
                    <i
                      className="fas fa-check-circle"
                      style={{ color: "#4CAF50" }}
                    ></i>
                  )}
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
    <div
      className="generate-plan-container"
      style={{
        paddingTop: "74px",
        background: "linear-gradient(135deg, #0B1E33 0%, #1a2f45 100%)",
        minHeight: "100vh",
      }}
    >
      {/* Toast Notification */}
      {toast && (
        <div
          className="toast-notification"
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            background: "#1e3a5f",
            color: "white",
            padding: "12px 24px",
            borderRadius: "50px",
            boxShadow: "0 4px 20px rgba(0,20,40,0.3)",
            zIndex: 9999,
            animation: "slideIn 0.3s ease",
            border: "1px solid #3b5f8c",
          }}
        >
          <div
            className="toast-content"
            style={{ display: "flex", alignItems: "center", gap: "10px" }}
          >
            <i className="fas fa-check-circle" style={{ color: "#4CAF50" }}></i>
            <span>{toast}</span>
          </div>
          <div
            className="toast-progress"
            style={{
              position: "absolute",
              bottom: "0",
              left: "0",
              height: "3px",
              background: "linear-gradient(90deg, #4CAF50, #81c784)",
              animation: "progress 3s linear",
            }}
          ></div>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        className="floating-action-btn"
        onClick={handleSave}
        disabled={saving}
        style={{
          position: "fixed",
          bottom: "30px",
          right: "30px",
          width: "60px",
          height: "60px",
          borderRadius: "30px",
          background: saving ? "#94a3b8" : "#1e3a5f",
          border: "2px solid #3b5f8c",
          color: "white",
          cursor: saving ? "not-allowed" : "pointer",
          boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
          transition: "all 0.3s ease",
          zIndex: 999,
        }}
        onMouseEnter={(e) => {
          if (!saving) {
            e.currentTarget.style.transform = "scale(1.1)";
            e.currentTarget.style.background = "#2a4a77";
          }
        }}
        onMouseLeave={(e) => {
          if (!saving) {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.background = "#1e3a5f";
          }
        }}
      >
        {saving ? (
          <i className="fas fa-spinner fa-spin"></i>
        ) : (
          <i className="fas fa-bookmark"></i>
        )}
        <span
          className="fab-tooltip"
          style={{
            position: "absolute",
            right: "70px",
            top: "50%",
            transform: "translateY(-50%)",
            background: "#1e3a5f",
            color: "white",
            padding: "5px 10px",
            borderRadius: "5px",
            fontSize: "14px",
            whiteSpace: "nowrap",
            border: "1px solid #3b5f8c",
            display: "none",
          }}
        >
          {saving ? "Saving..." : "Save Itinerary"}
        </span>
      </button>

      {/* HEADER with My Saved Trips button */}
      <div
        className="plan-header"
        style={{
          background: "linear-gradient(135deg, #0a1929 0%, #0f2740 100%)",
          color: "white",
          padding: "40px 20px",
          marginBottom: "20px",
          borderBottom: "3px solid #2a4a77",
        }}
      >
        <div className="header-background">
          <div className="header-gradient"></div>
          <div className="header-map-effect"></div>
        </div>
        <div
          className="header-content-wrapper"
          style={{ maxWidth: "1400px", margin: "0 auto" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <button
              onClick={handleBack}
              className="back-to-planner"
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "1px solid #3b5f8c",
                color: "white",
                padding: "8px 16px",
                borderRadius: "8px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <i className="fas fa-arrow-left"></i>
              Back to Planner
            </button>

            <button
              onClick={handleViewSavedTrips}
              style={{
                background: "#1e3a5f",
                border: "2px solid #FFD700",
                color: "white",
                padding: "8px 20px",
                borderRadius: "8px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontWeight: "bold",
              }}
            >
              <i className="fas fa-bookmark" style={{ color: "#FFD700" }}></i>
              My Saved Trips
            </button>
          </div>

          <div className="header-main">
            <div className="destination-badge" style={{ marginBottom: "15px" }}>
              <i
                className="fas fa-map-marker-alt badge-icon"
                style={{ color: "#FFD700", marginRight: "8px" }}
              ></i>
              <span className="badge-text" style={{ color: "#a3c6ff" }}>
                Your Journey to
              </span>
            </div>
            <h1
              className="destination-title"
              style={{
                fontSize: "48px",
                marginBottom: "15px",
                textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
              }}
            >
              {payload.destination}
            </h1>
            <div
              className="header-meta"
              style={{ display: "flex", gap: "30px" }}
            >
              <div className="meta-item">
                <i
                  className="fas fa-calendar-alt"
                  style={{ color: "#FFD700", marginRight: "8px" }}
                ></i>
                <span>
                  {formatDate(payload.startDate)} →{" "}
                  {formatDate(payload.endDate)}
                </span>
              </div>
              <div className="meta-item">
                <i
                  className="fas fa-users"
                  style={{ color: "#FFD700", marginRight: "8px" }}
                ></i>
                <span>{payload.travelers}</span>
              </div>
              <div className="meta-item">
                <i
                  className="fas fa-tag"
                  style={{ color: "#FFD700", marginRight: "8px" }}
                ></i>
                <span>{payload.budget} Budget</span>
              </div>
            </div>
          </div>

          <div className="header-actions" style={{ marginTop: "20px" }}>
            <div
              className="action-buttons-header"
              style={{ display: "flex", gap: "10px" }}
            >
              <button
                className="action-btn-header share"
                onClick={handleShare}
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid #3b5f8c",
                  color: "white",
                  padding: "10px 20px",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                <i
                  className="fas fa-share-alt"
                  style={{ marginRight: "8px" }}
                ></i>
                <span>Share</span>
              </button>
              <button
                className="action-btn-header print"
                onClick={() => window.print()}
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid #3b5f8c",
                  color: "white",
                  padding: "10px 20px",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                <i className="fas fa-print" style={{ marginRight: "8px" }}></i>
                <span>Print</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* TRIP STATS */}
      <div
        className="trip-stats-container"
        style={{ maxWidth: "1400px", margin: "0 auto 30px", padding: "0 20px" }}
      >
        <div
          className="stats-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "20px",
          }}
        >
          <div
            className="stat-card"
            style={{
              background: "#0f2740",
              borderRadius: "12px",
              padding: "20px",
              border: "1px solid #2a4a77",
              boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
            }}
          >
            <div
              className="stat-icon-wrapper"
              style={{
                width: "50px",
                height: "50px",
                background: "#1e3a5f",
                borderRadius: "25px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "15px",
              }}
            >
              <i
                className="fas fa-clock"
                style={{ color: "#FFD700", fontSize: "24px" }}
              ></i>
            </div>
            <div className="stat-content">
              <h3
                className="stat-label"
                style={{ color: "#a3c6ff", marginBottom: "5px" }}
              >
                Trip Duration
              </h3>
              <p
                className="stat-value"
                style={{ color: "white", fontSize: "24px", fontWeight: "bold" }}
              >
                {calculateDuration()} Days
              </p>
            </div>
          </div>
          <div
            className="stat-card"
            style={{
              background: "#0f2740",
              borderRadius: "12px",
              padding: "20px",
              border: "1px solid #2a4a77",
              boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
            }}
          >
            <div
              className="stat-icon-wrapper"
              style={{
                width: "50px",
                height: "50px",
                background: "#1e3a5f",
                borderRadius: "25px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "15px",
              }}
            >
              <i
                className="fas fa-hiking"
                style={{ color: "#FFD700", fontSize: "24px" }}
              ></i>
            </div>
            <div className="stat-content">
              <h3
                className="stat-label"
                style={{ color: "#a3c6ff", marginBottom: "5px" }}
              >
                Activities
              </h3>
              <p
                className="stat-value"
                style={{ color: "white", fontSize: "24px", fontWeight: "bold" }}
              >
                {itineraryDays.length * 3}+
              </p>
            </div>
          </div>
          <div
            className="stat-card"
            style={{
              background: "#0f2740",
              borderRadius: "12px",
              padding: "20px",
              border: "1px solid #2a4a77",
              boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
            }}
          >
            <div
              className="stat-icon-wrapper"
              style={{
                width: "50px",
                height: "50px",
                background: "#1e3a5f",
                borderRadius: "25px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "15px",
              }}
            >
              <i
                className="fas fa-bed"
                style={{ color: "#FFD700", fontSize: "24px" }}
              ></i>
            </div>
            <div className="stat-content">
              <h3
                className="stat-label"
                style={{ color: "#a3c6ff", marginBottom: "5px" }}
              >
                Hotels
              </h3>
              <p
                className="stat-value"
                style={{ color: "white", fontSize: "24px", fontWeight: "bold" }}
              >
                {hotels.length}
              </p>
            </div>
          </div>
          <div
            className="stat-card"
            style={{
              background: "#0f2740",
              borderRadius: "12px",
              padding: "20px",
              border: "1px solid #2a4a77",
              cursor: "pointer",
            }}
            onClick={() =>
              budget &&
              showToast(
                `💰 Total Budget: $${budget.total} | Daily: $${budget.daily}`,
              )
            }
          >
            <div
              className="stat-icon-wrapper"
              style={{
                width: "50px",
                height: "50px",
                background: "#1e3a5f",
                borderRadius: "25px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "15px",
              }}
            >
              <i
                className="fas fa-dollar-sign"
                style={{ color: "#FFD700", fontSize: "24px" }}
              ></i>
            </div>
            <div className="stat-content">
              <h3
                className="stat-label"
                style={{ color: "#a3c6ff", marginBottom: "5px" }}
              >
                Budget
              </h3>
              <p
                className="stat-value"
                style={{ color: "white", fontSize: "24px", fontWeight: "bold" }}
              >
                ${budget?.total || "..."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Budget Breakdown */}
      {budget && (
        <div
          style={{
            maxWidth: "1400px",
            margin: "0 auto 20px",
            padding: "0 20px",
          }}
        >
          <div
            style={{
              background: "#0f2740",
              borderRadius: "12px",
              padding: "20px",
              border: "1px solid #2a4a77",
            }}
          >
            <h3 style={{ color: "white", marginBottom: "15px" }}>
              <i
                className="fas fa-chart-pie"
                style={{ color: "#FFD700", marginRight: "10px" }}
              ></i>
              Budget Breakdown (Daily: ${budget.daily})
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                gap: "15px",
              }}
            >
              <div>
                <span style={{ color: "#a3c6ff" }}>🏨 Accommodation</span>
                <div style={{ color: "white", fontWeight: "bold" }}>
                  ${budget.breakdown.accommodation}
                </div>
              </div>
              <div>
                <span style={{ color: "#a3c6ff" }}>🍽️ Food</span>
                <div style={{ color: "white", fontWeight: "bold" }}>
                  ${budget.breakdown.food}
                </div>
              </div>
              <div>
                <span style={{ color: "#a3c6ff" }}>🎯 Activities</span>
                <div style={{ color: "white", fontWeight: "bold" }}>
                  ${budget.breakdown.activities}
                </div>
              </div>
              <div>
                <span style={{ color: "#a3c6ff" }}>🚗 Transport</span>
                <div style={{ color: "white", fontWeight: "bold" }}>
                  ${budget.breakdown.transport}
                </div>
              </div>
              <div>
                <span style={{ color: "#a3c6ff" }}>✨ Miscellaneous</span>
                <div style={{ color: "white", fontWeight: "bold" }}>
                  ${budget.breakdown.miscellaneous}
                </div>
              </div>
            </div>
            <div
              style={{
                marginTop: "15px",
                paddingTop: "15px",
                borderTop: "1px solid #2a4a77",
              }}
            >
              <span style={{ color: "#FFD700" }}>💡 Budget Tips:</span>
              <ul
                style={{
                  marginTop: "8px",
                  color: "#a3c6ff",
                  paddingLeft: "20px",
                }}
              >
                {budget.recommendations.slice(0, 3).map((rec, idx) => (
                  <li key={idx}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <div
        className="content-grid with-map"
        style={{
          display: "flex",
          gap: "30px",
          alignItems: "flex-start",
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "0 20px",
        }}
      >
        {/* LEFT SIDE - ITINERARY */}
        <div className="content-left" style={{ flex: 2, minWidth: "50%" }}>
          {/* DAY NAVIGATION */}
          <div
            className="day-navigation-card"
            style={{
              background: "#0f2740",
              borderRadius: "12px",
              padding: "20px",
              marginBottom: "20px",
              border: "1px solid #2a4a77",
            }}
          >
            <div
              className="day-nav-header"
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "20px",
              }}
            >
              <h2 style={{ color: "white" }}>
                <i
                  className="fas fa-calendar-alt"
                  style={{ color: "#FFD700", marginRight: "10px" }}
                ></i>{" "}
                Daily Itinerary
              </h2>
              <div
                className="duration-badge"
                style={{
                  background: "#1e3a5f",
                  color: "#FFD700",
                  padding: "5px 15px",
                  borderRadius: "20px",
                  border: "1px solid #3b5f8c",
                }}
              >
                {calculateDuration()} Days
              </div>
            </div>

            <div
              className="day-tabs"
              style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}
            >
              {itineraryDays.map((day, idx) => (
                <button
                  key={idx}
                  className={`day-tab ${activeDay === idx ? "active" : ""}`}
                  onClick={() => setActiveDay(idx)}
                  style={{
                    flex: "1",
                    minWidth: "100px",
                    padding: "12px",
                    background: activeDay === idx ? "#1e3a5f" : "#0a1929",
                    border:
                      activeDay === idx
                        ? "2px solid #FFD700"
                        : "1px solid #2a4a77",
                    borderRadius: "8px",
                    color: "white",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                >
                  <div className="day-tab-content">
                    <div className="day-number" style={{ fontWeight: "bold" }}>
                      Day {day.day || idx + 1}
                    </div>
                    <div
                      className="day-status"
                      style={{ fontSize: "12px", marginTop: "5px" }}
                    >
                      {idx === 0 && (
                        <span style={{ color: "#4CAF50" }}>🚀 Arrival</span>
                      )}
                      {idx === itineraryDays.length - 1 && (
                        <span style={{ color: "#ff6b6b" }}>🏁 Departure</span>
                      )}
                      {idx > 0 && idx < itineraryDays.length - 1 && (
                        <span style={{ color: "#FFD700" }}>🗺️ Explore</span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* ACTIVITY PLACES - WITH AGENT IMAGES */}
          <div
            className="timeline-card"
            style={{
              background: "#0f2740",
              borderRadius: "12px",
              padding: "20px",
              border: "1px solid #2a4a77",
            }}
          >
            <div
              className="timeline-header"
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "20px",
              }}
            >
              <h2 style={{ color: "white" }}>
                Day {itineraryDays[activeDay]?.day || activeDay + 1} – Places to
                Visit
              </h2>
              <div className="timeline-date" style={{ color: "#a3c6ff" }}>
                {formatDate(
                  new Date(payload.startDate).getTime() + activeDay * 86400000,
                )}
              </div>
            </div>

            {/* Place cards with images from ImageAgent */}
            <div
              className="places-container"
              style={{ display: "grid", gap: "20px" }}
            >
              {itineraryDays[activeDay]?.places?.map((place, idx) => (
                <div
                  key={idx}
                  className="place-card"
                  style={{
                    background: "#0a1929",
                    borderRadius: "12px",
                    overflow: "hidden",
                    border: "1px solid #2a4a77",
                    display: "flex",
                  }}
                >
                  <div
                    className="place-image"
                    style={{
                      width: "200px",
                      height: "150px",
                      position: "relative",
                    }}
                  >
                    <img
                      src={
                        placeImages[place.name] ||
                        `https://source.unsplash.com/400x300/?${encodeURIComponent(place.name)}`
                      }
                      alt={place.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = fallbackSVG;
                      }}
                    />
                  </div>
                  <div
                    className="place-content"
                    style={{ padding: "15px", flex: 1 }}
                  >
                    <h3
                      className="place-name"
                      style={{ color: "white", marginBottom: "10px" }}
                    >
                      {place.name}
                    </h3>
                    <p
                      className="place-description"
                      style={{ color: "#a3c6ff", marginBottom: "15px" }}
                    >
                      {place.description || "A must-visit location."}
                    </p>
                    {place.address && (
                      <p
                        className="place-address"
                        style={{
                          color: "#a3c6ff",
                          fontSize: "11px",
                          marginBottom: "10px",
                        }}
                      >
                        <i
                          className="fas fa-location-dot"
                          style={{ color: "#FFD700", marginRight: "5px" }}
                        ></i>
                        {place.address}
                      </p>
                    )}
                    <div className="place-actions">
                      <button
                        className="map-btn"
                        onClick={() => {
                          setSelectedMapActivity({
                            ...place,
                            lat: place.lat,
                            lng: place.lng,
                            destination: payload.destination,
                            selectedAt: Date.now(),
                          });

                          const dayIndex = itineraryDays.findIndex((day) =>
                            day.places?.some((p) => p.name === place.name),
                          );
                          if (dayIndex !== -1 && dayIndex !== activeDay) {
                            setActiveDay(dayIndex);
                            showToast(
                              `📅 Switched to Day ${dayIndex + 1} for ${place.name}`,
                            );
                          }
                        }}
                        style={{
                          background: "#1e3a5f",
                          border: "1px solid #3b5f8c",
                          color: "white",
                          padding: "8px 16px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <i
                          className="fas fa-map-marker-alt"
                          style={{ color: "#FFD700" }}
                        ></i>{" "}
                        View on Map
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* DAY TIPS */}
            {itineraryDays[activeDay]?.tips && (
              <div
                className="day-tips-card"
                style={{
                  marginTop: "20px",
                  padding: "15px",
                  background: "#1e3a5f",
                  borderRadius: "8px",
                  border: "1px solid #3b5f8c",
                }}
              >
                <div
                  className="tips-header"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "10px",
                  }}
                >
                  <div className="tips-icon">
                    <i
                      className="fas fa-lightbulb"
                      style={{ color: "#FFD700" }}
                    ></i>
                  </div>
                  <h3 style={{ color: "white" }}>Travel Tips for Today</h3>
                </div>
                <p className="tips-content" style={{ color: "#a3c6ff" }}>
                  {itineraryDays[activeDay].tips}
                </p>
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
            <div
              className="sidebar-card hotels-section"
              style={{
                background: "#0f2740",
                borderRadius: "12px",
                padding: "20px",
                border: "1px solid #2a4a77",
              }}
            >
              <div
                className="card-header"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "15px",
                  marginBottom: "20px",
                }}
              >
                <div
                  className="header-icon"
                  style={{
                    width: "40px",
                    height: "40px",
                    background: "#1e3a5f",
                    borderRadius: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <i className="fas fa-bed" style={{ color: "#FFD700" }}></i>
                </div>
                <div className="header-content">
                  <h3 style={{ color: "white", marginBottom: "5px" }}>
                    Recommended Stays
                  </h3>
                  <p className="card-subtitle" style={{ color: "#a3c6ff" }}>
                    Carefully selected for {payload.travelers}
                  </p>
                </div>
              </div>
              <div
                className="hotels-list"
                style={{ display: "grid", gap: "15px" }}
              >
                {hotels.map((hotel, idx) => (
                  <div
                    key={idx}
                    className="hotel-item"
                    style={{
                      background: "#0a1929",
                      borderRadius: "8px",
                      padding: "15px",
                      border: "1px solid #2a4a77",
                    }}
                  >
                    <div className="hotel-details">
                      <h4
                        className="hotel-name"
                        style={{ color: "white", marginBottom: "5px" }}
                      >
                        {hotel.name}
                      </h4>
                      {hotel.description && (
                        <p
                          style={{
                            color: "#a3c6ff",
                            fontSize: "12px",
                            marginBottom: "8px",
                          }}
                        >
                          {hotel.description}
                        </p>
                      )}
                      <div
                        className="hotel-info"
                        style={{
                          display: "flex",
                          gap: "15px",
                          marginBottom: "10px",
                        }}
                      >
                        <span
                          className="hotel-price"
                          style={{ color: "#FFD700", fontWeight: "bold" }}
                        >
                          {hotel.price}
                        </span>
                        <span
                          className="hotel-type"
                          style={{ color: "#a3c6ff" }}
                        >
                          {hotel.rating ? `★ ${hotel.rating}` : "Hotel"}
                        </span>
                      </div>
                      <div
                        className="hotel-features"
                        style={{
                          display: "flex",
                          gap: "10px",
                          flexWrap: "wrap",
                        }}
                      >
                        <span
                          className="feature-tag"
                          style={{ color: "#a3c6ff", fontSize: "11px" }}
                        >
                          <i
                            className="fas fa-wifi"
                            style={{ marginRight: "3px" }}
                          ></i>{" "}
                          WiFi
                        </span>
                        <span
                          className="feature-tag"
                          style={{ color: "#a3c6ff", fontSize: "11px" }}
                        >
                          <i
                            className="fas fa-swimming-pool"
                            style={{ marginRight: "3px" }}
                          ></i>{" "}
                          Pool
                        </span>
                        <span
                          className="feature-tag"
                          style={{ color: "#a3c6ff", fontSize: "11px" }}
                        >
                          <i
                            className="fas fa-utensils"
                            style={{ marginRight: "3px" }}
                          ></i>{" "}
                          Breakfast
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
            <div
              className="sidebar-card tips-section"
              style={{
                background: "#0f2740",
                borderRadius: "12px",
                padding: "20px",
                border: "1px solid #2a4a77",
              }}
            >
              <div
                className="card-header"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "15px",
                  marginBottom: "20px",
                }}
              >
                <div
                  className="header-icon"
                  style={{
                    width: "40px",
                    height: "40px",
                    background: "#1e3a5f",
                    borderRadius: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <i
                    className="fas fa-compass"
                    style={{ color: "#FFD700" }}
                  ></i>
                </div>
                <div className="header-content">
                  <h3 style={{ color: "white", marginBottom: "5px" }}>
                    Essential Tips
                  </h3>
                  <p className="card-subtitle" style={{ color: "#a3c6ff" }}>
                    For a smooth journey
                  </p>
                </div>
              </div>
              <div
                className="tips-list"
                style={{ display: "grid", gap: "15px" }}
              >
                {travelTips.map((tip, idx) => (
                  <div
                    key={idx}
                    className="tip-item"
                    style={{ display: "flex", gap: "15px" }}
                  >
                    <div
                      className="tip-number"
                      style={{
                        width: "24px",
                        height: "24px",
                        background: "#1e3a5f",
                        borderRadius: "12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#FFD700",
                        fontSize: "12px",
                      }}
                    >
                      {idx + 1}
                    </div>
                    <div
                      className="tip-content"
                      style={{ color: "#a3c6ff", flex: 1 }}
                    >
                      {tip}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PACKING LIST */}
          <div
            className="sidebar-card packing-section"
            style={{
              background: "#0f2740",
              borderRadius: "12px",
              padding: "20px",
              border: "1px solid #2a4a77",
            }}
          >
            <div
              className="card-header"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "15px",
                marginBottom: "20px",
              }}
            >
              <div
                className="header-icon"
                style={{
                  width: "40px",
                  height: "40px",
                  background: "#1e3a5f",
                  borderRadius: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <i
                  className="fas fa-suitcase-rolling"
                  style={{ color: "#FFD700" }}
                ></i>
              </div>
              <div className="header-content">
                <h3 style={{ color: "white", marginBottom: "5px" }}>
                  Packing Essentials
                </h3>
                <p className="card-subtitle" style={{ color: "#90acf7" }}>
                  For {payload.preferences}
                </p>
              </div>
            </div>
            <div
              className="packing-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
              }}
            >
              <div className="packing-category">
                <h4
                  className="category-title"
                  style={{ color: "#FFD700", marginBottom: "10px" }}
                >
                  Clothing
                </h4>
                <div
                  className="category-items"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <span className="packing-item" style={{ color: "#080809" }}>
                    ✓ Comfortable shoes
                  </span>
                  <span className="packing-item" style={{ color: "#000000" }}>
                    ✓ Weather layers
                  </span>
                  <span className="packing-item" style={{ color: "#070708" }}>
                    ✓ Swimwear
                  </span>
                </div>
              </div>
              <div className="packing-category">
                <h4
                  className="category-title"
                  style={{ color: "#FFD700", marginBottom: "10px" }}
                >
                  Essentials
                </h4>
                <div
                  className="category-items"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <span className="packing-item" style={{ color: "#020202" }}>
                    ✓ Travel adapter
                  </span>
                  <span className="packing-item" style={{ color: "#000000" }}>
                    ✓ Power bank
                  </span>
                  <span className="packing-item" style={{ color: "#070708" }}>
                    ✓ First aid kit
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* QUICK ACTIONS */}
          <div
            className="sidebar-card actions-section"
            style={{
              background: "#0f2740",
              borderRadius: "12px",
              padding: "20px",
              border: "1px solid #2a4a77",
            }}
          >
            <div
              className="card-header"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "15px",
                marginBottom: "20px",
              }}
            >
              <div
                className="header-icon"
                style={{
                  width: "40px",
                  height: "40px",
                  background: "#1e3a5f",
                  borderRadius: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <i className="fas fa-bolt" style={{ color: "#FFD700" }}></i>
              </div>
              <h3 style={{ color: "white" }}>Quick Actions</h3>
            </div>
            <div
              className="action-buttons-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
              }}
            >
              <button
                className="action-btn-card save"
                onClick={handleSave}
                disabled={saving}
                style={{
                  background: saving ? "#94a3b8" : "#1e3a5f",
                  border: "1px solid #3b5f8c",
                  color: "white",
                  padding: "12px",
                  borderRadius: "8px",
                  cursor: saving ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                {saving ? (
                  <i className="fas fa-spinner fa-spin"></i>
                ) : (
                  <i
                    className="fas fa-bookmark"
                    style={{ color: "#FFD700" }}
                  ></i>
                )}
                <span>{saving ? "Saving..." : "Save Trip"}</span>
              </button>
              <button
                className="action-btn-card export"
                onClick={() => window.print()}
                style={{
                  background: "#1e3a5f",
                  border: "1px solid #3b5f8c",
                  color: "white",
                  padding: "12px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  display: "flex",  
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                <i
                  className="fas fa-file-export"
                  style={{ color: "#FFD700" }}
                ></i>
                <span>Export PDF</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* AI FOOTER */}
      <div
        className="ai-footer"
        style={{
          marginTop: "40px",
          padding: "30px",
          background: "#0a1929",
          borderTop: "3px solid #2a4a77",
        }}
      >
        <div
          className="ai-footer-content"
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            gap: "30px",
            flexWrap: "wrap",
          }}
        >
          <div className="ai-footer-icon">
            <div className="ai-glow"></div>
            <i
              className="fas fa-robot"
              style={{ fontSize: "48px", color: "#FFD700" }}
            ></i>
          </div>
          <div
            className="ai-footer-text"
            style={{ flex: 1, minWidth: "300px" }}
          >
            <h4 style={{ color: "white", marginBottom: "10px" }}>
              ✨ AI-Powered Itinerary
            </h4>
            <p style={{ color: "#a3c6ff" }}>
              This personalized journey was crafted by multiple AI agents:
              <strong style={{ color: "#FFD700" }}>
                {" "}
                Itinerary Agent
              </strong>{" "}
              planned your days,
              <strong style={{ color: "#FFD700" }}> Budget Agent</strong>{" "}
              optimized your expenses,
              <strong style={{ color: "#FFD700" }}> Map Agent</strong> located
              all places, and
              <strong style={{ color: "#FFD700" }}> Image Agent</strong> found
              beautiful photos. Tailored specifically for {payload.travelers}{" "}
              interested in {payload.preferences}.
            </p>
          </div>
          <div
            className="ai-footer-actions"
            style={{ display: "flex", gap: "15px" }}
          >
            <button
              className="ai-feedback-btn"
              onClick={() => showToast("Thanks for your feedback! 👍")}
              style={{
                background: "#1e3a5f",
                border: "1px solid #3b5f8c",
                color: "white",
                padding: "12px 24px",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              <i
                className="fas fa-thumbs-up"
                style={{ marginRight: "8px", color: "#FFD700" }}
              ></i>{" "}
              Like this plan?
            </button>
            <button
              className="ai-regenerate-btn"
              onClick={handleRetry}
              style={{
                background: "#2a4a77",
                border: "1px solid #3b5f8c",
                color: "white",
                padding: "12px 24px",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              <i className="fas fa-sync-alt" style={{ marginRight: "8px" }}></i>{" "}
              Regenerate
            </button>
          </div>
        </div>
      </div>

      {/* Animation styles */}
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