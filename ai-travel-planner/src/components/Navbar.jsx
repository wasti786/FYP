import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const nav = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = async () => {
    await logout();
    nav("/");
    setShowDropdown(false);
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const closeDropdown = () => {
    setShowDropdown(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm py-3">
      <div className="container">
        <Link to="/" className="navbar-brand fw-bold text-primary">
          <i className="fas fa-globe-americas me-2"></i>TravelPlanner AI
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          onClick={closeDropdown}
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link
                to="/"
                className="nav-link text-dark fw-medium"
                onClick={closeDropdown}
              >
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="/planner"
                className="nav-link text-dark fw-medium"
                onClick={closeDropdown}
              >
                Planner
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="/explore-pakistan"
                className="nav-link text-dark fw-medium"
                onClick={closeDropdown}
              >
                Explore Pakistan
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="/about-us"
                className="nav-link text-dark fw-medium"
                onClick={closeDropdown}
              >
                About Us
              </Link>
            </li>
          </ul>
          <ul className="navbar-nav ms-auto">
            {!currentUser ? (
              <>
                <li className="nav-item">
                  <Link
                    to="/login"
                    className="nav-link text-dark fw-medium"
                    onClick={closeDropdown}
                  >
                    Login
                  </Link>
                </li>
                <li className="nav-item ms-2">
                  <Link
                    to="/signup"
                    className="btn btn-primary rounded-5 px-4 fw-medium"
                    onClick={closeDropdown}
                  >
                    Sign Up
                  </Link>
                </li>
              </>
            ) : (
              <li className="nav-item" ref={dropdownRef}>
                <button
                  className="btn btn-link nav-link p-0 d-flex align-items-center"
                  onClick={toggleDropdown}
                  style={{ textDecoration: "none" }}
                >
                  <div className="user-avatar me-2 position-relative">
                    <img
                      src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100&q=80"
                      alt="User profile"
                      className="rounded-circle"
                      style={{
                        width: "40px",
                        height: "40px",
                        objectFit: "cover",
                        border: "2px solid #3a86ff",
                      }}
                    />
                  </div>
                  <span className="text-dark fw-medium">
                    {currentUser.displayName || "My Account"}
                  </span>
                </button>
                {showDropdown && (
                  <div
                    className="dropdown-menu show shadow-lg"
                    style={{ right: 0, left: "auto", marginTop: "10px" }}
                  >
                    <div className="dropdown-header text-center">
                      <img
                        src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80&q=80"
                        alt="User profile"
                        className="rounded-circle mb-2"
                        style={{
                          width: "80px",
                          height: "80px",
                          objectFit: "cover",
                          border: "3px solid #3a86ff",
                        }}
                      />
                      <h6 className="mb-0 fw-bold">
                        {currentUser.displayName || "User"}
                      </h6>
                      <small className="text-muted">{currentUser.email}</small>
                    </div>
                    <div className="dropdown-divider"></div>
                    <Link
                      to="#"
                      className="dropdown-item d-flex align-items-center"
                    >
                      <i className="fas fa-user me-2 text-primary"></i>My Profile
                    </Link>
                    <Link
                      to="#"
                      className="dropdown-item d-flex align-items-center"
                    >
                      <i className="fas fa-cog me-2 text-primary"></i>Settings
                    </Link>
                    <Link
                      to="#"
                      className="dropdown-item d-flex align-items-center"
                    >
                      <i className="fas fa-question-circle me-2 text-primary"></i>
                      Help
                    </Link>
                    <div className="dropdown-divider"></div>
                    <button
                      onClick={handleLogout}
                      className="dropdown-item d-flex align-items-center text-danger"
                    >
                      <i className="fas fa-sign-out-alt me-2"></i>Logout
                    </button>
                  </div>
                )}
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
