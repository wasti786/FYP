import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const nav = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signup(email, pass, name);
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
          <div className="col-md-6 col-lg-5">
            <div className="card auth-card shadow border-0 rounded-4">
              <div className="card-body p-5">
                <div className="auth-header">
                  <div className="auth-icon">
                    <i className="fas fa-user-plus"></i>
                  </div>
                  <h2 className="fw-bold text-primary">Create Account</h2>
                  <p className="text-muted">Join us to start your adventure</p>
                </div>
                
                {error && (
                  <div className="alert alert-danger" role="alert">
                    <i className="fas fa-exclamation-circle me-2"></i>
                    {error}
                  </div>
                )}
                
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label fw-semibold">Full Name</label>
                    <div className="input-group">
                      <span className="input-group-text bg-transparent border-end-0">
                        <i className="fas fa-user text-primary"></i>
                      </span>
                      <input 
                        required 
                        type="text" 
                        className="form-control border-start-0 py-3" 
                        id="name"
                        placeholder="Enter your full name" 
                        value={name} 
                        onChange={e => setName(e.target.value)} 
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label fw-semibold">Email Address</label>
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
                        onChange={e => setEmail(e.target.value)} 
                      />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label htmlFor="password" className="form-label fw-semibold">Password</label>
                    <div className="input-group">
                      <span className="input-group-text bg-transparent border-end-0">
                        <i className="fas fa-lock text-primary"></i>
                      </span>
                      <input 
                        required 
                        type="password" 
                        className="form-control border-start-0 py-3" 
                        id="password"
                        placeholder="Create a password" 
                        value={pass} 
                        onChange={e => setPass(e.target.value)} 
                      />
                    </div>
                  </div>
                  <button 
                    type="submit" 
                    className="btn btn-primary w-100 py-3 rounded-3 fw-semibold"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-rocket me-2"></i>Get Started
                      </>
                    )}
                  </button>
                </form>
                
                <div className="text-center mt-4">
                  <p className="text-muted">
                    Already have an account? <Link to="/login" className="text-primary text-decoration-none fw-semibold">Sign in</Link>
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