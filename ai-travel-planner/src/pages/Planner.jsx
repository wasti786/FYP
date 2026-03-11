import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom"; // ADD THIS IMPORT
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import "../CSS/Planner.css";

export default function Planner() {
  const { currentUser } = useAuth();
  const navigate = useNavigate(); // ADD THIS HOOK
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
  const [editingTrip, setEditingTrip] = useState(null);
  const [editForm, setEditForm] = useState({});

  // Dropdown options
  const interestOptions = [
    "Adventure",
    "Relaxation",
    "Culture",
    "Beach",
    "Mountains",
    "City Tour",
    "History",
    "Nature",
    "Wildlife",
    "Sports",
    "Luxury",
  ];

  const travelerOptions = [
    "Solo Travel",
    "Couple (2 people)",
    "Family (3-4 people)",
    "Group (5-8 people)",
    "Large Group (9+ people)",
  ];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // NEW FUNCTION: Handle AI Plan Generation
  // In Planner.jsx - Update the handleGeneratePlan function:

  const handleGeneratePlan = () => {
    // Validate all required fields
    const errors = [];

    if (!form.destination?.trim()) {
      errors.push("Destination is required");
    }

    if (!form.startDate) {
      errors.push("Start date is required");
    }

    if (!form.endDate) {
      errors.push("End date is required");
    }

    if (!form.interests) {
      errors.push("Please select your interests");
    }

    if (!form.travelers) {
      errors.push("Please select number of travelers");
    }

    // Validate date logic
    if (form.startDate && form.endDate) {
      const start = new Date(form.startDate);
      const end = new Date(form.endDate);
      if (end <= start) {
        errors.push("End date must be after start date");
      }
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
    };

    // Save inputs locally for persistence
    localStorage.setItem("tripInput", JSON.stringify(tripData));

    // Navigate to AI generation page
    navigate("/generate-plan", { state: tripData });
  };

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
        where("uid", "==", currentUser.uid),
      );
      const querySnapshot = await getDocs(q);
      const trips = [];
      querySnapshot.forEach((docSnap) => {
        trips.push({ id: docSnap.id, ...docSnap.data() });
      });
      setSavedTrips(trips);
    } catch (err) {
      console.error("Error fetching trips:", err);
      setMessage("Error fetching your trips.");
    }
  };

  const handleEditClick = (trip) => {
    setEditingTrip(trip.id);
    setEditForm({ ...trip });
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleCancelEdit = () => {
    setEditingTrip(null);
    setEditForm({});
  };

  const handleUpdate = async (id) => {
    try {
      const tripRef = doc(db, "trips", id);
      await updateDoc(tripRef, {
        destination: editForm.destination,
        startDate: editForm.startDate,
        endDate: editForm.endDate,
        interests: editForm.interests,
        travelers: editForm.travelers,
      });
      setMessage("Trip updated successfully!");
      setEditingTrip(null);
      fetchUserTrips();
    } catch (err) {
      console.error("Error updating trip:", err);
      setMessage("Error updating trip.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this trip?")) return;
    try {
      await deleteDoc(doc(db, "trips", id));
      setMessage("Trip deleted successfully!");
      fetchUserTrips();
    } catch (err) {
      console.error("Error deleting trip:", err);
      setMessage("Error deleting trip.");
    }
  };

  useEffect(() => {
    if (currentUser) fetchUserTrips();
  }, [currentUser]);

  return (
    <div className="planner-container">
      <div className="container">
        {/* Header */}
        <div className="planner-header">
          <h1 className="planner-title">Plan Your Next Adventure</h1>
          <p className="planner-subtitle">
            Create unforgettable memories with AI-powered trip planning
          </p>
        </div>

        {/* Tabs */}
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
                onClick={() => setActiveTab("saved")}
              >
                <i className="fas fa-bookmark"></i>
                My Trips ({savedTrips.length})
              </button>
            </li>
          </ul>
        </div>

        {/* Plan New Trip Section */}
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
                {/* Destination */}
                <div className="form-group-full">
                  <label className="planner-label">Destination</label>
                  <input
                    name="destination"
                    type="text"
                    value={form.destination}
                    onChange={handleChange}
                    className="planner-input"
                    placeholder="Where do you want to go? e.g., Paris, Skardu, Japan..."
                  />
                </div>

                {/* Dates */}
                <div className="planner-form-group">
                  <label className="planner-label">Start Date</label>
                  <input
                    name="startDate"
                    type="date"
                    value={form.startDate}
                    onChange={handleChange}
                    className="planner-input"
                  />
                </div>

                <div className="planner-form-group">
                  <label className="planner-label">End Date</label>
                  <input
                    name="endDate"
                    type="date"
                    value={form.endDate}
                    onChange={handleChange}
                    className="planner-input"
                  />
                </div>

                {/* Interests & Travelers - Updated to dropdowns */}
                <div className="planner-form-group">
                  <label className="planner-label">Interests</label>
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

                <div className="planner-form-group">
                  <label className="planner-label">Travelers</label>
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
              </div>

              {/* AI Button - CHANGED TO handleGeneratePlan */}
              <button
                onClick={handleGeneratePlan}
                className="planner-ai-button"
                disabled={
                  !form.destination ||
                  !form.startDate ||
                  !form.endDate ||
                  !form.interests ||
                  !form.travelers
                }
              >
                <i className="fas fa-magic"></i>
                Generate AI Travel Plan
              </button>

              {/* Optional Save Button for logged-in users */}
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
                    cursor:
                      loading || !form.destination ? "not-allowed" : "pointer",
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
                    message.includes("Error")
                      ? "message-error"
                      : "message-success"
                  }`}
                >
                  {message}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Saved Trips Section */}
        {activeTab === "saved" && (
          <div className="saved-trips-section">
            {savedTrips.length > 0 ? (
              <div className="saved-trips-grid">
                {savedTrips.map((trip) => (
                  <div key={trip.id} className="trip-card">
                    {editingTrip === trip.id ? (
                      <div className="trip-edit-form">
                        <div className="edit-form-grid">
                          <input
                            type="text"
                            name="destination"
                            value={editForm.destination}
                            onChange={handleEditChange}
                            className="planner-input"
                            placeholder="Destination"
                          />
                          <input
                            type="date"
                            name="startDate"
                            value={editForm.startDate}
                            onChange={handleEditChange}
                            className="planner-input"
                          />
                          <input
                            type="date"
                            name="endDate"
                            value={editForm.endDate}
                            onChange={handleEditChange}
                            className="planner-input"
                          />

                          {/* Updated edit form dropdowns */}
                          <select
                            name="interests"
                            value={editForm.interests || ""}
                            onChange={handleEditChange}
                            className="planner-input"
                          >
                            <option value="">Select your interests...</option>
                            {interestOptions.map((interest, index) => (
                              <option key={index} value={interest}>
                                {interest}
                              </option>
                            ))}
                          </select>

                          <select
                            name="travelers"
                            value={editForm.travelers || ""}
                            onChange={handleEditChange}
                            className="planner-input"
                          >
                            <option value="">
                              Select number of travelers...
                            </option>
                            {travelerOptions.map((option, index) => (
                              <option key={index} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="edit-form-actions">
                          <button
                            className="save-edit-btn"
                            onClick={() => handleUpdate(trip.id)}
                          >
                            Save Changes
                          </button>
                          <button
                            className="cancel-edit-btn"
                            onClick={handleCancelEdit}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="trip-card-header">
                          <h3 className="trip-card-title">
                            <i className="fas fa-map-marker-alt"></i>
                            {trip.destination}
                          </h3>
                          <div className="trip-card-dates">
                            {trip.startDate} → {trip.endDate}
                          </div>
                        </div>
                        <div className="trip-card-body">
                          <div className="trip-card-detail">
                            <i className="fas fa-heart"></i>
                            <span>
                              {trip.interests || "No interests specified"}
                            </span>
                          </div>
                          <div className="trip-card-detail">
                            <i className="fas fa-users"></i>
                            <span>{trip.travelers || "Not specified"}</span>
                          </div>
                          <div className="trip-card-actions">
                            <button
                              className="trip-action-btn trip-edit-btn"
                              onClick={() => handleEditClick(trip)}
                            >
                              <i className="fas fa-edit"></i>
                              Edit
                            </button>
                            <button
                              className="trip-action-btn trip-delete-btn"
                              onClick={() => handleDelete(trip.id)}
                            >
                              <i className="fas fa-trash-alt"></i>
                              Delete
                            </button>
                          </div>
                        </div>
                      </>
                    )}
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
                  Start planning your first adventure and let AI create the
                  perfect itinerary for you.
                </p>
                <button
                  className="empty-state-btn"
                  onClick={() => setActiveTab("plan")}
                >
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
