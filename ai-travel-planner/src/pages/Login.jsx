import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCred = await login(email, pass);
      const user = userCred.user;

      // Fetch the user's profile from Firestore
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        localStorage.setItem("userProfile", JSON.stringify(userData));
      }

      nav("/planner");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5" style={{ marginTop: "100px" }} >
            <div className="card auth-card shadow border-0 rounded-4">
              <div className="card-body p-5">
                <div className="auth-header">
                  <div className="auth-icon">
                    <i className="fas fa-lock"></i>
                  </div>
                  <h2 className="fw-bold text-primary">Welcome Back</h2>
                  <p className="text-muted">Sign in to continue your journey</p>
                </div>

                {error && (
                  <div className="alert alert-danger" role="alert">
                    <i className="fas fa-exclamation-circle me-2"></i>
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label fw-semibold">
                      Email Address
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-transparent border-end-0">
                        <i className="fas fa-envelope text-primary"></i>
                      </span>
                      <input
                        required
                        type="email"
                        className="form-control border-start-0 py-3"
                        id="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="password" className="form-label fw-semibold">
                      Password
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-transparent border-end-0">
                        <i className="fas fa-lock text-primary"></i>
                      </span>
                      <input
                        required
                        type="password"
                        className="form-control border-start-0 py-3"
                        id="password"
                        placeholder="Enter your password"
                        value={pass}
                        onChange={(e) => setPass(e.target.value)}
                      />
                    </div>

                    {/* ✅ Forgot Password Link */}
                    <div className="text-end mt-2">
                      <Link
                        to="/forgot-password"
                        className="text-primary text-decoration-none fw-semibold"
                      >
                        Forgot Password?
                      </Link>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-100 py-3 rounded-3 fw-semibold"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        ></span>
                        Signing In...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-sign-in-alt me-2"></i>Sign In
                      </>
                    )}
                  </button>
                </form>

                <div className="text-center mt-4">
                  <p className="text-muted">
                    Don’t have an account?{" "}
                    <Link
                      to="/signup"
                      className="text-primary text-decoration-none fw-semibold"
                    >
                      Create one
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
