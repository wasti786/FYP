import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";

const PLACEHOLDER = "https://via.placeholder.com/120.png?text=Profile";

export default function Profile() {
  const { currentUser } = useAuth();
  const [user, setUser] = useState({
    name: "",
    email: "",
    bio: "",
    image: "",
  });
  const [formData, setFormData] = useState(user);
  const [editing, setEditing] = useState(false);
  const [imagePreview, setImagePreview] = useState(PLACEHOLDER);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  // ✅ Load user data from Firestore or Auth
  useEffect(() => {
    if (!currentUser) return;

    const fetchProfile = async () => {
      try {
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setUser(docSnap.data());
          setFormData(docSnap.data());
          setImagePreview(docSnap.data().image || PLACEHOLDER);
        } else {
          // If user not in Firestore yet, show Auth info
          const defaultProfile = {
            name: currentUser.displayName || "",
            email: currentUser.email || "",
            bio: "",
            image: "",
          };
          setUser(defaultProfile);
          setFormData(defaultProfile);
        }
      } catch (err) {
        console.error("Error loading user data:", err);
      }
    };

    fetchProfile();
  }, [currentUser]);

  // ✅ Handle image upload and preview
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("Image must be smaller than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
      setFormData((prev) => ({ ...prev, image: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImagePreview(PLACEHOLDER);
    setFormData((prev) => ({ ...prev, image: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ✅ Save data to Firestore & Auth
  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert("Please enter your name");
      return;
    }

    try {
      setLoading(true);

      // Update display name (only text)
      await updateProfile(currentUser, {
        displayName: formData.name,
      });

      // Save extended info to Firestore
      await setDoc(
        doc(db, "users", currentUser.uid),
        {
          name: formData.name,
          email: formData.email || currentUser.email,
          bio: formData.bio || "",
          image: formData.image || "",
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      setUser(formData);
      setEditing(false);
      alert("✅ Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Error updating profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(user);
    setImagePreview(user.image || PLACEHOLDER);
    setEditing(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "40px 24px",
        background: "linear-gradient(135deg, #3a86ff 0%, #2b2d42 100%)",
      }}
    >
      <div
        style={{
          marginTop: "50px",
          width: "100%",
          maxWidth: "480px",
          background: "#fff",
          borderRadius: "20px",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)",
          padding: "40px",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            color: "#1a202c",
            fontWeight: "700",
            marginBottom: "25px",
          }}
        >
          My Profile
        </h2>

        {/* Profile Image */}
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <div style={{ position: "relative", display: "inline-block" }}>
            <img
              src={imagePreview}
              alt="Profile"
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "3px solid #3a86ff",
                boxShadow: "0 6px 20px rgba(58,134,255,0.3)",
              }}
            />
            {editing && (
              <div
                onClick={() => fileInputRef.current.click()}
                style={{
                  position: "absolute",
                  bottom: "5px",
                  right: "5px",
                  background: "#3a86ff",
                  color: "#fff",
                  borderRadius: "50%",
                  padding: "8px",
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                }}
              >
                <i className="fas fa-camera"></i>
              </div>
            )}
          </div>

          {editing && (
            <div style={{ marginTop: "10px" }}>
              <button
                onClick={handleRemoveImage}
                style={{
                  border: "1px solid #ffcccc",
                  background: "#fff0f0",
                  color: "#e53e3e",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: "500",
                }}
              >
                <i className="fas fa-trash me-1"></i> Remove Photo
              </button>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleImageChange}
          />
        </div>

        {/* Fields */}
        <div style={{ display: "grid", gap: "20px" }}>
          <div>
            <label style={{ fontWeight: "600", color: "#555" }}>Full Name</label>
            <input
              type="text"
              disabled={!editing}
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="form-control"
              style={{
                borderRadius: "12px",
                border: editing ? "2px solid #3a86ff" : "1px solid #ddd",
                padding: "10px 14px",
                background: editing ? "#fff" : "#f7fafc",
              }}
            />
          </div>

          <div>
            <label style={{ fontWeight: "600", color: "#555" }}>Email</label>
            <input
              type="email"
              disabled
              value={formData.email}
              className="form-control"
              style={{
                borderRadius: "12px",
                border: "1px solid #ddd",
                padding: "10px 14px",
                background: "#f7fafc",
              }}
            />
          </div>

          <div>
            <label style={{ fontWeight: "600", color: "#555" }}>Bio</label>
            <textarea
              rows="3"
              disabled={!editing}
              value={formData.bio}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, bio: e.target.value }))
              }
              className="form-control"
              style={{
                borderRadius: "12px",
                border: editing ? "2px solid #3a86ff" : "1px solid #ddd",
                padding: "10px 14px",
                background: editing ? "#fff" : "#f7fafc",
                resize: "vertical",
              }}
            ></textarea>
          </div>
        </div>

        {/* Buttons */}
        <div
          style={{
            marginTop: "25px",
            textAlign: "center",
            display: "flex",
            justifyContent: "center",
            gap: "15px",
          }}
        >
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="btn btn-primary"
              style={{
                background: "#3a86ff",
                border: "none",
                borderRadius: "50px",
                padding: "10px 25px",
                fontWeight: "600",
              }}
            >
              <i className="fas fa-edit me-2"></i> Edit Profile
            </button>
          ) : (
            <>
              <button
                onClick={handleSave}
                disabled={loading}
                className="btn btn-success"
                style={{
                  background: "#38a169",
                  border: "none",
                  borderRadius: "50px",
                  padding: "10px 25px",
                  fontWeight: "600",
                }}
              >
                {loading ? "Saving..." : "Save"}
              </button>
              <button
                onClick={handleCancel}
                className="btn btn-light"
                style={{
                  borderRadius: "50px",
                  padding: "10px 25px",
                  fontWeight: "600",
                  border: "1px solid #ddd",
                }}
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
