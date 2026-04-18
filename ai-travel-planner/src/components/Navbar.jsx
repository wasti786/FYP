import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { doc, onSnapshot } from "firebase/firestore";
import "../CSS/Navbar.css";

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const nav = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const dropdownRef = useRef(null);

  const handleLogout = async () => {
    await logout();
    nav("/");
    setShowDropdown(false);
    setIsMobileMenuOpen(false);
  };

  const toggleDropdown = () => setShowDropdown(!showDropdown);
  const closeAll = () => {
    setShowDropdown(false);
    setIsMobileMenuOpen(false);
  };
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  useEffect(() => {
    if (!currentUser) return setUserData(null);

    const userRef = doc(db, "users", currentUser.uid);

    const unsubscribe = onSnapshot(
      userRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        } else {
          setUserData({
            name: currentUser.displayName || "Traveler",
            image: "",
            email: currentUser.email || "",
          });
        }
      },
      (error) => console.error("Error listening to user data:", error),
    );

    return () => unsubscribe();
  }, [currentUser]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isActiveRoute = (path) => location.pathname === path;

  // ✅ Handle dynamic image + name
  const profileImage =
    userData?.image && userData.image.length > 5
      ? userData.image
      : "https://via.placeholder.com/100x100.png?text=U";

  const displayName = userData?.name || currentUser?.displayName || "Traveler";
  const displayEmail = userData?.email || currentUser?.email || "";

  return (
    <nav className="professional-navbar">
      <div className="nav-container">
        <Link to="/" className="nav-brand" onClick={closeAll}>
          <div className="brand-logo">
            <i className="fas fa-globe-americas"></i>
          </div>
          <span className="brand-text">
            TravelPlanner<span className="brand-accent">AI</span>
          </span>
        </Link>

        <div className="nav-links">
          <Link
            to="/"
            className={`nav-link ${isActiveRoute("/") ? "active" : ""}`}
            onClick={closeAll}
          >
            <i className="fas fa-home nav-icon"></i>
            Home
          </Link>
          <Link
            to="/planner"
            className={`nav-link ${isActiveRoute("/planner") ? "active" : ""}`}
            onClick={closeAll}
          >
            <i className="fas fa-compass nav-icon"></i>
            Planner
          </Link>
          <Link
            to="/explore-pakistan"
            className={`nav-link ${
              isActiveRoute("/explore-pakistan") ? "active" : ""
            }`}
            onClick={closeAll}
          >
            <i className="fas fa-mountain nav-icon"></i>
            Explore GB
          </Link>
          <Link
            to="/travel-resources"
            className={`nav-link ${isActiveRoute("/travel-resources") ? "active" : ""}`}
            onClick={closeAll}
          >
            <i className="fas fa-book-open nav-icon"></i>
            Travel Guide GB
          </Link>
          <Link
            to="/about-us"
            className={`nav-link ${isActiveRoute("/about-us") ? "active" : ""}`}
            onClick={closeAll}
          >
            <i className="fas fa-info-circle nav-icon"></i>
            About Us
          </Link>
        </div>

        {/* Auth Section */}
        <div className="nav-auth-section">
          {!currentUser ? (
            <div className="auth-buttons">
              <Link to="/login" className="auth-link" onClick={closeAll}>
                Sign In
              </Link>
              <Link to="/signup" className="auth-button" onClick={closeAll}>
                <i className="fas fa-user-plus me-2"></i>
                Get Started
              </Link>
            </div>
          ) : (
            <div className="user-menu" ref={dropdownRef}>
              <button className="user-trigger" onClick={toggleDropdown}>
                <div className="user-avatar">
                  <img
                    src={profileImage}
                    alt="User profile"
                    className="avatar-image"
                  />
                  <div className="online-indicator"></div>
                </div>
                <span className="user-name">{displayName.split(" ")[0]}</span>
                <i
                  className={`fas fa-chevron-${
                    showDropdown ? "up" : "down"
                  } dropdown-arrow`}
                ></i>
              </button>

              {showDropdown && (
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    <img
                      src={profileImage}
                      alt="User profile"
                      className="header-avatar"
                    />
                    <div className="user-info">
                      <h4 className="user-display-name">{displayName}</h4>
                      <p className="user-email">{displayEmail}</p>
                    </div>
                  </div>

                  <div className="dropdown-divider"></div>

                  <Link
                    to="/profile"
                    className="dropdown-item"
                    onClick={closeAll}
                  >
                    <i className="fas fa-user-circle"></i>
                    <span>My Profile</span>
                  </Link>

                  <Link to="/Help" className="dropdown-item" onClick={closeAll}>
                    <i className="fas fa-suitcase"></i>
                    <span>Help</span>
                  </Link>

                  <Link
                    to="/settings"
                    className="dropdown-item"
                    onClick={closeAll}
                  >
                    <i className="fas fa-cog"></i>
                    <span>Settings</span>
                  </Link>

                  <div className="dropdown-divider"></div>

                  <button
                    onClick={handleLogout}
                    className="dropdown-item logout-item"
                  >
                    <i className="fas fa-sign-out-alt"></i>
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
          <span
            className={`menu-bar ${isMobileMenuOpen ? "bar-1" : ""}`}
          ></span>
          <span
            className={`menu-bar ${isMobileMenuOpen ? "bar-2" : ""}`}
          ></span>
          <span
            className={`menu-bar ${isMobileMenuOpen ? "bar-3" : ""}`}
          ></span>
        </button>
      </div>

      <div className={`mobile-menu ${isMobileMenuOpen ? "active" : ""}`}>
        <div className="mobile-menu-content">
          <Link
            to="/"
            className={`mobile-nav-link ${isActiveRoute("/") ? "active" : ""}`}
            onClick={closeAll}
          >
            <i className="fas fa-home"></i>
            Home
          </Link>
          <Link
            to="/planner"
            className={`mobile-nav-link ${
              isActiveRoute("/planner") ? "active" : ""
            }`}
            onClick={closeAll}
          >
            <i className="fas fa-compass"></i>
            Planner
          </Link>
          <Link
            to="/explore-pakistan"
            className={`mobile-nav-link ${
              isActiveRoute("/explore-pakistan") ? "active" : ""
            }`}
            onClick={closeAll}
          >
            <i className="fas fa-mountain"></i>
            Explore Pakistan
          </Link>

          <Link
            to="/travel-resources"
            className={`mobile-nav-link ${isActiveRoute("/travel-resources") ? "active" : ""}`}
            onClick={closeAll}
          >
            <i className="fas fa-book-open"></i>
            <span>Travel Guide GB</span>
          </Link>
          <Link
            to="/about-us"
            className={`mobile-nav-link ${
              isActiveRoute("/about-us") ? "active" : ""
            }`}
            onClick={closeAll}
          >
            <i className="fas fa-info-circle"></i>
            About Us
          </Link>

          {!currentUser ? (
            <div className="mobile-auth-buttons">
              <Link to="/login" className="mobile-auth-link" onClick={closeAll}>
                Sign In
              </Link>
              <Link
                to="/signup"
                className="mobile-auth-button"
                onClick={closeAll}
              >
                Get Started
              </Link>
            </div>
          ) : (
            <div className="mobile-user-section">
              <div className="mobile-user-info">
                <img
                  src={profileImage}
                  alt="User profile"
                  className="mobile-user-avatar"
                />
                <div>
                  <h4>{displayName}</h4>
                  <p>{displayEmail}</p>
                </div>
              </div>
              <Link
                to="/profile"
                className="mobile-nav-link"
                onClick={closeAll}
              >
                <i className="fas fa-user-circle"></i>
                My Profile
              </Link>
              <Link to="/Help" className="mobile-nav-link" onClick={closeAll}>
                <i className="fas fa-suitcase"></i>
                Help
              </Link>
              <button onClick={handleLogout} className="mobile-logout-btn">
                <i className="fas fa-sign-out-alt"></i>
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
