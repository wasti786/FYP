import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
} from "firebase/firestore";

export default function Planner() {
  const { currentUser } = useAuth();
  const saved = JSON.parse(localStorage.getItem("tripInput") || "{}");
  const [form, setForm] = useState({
    destination: saved.destination || "",
    startDate: "",
    endDate: "",
    interests: "",
    travelers: "",
  });
  const [message, setMessage] = useState("");
  const [savedTrips, setSavedTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("plan");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!currentUser) {
      setMessage("Please login to save trips.");
      return;
    }

    setLoading(true);
    try {
      const docRef = await addDoc(collection(db, "trips"), {
        uid: currentUser.uid,
        destination: form.destination,
        startDate: form.startDate,
        endDate: form.endDate,
        interests: form.interests,
        travelers: form.travelers,
        createdAt: serverTimestamp(),
      });
      setMessage("Trip saved successfully!");
      // Clear form after successful save
      setForm({
        destination: "",
        startDate: "",
        endDate: "",
        interests: "",
        travelers: "",
      });
      localStorage.removeItem("tripInput");
      fetchUserTrips();
    } catch (err) {
      setMessage("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserTrips = async () => {
    if (!currentUser) return;

    try {
      const q = query(
        collection(db, "trips"),
        where("uid", "==", currentUser.uid)
      );
      const querySnapshot = await getDocs(q);
      const trips = [];
      querySnapshot.forEach((doc) => {
        trips.push({ id: doc.id, ...doc.data() });
      });
      setSavedTrips(trips);
    } catch (err) {
      console.error("Error fetching trips: ", err);
      setMessage("Error fetching your trips.");
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchUserTrips();
    }
  }, [currentUser]);

  return (
    <div className="planner-container">
      <div className="container py-5">
        {/* Header */}
        <div className="text-center mb-5">
          <h1 className="display-5 fw-bold text-dark mb-3">
            Plan Your Next Adventure
          </h1>
          <p className="text-muted">
            Create unforgettable memories with AI-powered trip planning
          </p>
        </div>

        {/* Tabs */}
        <div className="row justify-content-center mb-4">
          <div className="col-lg-8">
            <ul className="nav nav-pills nav-justified mb-4">
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === "plan" ? "active" : ""}`}
                  onClick={() => setActiveTab("plan")}
                >
                  <i className="fas fa-plus-circle me-2"></i>Plan New Trip
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${
                    activeTab === "saved" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("saved")}
                >
                  <i className="fas fa-bookmark me-2"></i>My Trips (
                  {savedTrips.length})
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Plan New Trip Section */}
        {activeTab === "plan" && (
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="card shadow border-0 rounded-4 trip-card">
                <div className="card-body p-5">
                  <h3 className="fw-bold text-dark mb-4">Plan a new trip</h3>

                  <div className="row g-4">
                    <div className="col-md-12">
                      <label
                        htmlFor="destination"
                        className="form-label fw-semibold"
                      >
                        Where to? *
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-transparent border-end-0">
                          <i className="fas fa-map-marker-alt text-primary"></i>
                        </span>
                        <input
                          name="destination"
                          value={form.destination}
                          onChange={handleChange}
                          className="form-control border-start-0 py-3"
                          placeholder="e.g., Paris, Hawaii, Japan"
                          id="destination"
                          required
                        />
                      </div>
                    </div>

                    <div className="col-md-6">
                      <label
                        htmlFor="startDate"
                        className="form-label fw-semibold"
                      >
                        Start Date
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-transparent border-end-0">
                          <i className="fas fa-calendar-alt text-primary"></i>
                        </span>
                        <input
                          name="startDate"
                          type="date"
                          value={form.startDate}
                          onChange={handleChange}
                          className="form-control border-start-0 py-3"
                          id="startDate"
                        />
                      </div>
                    </div>

                    <div className="col-md-6">
                      <label
                        htmlFor="endDate"
                        className="form-label fw-semibold"
                      >
                        End Date
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-transparent border-end-0">
                          <i className="fas fa-calendar-alt text-primary"></i>
                        </span>
                        <input
                          name="endDate"
                          type="date"
                          value={form.endDate}
                          onChange={handleChange}
                          className="form-control border-start-0 py-3"
                          id="endDate"
                        />
                      </div>
                    </div>

                    <div className="col-md-6">
                      <label
                        htmlFor="interests"
                        className="form-label fw-semibold"
                      >
                        Interests
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-transparent border-end-0">
                          <i className="fas fa-heart text-primary"></i>
                        </span>
                        <select
                          name="interests"
                          value={form.interests}
                          onChange={handleChange}
                          className="form-control border-start-0 py-3"
                          id="interests"
                        >
                          <option value="">Select interests</option>
                          <option value="adventure">Adventure</option>
                          <option value="relaxation">Relaxation</option>
                          <option value="culture">Culture</option>
                          <option value="food">Food & Dining</option>
                          <option value="shopping">Shopping</option>
                          <option value="nature">Nature</option>
                        </select>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <label
                        htmlFor="travelers"
                        className="form-label fw-semibold"
                      >
                        Travelers
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-transparent border-end-0">
                          <i className="fas fa-users text-primary"></i>
                        </span>
                        <select
                          name="travelers"
                          value={form.travelers}
                          onChange={handleChange}
                          className="form-control border-start-0 py-3"
                          id="travelers"
                        >
                          <option value="">Number of travelers</option>
                          <option value="1">1 traveler</option>
                          <option value="2">2 travelers</option>
                          <option value="3">3 travelers</option>
                          <option value="4">4 travelers</option>
                          <option value="5+">5+ travelers</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5">
                    <button
                      onClick={handleSave}
                      className="btn btn-primary btn-lg w-100 py-3 fw-semibold"
                      disabled={loading || !form.destination}
                    >
                      {loading ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Creating Your Trip...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-magic me-2"></i>Start Planning
                          with AI
                        </>
                      )}
                    </button>
                  </div>

                  {message && (
                    <div
                      className={`alert ${
                        message.includes("Error")
                          ? "alert-danger"
                          : "alert-success"
                      } mt-4`}
                    >
                      {message}
                    </div>
                  )}

                  <div className="text-center mt-4">
                    <p className="text-muted">
                      Or{" "}
                      <a href="#" className="text-primary">
                        write a new guide
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Saved Trips Section */}
        {activeTab === "saved" && (
          <div className="row justify-content-center">
            <div className="col-lg-10">
              {savedTrips.length > 0 ? (
                <div className="row">
                  <div className="col-12 mb-4">
                    <h3 className="fw-bold text-dark">Your Saved Trips</h3>
                  </div>
                  {savedTrips.map((trip) => (
                    <div key={trip.id} className="col-md-6 col-lg-4 mb-4">
                      <div className="card trip-card h-100 border-0 shadow-sm">
                        <div className="card-img-top trip-img">
                          <div className="trip-destination">
                            {trip.destination}
                          </div>
                        </div>
                        <div className="card-body">
                          <h5 className="card-title">{trip.destination}</h5>
                          <div className="trip-details">
                            {trip.startDate && (
                              <div className="detail-item">
                                <i className="fas fa-calendar me-2 text-primary"></i>
                                {trip.startDate}{" "}
                                {trip.endDate && `- ${trip.endDate}`}
                              </div>
                            )}
                            {trip.interests && (
                              <div className="detail-item">
                                <i className="fas fa-heart me-2 text-primary"></i>
                                {trip.interests}
                              </div>
                            )}
                            {trip.travelers && (
                              <div className="detail-item">
                                <i className="fas fa-users me-2 text-primary"></i>
                                {trip.travelers}{" "}
                                {trip.travelers === "1"
                                  ? "traveler"
                                  : "travelers"}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="card-footer bg-transparent border-0">
                          <div className="d-flex justify-content-between align-items-center">
                            <small className="text-muted">
                              Created:{" "}
                              {trip.createdAt?.toDate
                                ? trip.createdAt.toDate().toLocaleDateString()
                                : "Unknown date"}
                            </small>
                            <button className="btn btn-sm btn-outline-primary">
                              <i className="fas fa-edit me-1"></i>Edit
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-5">
                  <div className="empty-state">
                    <i className="fas fa-compass fa-3x text-muted mb-3"></i>
                    <h4 className="text-dark">No trips yet</h4>
                    <p className="text-muted">
                      Start planning your first adventure!
                    </p>
                    <button
                      className="btn btn-primary mt-2"
                      onClick={() => setActiveTab("plan")}
                    >
                      Plan Your First Trip
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

       
      </div>

       {/* Footer */}
        <footer
          className="py-5"
          style={{ backgroundColor: "#0d1b2a", color: "#e5e9f0" }}
        >
          <div className="container">
            <div className="row align-items-start">
              {/* Logo + About */}
              <div className="col-lg-4 mb-4">
                <div className="mb-3">
                  <img
                    src=""
                    alt="TravelPlanner AI"
                    style={{ maxHeight: "60px" }}
                  />
                </div>
                <p className="mb-3" style={{ color: "#b0bec5" }}>
                  Your journey to smarter trips begins with us. Discover amazing
                  destinations and plan effortlessly with AI.
                </p>
                <div className="d-flex gap-3">
                  <a href="#" className="text-light fs-5">
                    <i className="fab fa-facebook-f"></i>
                  </a>
                  <a href="#" className="text-light fs-5">
                    <i className="fab fa-instagram"></i>
                  </a>
                  <a href="#" className="text-light fs-5">
                    <i className="fab fa-x-twitter"></i>
                  </a>
                  <a href="#" className="text-light fs-5">
                    <i className="fab fa-youtube"></i>
                  </a>
                </div>
              </div>

              {/* Quick Links */}
              <div className="col-lg-3 mb-4">
                <h6 className="fw-semibold mb-3 text-light">Quick Links</h6>
                <ul className="list-unstyled">
                  <li>
                    <a
                      href="#"
                      className="text-decoration-none"
                      style={{ color: "#b0bec5" }}
                    >
                      Home
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-decoration-none"
                      style={{ color: "#b0bec5" }}
                    >
                      Photography
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-decoration-none"
                      style={{ color: "#b0bec5" }}
                    >
                      Seasons
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-decoration-none"
                      style={{ color: "#b0bec5" }}
                    >
                      Stories
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-decoration-none"
                      style={{ color: "#b0bec5" }}
                    >
                      Book Now
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-decoration-none"
                      style={{ color: "#b0bec5" }}
                    >
                      Travel Blog
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-decoration-none"
                      style={{ color: "#b0bec5" }}
                    >
                      About Us
                    </a>
                  </li>
                </ul>
              </div>

              {/* Popular Tours */}
              <div className="col-lg-3 mb-4">
                <h6 className="fw-semibold mb-3 text-light">Popular Tours</h6>
                <ul className="list-unstyled">
                  <li>
                    <a
                      href="#"
                      className="text-decoration-none"
                      style={{ color: "#b0bec5" }}
                    >
                      Hunza Valley Explorer
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-decoration-none"
                      style={{ color: "#b0bec5" }}
                    >
                      Skardu & Deosai Adventure
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-decoration-none"
                      style={{ color: "#b0bec5" }}
                    >
                      Fairy Meadows Trek
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-decoration-none"
                      style={{ color: "#b0bec5" }}
                    >
                      K2 Base Camp Expedition
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-decoration-none"
                      style={{ color: "#b0bec5" }}
                    >
                      Khaplu Valley Cultural Tour
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-decoration-none"
                      style={{ color: "#b0bec5" }}
                    >
                      Northern Pakistan Grand Tour
                    </a>
                  </li>
                </ul>
              </div>

              {/* Contact */}
              <div className="col-lg-2 mb-4">
                <h6 className="fw-semibold mb-3 text-light">Contact Us</h6>
                <p className="mb-2" style={{ color: "#b0bec5" }}>
                  <i className="fas fa-phone-alt me-2"></i> +92 3554713444
                </p>
                <p className="mb-2" style={{ color: "#b0bec5" }}>
                  <i className="fas fa-envelope me-2"></i>{" "}
                  info@travelplanner.com
                </p>
                <p className="mb-0" style={{ color: "#b0bec5" }}>
                  <i className="fas fa-map-marker-alt me-2"></i> Airport Rd,
                  Skardu, Gilgit Baltistan
                </p>
              </div>
            </div>

            <hr className="border-secondary my-4" />
            <div className="d-flex flex-wrap justify-content-between align-items-center">
              <p className="mb-0" style={{ color: "#b0bec5" }}>
                © 2025 TravelPlanner AI. All rights reserved.
              </p>
              <div className="d-flex gap-3">
                <a
                  href="#"
                  className="text-decoration-none"
                  style={{ color: "#b0bec5" }}
                >
                  Privacy Policy
                </a>
                <a
                  href="#"
                  className="text-decoration-none"
                  style={{ color: "#b0bec5" }}
                >
                  Terms of Service
                </a>
                <a
                  href="#"
                  className="text-decoration-none"
                  style={{ color: "#b0bec5" }}
                >
                  Cookie Policy
                </a>
              </div>
            </div>
          </div>
        </footer>
    </div>
  );
}
