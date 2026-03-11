import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import "../CSS/Landing.css";

export default function LandingPage() {
  const { currentUser } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ destination: "", dates: "" });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleStart = () => {
    localStorage.setItem("tripInput", JSON.stringify(form));
    if (currentUser) nav("/planner");
    else nav("/signup");
  };

  return (
    <div className="landing-page">
      {/* Hero Section - Redesigned */}
      <section className="professional-hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">
                Plan Your Perfect Trip with AI
              </h1>
              <p className="hero-subtitle">
                Create personalized itineraries, get smart recommendations, and manage your entire journey in one place.
              </p>
              
              {/* Simplified Search Form */}
              <div className="hero-search">
                <div className="search-input-group">
                  <div className="input-with-icon">
                    <i className="fas fa-map-marker-alt"></i>
                    <input
                      name="destination"
                      value={form.destination}
                      onChange={handleChange}
                      placeholder="Where do you want to go?"
                      className="search-input"
                    />
                  </div>
                  <div className="input-with-icon">
                    <i className="fas fa-calendar"></i>
                    <input
                      name="dates"
                      value={form.dates}
                      onChange={handleChange}
                      placeholder="Travel dates"
                      className="search-input"
                    />
                  </div>
                  <button onClick={handleStart} className="search-button">
                    <i className="fas fa-magic"></i>
                    Start Planning
                  </button>
                </div>
              </div>

              <div className="trust-indicators">
                <div className="trust-item">
                  <div className="trust-stars">
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star-half-alt"></i>
                  </div>
                  <span>Rated 4.8/5 by travelers</span>
                </div>
                <div className="trust-item">
                  <i className="fas fa-users"></i>
                  <span>10,000+ Happy Travelers</span>
                </div>
                <div className="trust-item">
                  <i className="fas fa-globe-americas"></i>
                  <span>50+ Destinations</span>
                </div>
              </div>
            </div>
            
            <div className="hero-visual">
              <div className="floating-cards">
                <div className="floating-card card-1">
                  <div className="card-header">
                    <div className="avatar">SD</div>
                    <div>
                      <h6>Sarah's Trip</h6>
                      <small>Hunza Valley • 5 days</small>
                    </div>
                  </div>
                  <div className="card-places">
                    <span>🏔️ Altit Fort</span>
                    <span>🏞️ Attabad Lake</span>
                    <span>🏰 Baltit Fort</span>
                  </div>
                </div>
                <div className="floating-card card-2">
                  <div className="card-header">
                    <div className="avatar">MJ</div>
                    <div>
                      <h6>Mike's Adventure</h6>
                      <small>Skardu • 7 days</small>
                    </div>
                  </div>
                  <div className="card-places">
                    <span>🏜️ Shangrila</span>
                    <span>🏞️ Deosai Plains</span>
                    <span>🏔️ K2 Base Camp</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Redesigned */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2>Why Choose TravelPlanner AI?</h2>
            <p>Smart features that make travel planning effortless and enjoyable</p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-robot"></i>
              </div>
              <h3>AI-Powered Itineraries</h3>
              <p>Get personalized day-by-day plans crafted by our advanced AI based on your preferences.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-wallet"></i>
              </div>
              <h3>Smart Budget Management</h3>
              <p>Set your budget and let AI find the best options for flights, stays, and activities.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-sync-alt"></i>
              </div>
              <h3>Real-Time Updates</h3>
              <p>Live weather, flight status, and local event updates during your travels.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-comments"></i>
              </div>
              <h3>24/7 AI Assistant</h3>
              <p>Get instant answers to travel questions with our intelligent chatbot.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - New Section */}
      <section className="how-it-works">
        <div className="container">
          <div className="section-header">
            <h2>How It Works</h2>
            <p>Plan your dream vacation in three simple steps</p>
          </div>

          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Tell Us Your Plans</h3>
              <p>Enter your destination, dates, and travel preferences</p>
            </div>
            
            <div className="step">
              <div className="step-number">2</div>
              <h3>Get AI Itinerary</h3>
              <p>Receive a personalized travel plan crafted just for you</p>
            </div>
            
            <div className="step">
              <div className="step-number">3</div>
              <h3>Enjoy Your Trip</h3>
              <p>Access your plan anywhere with live updates</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials - Redesigned */}
      <section className="testimonials-section">
        <div className="container">
          <div className="section-header">
            <h2>Trusted by Travelers Worldwide</h2>
            <p>See what our users have to say about their experience</p>
          </div>

          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-content">
                <p>"This app saved me hours of research. The AI suggestions were spot on for my Europe trip!"</p>
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">SD</div>
                <div className="author-info">
                  <h4>Sarah Davis</h4>
                  <span>Travel Enthusiast</span>
                </div>
              </div>
            </div>
            
            <div className="testimonial-card">
              <div className="testimonial-content">
                <p>"The budget feature helped me save over $500 without compromising on experiences. Amazing!"</p>
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">MJ</div>
                <div className="author-info">
                  <h4>Michael Johnson</h4>
                  <span>Adventure Traveler</span>
                </div>
              </div>
            </div>
            
            <div className="testimonial-card">
              <div className="testimonial-content">
                <p>"I love how the app adapts to changing plans. Real-time updates were a lifesaver in Japan!"</p>
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">EC</div>
                <div className="author-info">
                  <h4>Emma Chen</h4>
                  <span>Frequent Traveler</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Redesigned */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Start Your Journey?</h2>
            <p>Join thousands of travelers using AI to create unforgettable trips</p>
            <div className="cta-buttons">
              <button onClick={handleStart} className="cta-button primary">
                <i className="fas fa-rocket"></i>
                Start Planning Free
              </button>
              <Link to="/explore-pakistan" className="cta-button secondary">
                <i className="fas fa-compass"></i>
                Explore Destinations
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Redesigned */}
      <footer className="professional-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <div className="footer-brand">
                <i className="fas fa-globe-americas"></i>
                <span>TravelPlanner AI</span>
              </div>
              <p>Your journey to smarter trips begins with us. Discover amazing destinations and plan effortlessly with AI.</p>
              <div className="social-links">
                <a href="#"><i className="fab fa-facebook-f"></i></a>
                <a href="#"><i className="fab fa-instagram"></i></a>
                <a href="#"><i className="fab fa-twitter"></i></a>
                <a href="#"><i className="fab fa-linkedin-in"></i></a>
              </div>
            </div>
            
            <div className="footer-section">
              <h4>Quick Links</h4>
              <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/planner">Trip Planner</Link></li>
                <li><Link to="/explore-pakistan">Explore Pakistan</Link></li>
                <li><Link to="/about">About Us</Link></li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h4>Popular Tours</h4>
              <ul>
                <li><a href="#">Hunza Valley Explorer</a></li>
                <li><a href="#">Skardu Adventure</a></li>
                <li><a href="#">Fairy Meadows Trek</a></li>
                <li><a href="#">K2 Base Camp</a></li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h4>Contact</h4>
              <div className="contact-info">
                <p><i className="fas fa-phone"></i> +92 355 4713444</p>
                <p><i className="fas fa-envelope"></i> info@travelplanner.com</p>
                <p><i className="fas fa-map-marker-alt"></i> Skardu, Gilgit Baltistan</p>
              </div>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>&copy; 2025 TravelPlanner AI. All rights reserved.</p>
            <div className="footer-links">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}