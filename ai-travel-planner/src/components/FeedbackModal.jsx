import React, { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function FeedbackModal({ isOpen, onClose, onSuccess }) {
  const [form, setForm] = useState({ name: "", location: "", country: "", message: "", rating: 5 });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.message.trim()) return;
    setLoading(true);
    try {
      await addDoc(collection(db, "feedbacks"), {
        name: form.name || "Anonymous",
        location: form.location || "",
        country: form.country || "",
        rating: Number(form.rating) || 0,
        message: form.message,
        createdAt: serverTimestamp(),
      });
      setForm({ name: "", location: "", country: "", message: "", rating: 5 });
      onSuccess && onSuccess();
      onClose && onClose();
    } catch (err) {
      console.error("Failed to save feedback", err);
      alert("Failed to submit feedback. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="feedback-modal-overlay">
      <div className="feedback-modal">
        <button className="modal-close" onClick={onClose}>×</button>
        <h3>Share your feedback</h3>
        <form className="feedback-form" onSubmit={handleSubmit}>
          <input name="name" placeholder="Your name" value={form.name} onChange={handleChange} />
          <input name="location" placeholder="Location (city/region)" value={form.location} onChange={handleChange} />
          <input name="country" placeholder="Country (e.g., Pakistan)" value={form.country} onChange={handleChange} />
          <div className="rating-input">
            <label>Rate your experience</label>
            <div className="stars" role="radiogroup" aria-label="Rating">
              {[1, 2, 3, 4, 5].map((i) => (
                <button
                  type="button"
                  key={i}
                  className={`star ${form.rating >= i ? 'filled' : ''}`}
                  onClick={() => setForm({ ...form, rating: i })}
                  aria-label={`${i} star`}
                >
                  &#9733;
                </button>
              ))}
            </div>
          </div>
          <textarea name="message" placeholder="How was your experience?" value={form.message} onChange={handleChange} rows={5} required />
          <div className="modal-actions">
            <button type="button" className="modal-cancel" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" className="modal-submit" disabled={loading}>{loading ? "Sending..." : "Send Feedback"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
