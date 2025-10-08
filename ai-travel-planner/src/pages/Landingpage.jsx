import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LandingPage() {
  const { currentUser } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ destination: "", budget: "", dates: "" });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleStart = () => {
    localStorage.setItem("tripInput", JSON.stringify(form));
    if (currentUser) nav("/planner");
    else nav("/signup");
  };

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="row align-items-center min-vh-100">
            <div className="col-lg-6">
              <h1 className="display-3 fw-bold text-white mb-4">
                One app for all your travel planning needs
              </h1>
              <p className="lead text-light mb-5">
                Create detailed itineraries, explore user-shared guides, and
                manage your bookings seamlessly – all in one place.
              </p>

              <div className="search-card card border-0 shadow-lg rounded-4">
                <div className="card-body p-4">
                  <h5 className="fw-semibold mb-4">Start your journey</h5>
                  <div className="row g-3">
                    <div className="col-md-12">
                      <div className="input-group">
                        <span className="input-group-text bg-transparent border-end-0">
                          <i className="fas fa-map-marker-alt text-primary"></i>
                        </span>
                        <input
                          name="destination"
                          value={form.destination}
                          onChange={handleChange}
                          className="form-control border-start-0 py-3"
                          placeholder="Where would you like to go?"
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="input-group">
                        <span className="input-group-text bg-transparent border-end-0">
                          <i className="fas fa-calendar text-primary"></i>
                        </span>
                        <input
                          name="dates"
                          value={form.dates}
                          onChange={handleChange}
                          className="form-control border-start-0 py-3"
                          placeholder="Travel dates"
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="input-group">
                        <span className="input-group-text bg-transparent border-end-0">
                          <i className="fas fa-dollar-sign text-primary"></i>
                        </span>
                        <input
                          name="budget"
                          value={form.budget}
                          onChange={handleChange}
                          className="form-control border-start-0 py-3"
                          placeholder="Budget"
                          type="number"
                        />
                      </div>
                    </div>
                    <div className="col-12">
                      <button
                        onClick={handleStart}
                        className="btn btn-primary w-100 py-3 rounded-3 fw-semibold"
                      >
                        <i className="fas fa-magic me-2"></i>Start Planning
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6 text-center">
              <img
                src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80"
                alt="Travel planning"
                className="img-fluid rounded-4 shadow-lg"
                style={{ maxHeight: "500px", objectFit: "cover" }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Showcase */}
      <section className="py-5 bg-white">
        <div className="container py-5">
          <div className="row">
            <div className="col-md-6 mb-4">
              <div className="feature-item p-4 rounded-4 shadow-sm h-100">
                <h4 className="fw-bold mb-3">Waimea Canyon</h4>
                <p className="text-muted mb-3">
                  Expansive, mountain top gorge known as the 'Grand Canyon of
                  the Pacific' features sweeping views.
                </p>
                <div className="d-flex align-items-center text-muted mb-3">
                  <i className="fas fa-walking me-2"></i>
                  <span>5km • Hiking trail</span>
                </div>
                <div className="place-card p-3 rounded-3 bg-light">
                  <h6 className="fw-semibold mb-2">Lava Poke</h6>
                  <p className="text-muted small mb-0">
                    Guests enjoy fresh poke bowls with bold flavors and a touch
                    of island heat. Taste the aloha!
                  </p>
                </div>
                <button className="btn btn-outline-primary mt-3">
                  <i className="fas fa-plus me-2"></i>Add a place
                </button>
              </div>
            </div>
            <div className="col-md-6">
              <h2 className="fw-bold text-dark mb-4">
                Create your ultimate travel itinerary
              </h2>
              <p className="text-muted mb-4">
                Plan every detail of your trip with our intuitive tools. Add
                places, activities, and notes to create the perfect itinerary.
              </p>
              <div className="d-flex align-items-center mb-4">
                <div className="me-4">
                  <div className="display-6 fw-bold text-primary">4.9</div>
                  <div className="text-muted small">App Store</div>
                </div>
                <div className="">
                  <div className="display-6 fw-bold text-primary">4.7</div>
                  <div className="text-muted small">Google Play</div>
                </div>
              </div>
              <div className="d-flex gap-3">
                <button className="btn btn-dark rounded-3 px-4">
                  <i className="fab fa-apple me-2"></i>App Store
                </button>
                <button className="btn btn-dark rounded-3 px-4">
                  <i className="fab fa-google-play me-2"></i>Google Play
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Press Section */}
      <section className="py-5 bg-light">
        <div className="container py-5">
          <div className="text-center mb-5">
            <h2 className="fw-bold text-dark">Recommended by the press</h2>
            <p className="text-muted">
              Leading companies and media outlets are talking about
              TravelPlanner AI.
              <br />
              Discover why we're their top choice for travel planning.
            </p>
          </div>

          <div className="row g-4">
            <div className="col-md-4">
              <div className="press-card card h-100 border-0 shadow-sm">
                <div className="card-body p-4">
                  <h5 className="fw-bold text-primary">Thrillist</h5>
                  <p className="text-muted mb-3">
                    "If you're looking for a more 360-degree travel planner,
                    TravelPlanner AI might be a good option for you. The
                    platform is very intuitive, and it's super easy to navigate
                    regardless of the many features it offers."
                  </p>
                  <div className="d-flex align-items-center">
                    <div className="user-avatar me-3">
                      <i className="fas fa-user"></i>
                    </div>
                    <div>
                      <h6 className="fw-semibold mb-0">Serena Tara</h6>
                      <small className="text-muted">@thrillist</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="press-card card h-100 border-0 shadow-sm">
                <div className="card-body p-4">
                  <h5 className="fw-bold text-primary">Traveler</h5>
                  <p className="text-muted mb-3">
                    "One of the best travel apps for planning every kind of
                    trip, including road trips and group travel: create a trip
                    itinerary, budget costs, organize flights and hotel
                    reservations."
                  </p>
                  <div className="d-flex align-items-center">
                    <div className="user-avatar me-3">
                      <i className="fas fa-user"></i>
                    </div>
                    <div>
                      <h6 className="fw-semibold mb-0">Charlotte Davey</h6>
                      <small className="text-muted">@CN Traveler</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="press-card card h-100 border-0 shadow-sm">
                <div className="card-body p-4">
                  <h5 className="fw-bold text-primary">Android Authority</h5>
                  <p className="text-muted mb-3">
                    "If you're looking for an app to help you plan trips, try
                    TravelPlanner AI. It is the travel planner to end all travel
                    planners. I used to get exhausted planning trips; now I can
                    plan 10 trips a year."
                  </p>
                  <div className="d-flex align-items-center">
                    <div className="user-avatar me-3">
                      <i className="fas fa-user"></i>
                    </div>
                    <div>
                      <h6 className="fw-semibold mb-0">Rita El Khoury</h6>
                      <small className="text-muted">@Android Authority</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pro Features Section */}
      <section className="py-5 bg-white">
        <div className="container py-5">
          <div className="text-center mb-5">
            <h2 className="fw-bold text-dark">
              Maximize your trip planning with Pro
            </h2>
            <p className="text-muted">
              Experience the full potential of TravelPlanner AI with a Pro
              subscription.
              <br />
              Enjoy enhanced features and streamlined planning.
            </p>
          </div>

          <div className="row g-4">
            <div className="col-md-4">
              <div className="pro-feature text-center p-4">
                <div className="feature-icon mb-3">
                  <i className="fas fa-plane-departure fa-2x text-primary"></i>
                </div>
                <h5 className="fw-semibold mb-3">Live flight updates</h5>
                <p className="text-muted">
                  Get notified and monitor your flight status to ensure a smooth
                  travel experience.
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="pro-feature text-center p-4">
                <div className="feature-icon mb-3">
                  <i className="fas fa-wifi fa-2x text-primary"></i>
                </div>
                <h5 className="fw-semibold mb-3">Offline access</h5>
                <p className="text-muted">
                  No wifi, no problem. Your trip plans are locally downloaded
                  for access anywhere.
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="pro-feature text-center p-4">
                <div className="feature-icon mb-3">
                  <i className="fas fa-envelope fa-2x text-primary"></i>
                </div>
                <h5 className="fw-semibold mb-3">Gmail integration</h5>
                <p className="text-muted">
                  Get your travel reservations automatically synced into your
                  trip plan.
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="pro-feature text-center p-4">
                <div className="feature-icon mb-3">
                  <i className="fas fa-route fa-2x text-primary"></i>
                </div>
                <h5 className="fw-semibold mb-3">Optimize your route</h5>
                <p className="text-muted">
                  Perfect for road trips! Get the best route auto-rearranged to
                  save time and money.
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="pro-feature text-center p-4">
                <div className="feature-icon mb-3">
                  <i className="fas fa-tag fa-2x text-primary"></i>
                </div>
                <h5 className="fw-semibold mb-3">Flight deals</h5>
                <p className="text-muted">
                  Cheap flight deals sent straight to your inbox so you can plan
                  your next best trip.
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="pro-feature text-center p-4">
                <div className="feature-icon mb-3">
                  <i className="fas fa-paperclip fa-2x text-primary"></i>
                </div>
                <h5 className="fw-semibold mb-3">Unlimited attachments</h5>
                <p className="text-muted">
                  Never dig through your emails again — access all your trip
                  files in one place.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center mt-5">
            <button className="btn btn-primary btn-lg px-5 rounded-3 fw-semibold">
              Upgrade to Pro
            </button>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-5 bg-gradient-primary">
        <div className="container py-5 text-center">
          <h2 className="fw-bold text-white mb-3">
            Ready to transform your travel planning?
          </h2>
          <p className="lead text-light mb-4">
            Join millions of travelers using AI to create perfect trips
          </p>
          <div className="d-flex justify-content-center gap-3 mb-4">
            <button className="btn btn-light btn-lg px-4 rounded-3 fw-semibold">
              <i className="fab fa-apple me-2"></i>App Store
            </button>
            <button className="btn btn-light btn-lg px-4 rounded-3 fw-semibold">
              <i className="fab fa-google-play me-2"></i>Google Play
            </button>
          </div>
          <small className="text-light opacity-75">
            4.9 rating on App Store • 4.7 rating on Google Play
          </small>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="py-5"
        style={{ backgroundColor: "#132b66", color: "#e5e9f0" } }
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
                <i className="fas fa-envelope me-2"></i> info@travelplanner.com
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
//#132b66 !important
