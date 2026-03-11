import React, { useState } from "react";

export default function Settings() {
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(false);
  const [language, setLanguage] = useState("English");
  const [privacy, setPrivacy] = useState("Public");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveSettings = async () => {
    setSaving(true);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const settings = {
      notifications,
      emailUpdates,
      language,
      privacy,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem("travelPlannerSettings", JSON.stringify(settings));

    setSaving(false);
    setSaveSuccess(true);

    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleDeleteAccount = () => {
    if (
      window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost."
      )
    ) {
      alert(
        "Account deletion initiated. This feature would typically connect to your backend service."
      );
    }
  };

  return (
    <div
      className="container py-5"
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #ffffffff 0%, #ffffffff 100%)",
        marginTop: "100px",
      }}
    >
      <div className="text-center mb-5">
        <div className="position-relative d-inline-block">
          <i
            className="fas fa-cogs text-primary mb-3"
            style={{ fontSize: "3rem" }}
          ></i>
          <div className="position-absolute top-0 start-100 translate-middle p-2 bg-primary rounded-circle">
            <i
              className="fas fa-sliders-h text-white"
              style={{ fontSize: "0.8rem" }}
            ></i>
          </div>
        </div>
        <h2 className="fw-bold text-dark mb-2">Account Settings</h2>
        <p className="text-muted fs-6">
          Manage your preferences and privacy options
        </p>
      </div>

      <div
        className="card shadow-lg border-0 rounded-4 overflow-hidden mx-auto"
        style={{ maxWidth: "700px" }}
      >
        <div className="card-header bg-white border-0 py-4">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="fw-bold text-dark mb-0">Preferences</h5>
            <button
              className="btn btn-primary px-4 rounded-pill fw-semibold"
              style={{ marginLeft: "350px" }}
              onClick={handleSaveSettings}
              disabled={saving}
            >
              {saving ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                  ></span>
                  Saving...
                </>
              ) : (
                <>
                  <i className="fas fa-save me-2"></i>
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>

        <div className="card-body p-4">
          {/* Success Message */}
          {saveSuccess && (
            <div
              className="alert alert-success alert-dismissible fade show d-flex align-items-center"
              role="alert"
            >
              <i className="fas fa-check-circle me-2"></i>
              Settings saved successfully!
              <button
                type="button"
                className="btn-close ms-auto"
                onClick={() => setSaveSuccess(false)}
              ></button>
            </div>
          )}

          <div
            className="d-flex justify-content-between align-items-center p-3 rounded-3 mb-3"
            style={{ background: "#f8f9fa" }}
          >
            <div className="d-flex align-items-center">
              <div className="bg-primary bg-opacity-10 p-2 rounded-3 me-3">
                <i className="fas fa-bell text-primary"></i>
              </div>
              <div>
                <h6 className="fw-bold mb-1 text-dark">Push Notifications</h6>
                <p className="text-muted mb-0 small">
                  {notifications
                    ? "Receive real-time updates"
                    : "Notifications are disabled"}
                </p>
              </div>
            </div>
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                style={{ width: "3rem", height: "1.5rem" }}
                checked={notifications}
                onChange={() => setNotifications(!notifications)}
              />
            </div>
          </div>

          {/* Email Updates */}
          <div
            className="d-flex justify-content-between align-items-center p-3 rounded-3 mb-3"
            style={{ background: "#f8f9fa" }}
          >
            <div className="d-flex align-items-center">
              <div className="bg-success bg-opacity-10 p-2 rounded-3 me-3">
                <i className="fas fa-envelope text-success"></i>
              </div>
              <div>
                <h6 className="fw-bold mb-1 text-dark">Email Updates</h6>
                <p className="text-muted mb-0 small">
                  Receive AI travel suggestions and offers
                </p>
              </div>
            </div>
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                style={{ width: "3rem", height: "1.5rem" }}
                checked={emailUpdates}
                onChange={() => setEmailUpdates(!emailUpdates)}
              />
            </div>
          </div>

          {/* Language Preference */}
          <div className="p-3 rounded-3 mb-3" style={{ background: "#f8f9fa" }}>
            <div className="d-flex align-items-center mb-2">
              <div className="bg-info bg-opacity-10 p-2 rounded-3 me-3">
                <i className="fas fa-globe text-info"></i>
              </div>
              <div>
                <h6 className="fw-bold mb-1 text-dark">Language Preference</h6>
                <p className="text-muted mb-0 small">
                  Choose your preferred language
                </p>
              </div>
            </div>
            <select
              className="form-select mt-2 border-0 shadow-sm"
              style={{ background: "white", borderRadius: "10px" }}
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option>English</option>
              <option>Urdu</option>
              <option>French</option>
              <option>Spanish</option>
              <option>Arabic</option>
              <option>Chinese</option>
            </select>
          </div>

          {/* Privacy Settings */}
          <div className="p-3 rounded-3 mb-4" style={{ background: "#f8f9fa" }}>
            <div className="d-flex align-items-center mb-2">
              <div className="bg-warning bg-opacity-10 p-2 rounded-3 me-3">
                <i className="fas fa-shield-alt text-warning"></i>
              </div>
              <div>
                <h6 className="fw-bold mb-1 text-dark">Privacy Settings</h6>
                <p className="text-muted mb-0 small">
                  Control who can see your profile
                </p>
              </div>
            </div>
            <select
              className="form-select mt-2 border-0 shadow-sm"
              style={{ background: "white", borderRadius: "10px" }}
              value={privacy}
              onChange={(e) => setPrivacy(e.target.value)}
            >
              <option>Public - Anyone can view your profile</option>
              <option>Friends Only - Only your connections can view</option>
              <option>Private - Only you can view your profile</option>
            </select>
          </div>

          {/* Delete Account - Danger Zone */}
          <div className="p-4 rounded-3 border border-danger">
            <div className="d-flex align-items-center mb-3">
              <div className="bg-danger bg-opacity-10 p-2 rounded-3 me-3">
                <i className="fas fa-exclamation-triangle text-danger"></i>
              </div>
              <div>
                <h6 className="fw-bold mb-1 text-danger">Danger Zone</h6>
                <p className="text-muted mb-0 small">
                  Permanently delete your account and all your travel data
                </p>
              </div>
            </div>

            <div className="alert alert-warning border-warning mb-3">
              <div className="d-flex">
                <i className="fas fa-info-circle text-warning me-2 mt-1"></i>
                <div>
                  <strong>Warning:</strong> This action cannot be undone. All
                  your trips, preferences, and personal data will be permanently
                  deleted from our servers.
                </div>
              </div>
            </div>

            <button
              className="btn btn-outline-danger w-100 fw-semibold py-2 rounded-3"
              onClick={handleDeleteAccount}
            >
              <i className="fas fa-trash-alt me-2"></i>
              Delete My Account Permanently
            </button>
          </div>

          {/* Additional Info */}
          <div className="text-center mt-4">
            <p className="text-muted small">
              <i className="fas fa-clock me-1"></i>
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
