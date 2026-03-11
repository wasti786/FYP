import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  const handleSave = () => showToast("✅ Itinerary saved to your trips!");
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
    <div className="generate-plan-container" style={{ paddingTop: "74px" }}>
      {/* Toast Notification */}
      {toast && (
        <div className="toast-notification">
          <div className="toast-content">
            <i className="fas fa-check-circle toast-icon"></i>
            <span className="toast-text">{toast}</span>
          </div>
          <div className="toast-progress"></div>
        </div>
      )}

      {/* Floating Action Button */}
      <button className="floating-action-btn" onClick={handleSave}>
        <i className="fas fa-bookmark"></i>
        <span className="fab-tooltip">Save Itinerary</span>
      </button>

      {/* HEADER */}
      <div className="plan-header">
        <div className="header-background">
          <div className="header-gradient"></div>
          <div className="header-map-effect"></div>
        </div>
        <div className="header-content-wrapper">
          <button onClick={handleBack} className="back-to-planner">
            <div className="back-icon">
              <i className="fas fa-arrow-left"></i>
            </div>
            <span className="back-text">Back to Planner</span>
          </button>

          <div className="header-main">
            <div className="destination-badge">
              <i className="fas fa-map-marker-alt badge-icon"></i>
              <span className="badge-text">Your Journey to</span>
            </div>
            <h1 className="destination-title">{payload.destination}</h1>
            <div className="header-meta">
              <div className="meta-item">
                <i className="fas fa-calendar-alt"></i>
                <span>
                  {formatDate(payload.startDate)} →{" "}
                  {formatDate(payload.endDate)}
                </span>
              </div>
              <div className="meta-item">
                <i className="fas fa-users"></i>
                <span>{payload.travelers}</span>
              </div>
              <div className="meta-item">
                <i className="fas fa-tag"></i>
                <span>{budget} Budget</span>
              </div>
            </div>
          </div>

          <div className="header-actions">
            <div className="action-buttons-header">
              <button className="action-btn-header share" onClick={handleShare}>
                <i className="fas fa-share-alt"></i>
                <span>Share</span>
              </button>
              <button
                className="action-btn-header print"
                onClick={() => window.print()}
              >
                <i className="fas fa-print"></i>
                <span>Print</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* TRIP STATS */}
      <div className="trip-stats-container">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon-wrapper">
              <i className="fas fa-clock"></i>
            </div>
            <div className="stat-content">
              <h3 className="stat-label">Trip Duration</h3>
              <p className="stat-value">{calculateDuration()} Days</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon-wrapper">
              <i className="fas fa-hiking"></i>
            </div>
            <div className="stat-content">
              <h3 className="stat-label">Activities</h3>
              <p className="stat-value">{itineraryDays.length * 3}+</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon-wrapper">
              <i className="fas fa-bed"></i>
            </div>
            <div className="stat-content">
              <h3 className="stat-label">Hotels</h3>
              <p className="stat-value">{hotels.length}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon-wrapper">
              <i className="fas fa-lightbulb"></i>
            </div>
            <div className="stat-content">
              <h3 className="stat-label">AI Generated</h3>
              <p className="stat-value">100% Custom</p>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div
        className="content-grid with-map"
        style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}
      >
        {/* LEFT SIDE - ITINERARY */}
        <div className="content-left" style={{ flex: 2, minWidth: "50%" }}>
          {/* DAY NAVIGATION */}
          <div className="day-navigation-card">
            <div className="day-nav-header">
              <h2>
                <i className="fas fa-calendar-alt"></i> Daily Itinerary
              </h2>
              <div className="duration-badge">{calculateDuration()} Days</div>
            </div>

            <div className="day-tabs">
              {itineraryDays.map((day, idx) => (
                <button
                  key={idx}
                  className={`day-tab ${activeDay === idx ? "active" : ""}`}
                  onClick={() => setActiveDay(idx)}
                >
                  <div className="day-tab-content">
                    <div className="day-number">Day {day.day || idx + 1}</div>
                    <div className="day-status">
                      {idx === 0 && (
                        <span className="status-badge arrival">Arrival</span>
                      )}
                      {idx === itineraryDays.length - 1 && (
                        <span className="status-badge departure">
                          Departure
                        </span>
                      )}
                      {idx > 0 && idx < itineraryDays.length - 1 && (
                        <span className="status-badge explore">Explore</span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
            {/* Time filter section removed */}
          </div>

          {/* ACTIVITY PLACES */}
          <div className="timeline-card">
            <div className="timeline-header">
              <h2>
                Day {itineraryDays[activeDay]?.day || activeDay + 1} – Places to
                Visit
              </h2>
              <div className="timeline-date">
                {formatDate(
                  new Date(payload.startDate).getTime() + activeDay * 86400000,
                )}
              </div>
            </div>

            {/* Place cards */}
            <div className="places-container">
              {itineraryDays[activeDay]?.places?.map((place, idx) => (
                <div key={idx} className="place-card">
                  <div className="place-image">
                    <img
                      src={`https://source.unsplash.com/400x300/?${encodeURIComponent(
                        (place.imageQuery || place.name).replace(/\s+/g, ","),
                      )}`}
                      alt={place.name}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.onerror = null; // prevent infinite loop
                        e.currentTarget.src = fallbackSVG; // or "/images/no-image.jpg"
                      }}
                    />
                  </div>
                  <div className="place-content">
                    <h3 className="place-name">{place.name}</h3>
                    <p className="place-description">
                      {place.description || "A must-visit location."}
                    </p>
                    <div className="place-actions">
                      <button
                        className="map-btn"
                        onClick={() => setSelectedMapActivity(place)}
                      >
                        <i className="fas fa-map-marker-alt"></i> View on Map
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* DAY TIPS */}
            {itineraryDays[activeDay]?.tips && (
              <div className="day-tips-card">
                <div className="tips-header">
                  <div className="tips-icon">
                    <i className="fas fa-lightbulb"></i>
                  </div>
                  <h3>Travel Tips for Today</h3>
                </div>
                <p className="tips-content">{itineraryDays[activeDay].tips}</p>
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
            />
          </div>

          {/* HOTELS SECTION */}
          {hotels.length > 0 && (
            <div className="sidebar-card hotels-section">
              <div className="card-header">
                <div className="header-icon">
                  <i className="fas fa-bed"></i>
                </div>
                <div className="header-content">
                  <h3>Recommended Stays</h3>
                  <p className="card-subtitle">
                    Carefully selected for {payload.travelers}
                  </p>
                </div>
              </div>
              <div className="hotels-list">
                {hotels.map((hotel, idx) => (
                  <div key={idx} className="hotel-item">
                    <div className="hotel-image-placeholder">
                      <div className="hotel-rating">
                        <i className="fas fa-star"></i>
                        <span>4.5</span>
                      </div>
                    </div>
                    <div className="hotel-details">
                      <h4 className="hotel-name">{hotel.name}</h4>
                      <div className="hotel-info">
                        <span className="hotel-price">{hotel.price}</span>
                        <span className="hotel-type">4-star Hotel</span>
                      </div>
                      <div className="hotel-features">
                        <span className="feature-tag">
                          <i className="fas fa-wifi"></i> WiFi
                        </span>
                        <span className="feature-tag">
                          <i className="fas fa-swimming-pool"></i> Pool
                        </span>
                        <span className="feature-tag">
                          <i className="fas fa-utensils"></i> Breakfast
                        </span>
                      </div>
                      <button className="hotel-view-btn">
                        <span>View Details</span>
                        <i className="fas fa-arrow-right"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TRAVEL TIPS */}
          {travelTips.length > 0 && (
            <div className="sidebar-card tips-section">
              <div className="card-header">
                <div className="header-icon">
                  <i className="fas fa-compass"></i>
                </div>
                <div className="header-content">
                  <h3>Essential Tips</h3>
                  <p className="card-subtitle">For a smooth journey</p>
                </div>
              </div>
              <div className="tips-list">
                {travelTips.map((tip, idx) => (
                  <div key={idx} className="tip-item">
                    <div className="tip-number">{idx + 1}</div>
                    <div className="tip-content">{tip}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PACKING LIST */}
          <div className="sidebar-card packing-section">
            <div className="card-header">
              <div className="header-icon">
                <i className="fas fa-suitcase-rolling"></i>
              </div>
              <div className="header-content">
                <h3>Packing Essentials</h3>
                <p className="card-subtitle">For {payload.preferences}</p>
              </div>
            </div>
            <div className="packing-grid">
              <div className="packing-category">
                <h4 className="category-title">Clothing</h4>
                <div className="category-items">
                  <span className="packing-item">Comfortable shoes</span>
                  <span className="packing-item">Weather layers</span>
                  <span className="packing-item">Swimwear</span>
                </div>
              </div>
              <div className="packing-category">
                <h4 className="category-title">Essentials</h4>
                <div className="category-items">
                  <span className="packing-item">Travel adapter</span>
                  <span className="packing-item">Power bank</span>
                  <span className="packing-item">First aid kit</span>
                </div>
              </div>
            </div>
          </div>

          {/* QUICK ACTIONS */}
          <div className="sidebar-card actions-section">
            <div className="card-header">
              <div className="header-icon">
                <i className="fas fa-bolt"></i>
              </div>
              <h3>Quick Actions</h3>
            </div>
            <div className="action-buttons-grid">
              <button className="action-btn-card save" onClick={handleSave}>
                <i className="fas fa-bookmark"></i>
                <span>Save Trip</span>
              </button>
              <button
                className="action-btn-card export"
                onClick={() => window.print()}
              >
                <i className="fas fa-file-export"></i>
                <span>Export PDF</span>
              </button>
              <button className="action-btn-card calendar">
                <i className="fas fa-calendar-plus"></i>
                <span>Add to Calendar</span>
              </button>
              <button className="action-btn-card customize">
                <i className="fas fa-sliders-h"></i>
                <span>Customize</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* AI FOOTER */}
      <div className="ai-footer">
        <div className="ai-footer-content">
          <div className="ai-footer-icon">
            <div className="ai-glow"></div>
            <i className="fas fa-robot"></i>
          </div>
          <div className="ai-footer-text">
            <h4>✨ AI-Powered Itinerary</h4>
            <p>
              This personalized journey was crafted by artificial intelligence,
              tailored specifically for {payload.travelers} interested in{" "}
              {payload.preferences}. The itinerary optimizes your experience in{" "}
              {payload.destination} with smart scheduling and local insights.
            </p>
          </div>
        </div>
        <div className="ai-footer-actions">
          <button className="ai-feedback-btn">
            <i className="fas fa-thumbs-up"></i> Like this plan?
          </button>
          <button className="ai-regenerate-btn" onClick={handleRetry}>
            <i className="fas fa-sync-alt"></i> Regenerate
          </button>
        </div>
      </div>
    </div>
  );
}
