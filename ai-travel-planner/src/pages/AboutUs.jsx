import React from "react";
import { Link } from "react-router-dom";
import Hero2 from "../assets/Skardu.jpg";
import "../CSS/AboutUs.css"; // Import the CSS file

const AboutUs = () => {
  return (
    <div className="about-us-container">
      {/* Hero Section */}
      <section className="about-us-hero">
        <div className="about-us-hero-bg">
          <img src={Hero2} alt="About AI Travel Planner" />
          <div className="about-us-hero-overlay"></div>
        </div>
        <div className="about-us-hero-content">
          <h1 className="about-us-hero-title">About TravelPlanner AI</h1>
          <p className="about-us-hero-subtitle">
            Redefining how people explore the world — powered by Generative AI,
            we bring you intelligent itineraries, real-time insights, and
            effortless travel planning.
          </p>
          <Link to="/" className="about-us-cta-btn">
            <i className="fas fa-rocket"></i>
            Start Planning
          </Link>
        </div>
      </section>

      {/* Vision & Mission Section */}
      <section className="about-us-vision-mission">
        <div className="container">
          <div className="about-us-section-header">
            <h2 className="about-us-section-title">Our Vision & Mission</h2>
            <p className="about-us-section-subtitle">
              Driving innovation in travel technology to create seamless experiences for modern travelers
            </p>
          </div>
          
          <div className="about-us-vm-grid">
            <div className="about-us-vision-card">
              <div className="about-us-card-icon">🎯</div>
              <h3 className="about-us-card-title">Our Vision</h3>
              <p className="about-us-card-desc">
                To revolutionize how travelers plan their journeys by combining
                the power of AI, real-time data, and creativity — creating a
                world where travel planning feels natural, intelligent, and
                effortless.
              </p>
            </div>
            
            <div className="about-us-mission-card">
              <div className="about-us-card-icon">🚀</div>
              <h3 className="about-us-card-title">Our Mission</h3>
              <p className="about-us-card-desc">
                To empower users through an AI-driven travel companion that
                generates itineraries, manages budgets, and offers real-time
                assistance — blending innovation with convenience for every journey.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="about-us-values">
        <div className="container">
          <div className="about-us-section-header">
            <h2 className="about-us-section-title">Our Core Values</h2>
            <p className="about-us-section-subtitle">
              The principles that guide everything we do at TravelPlanner AI
            </p>
          </div>
          
          <div className="about-us-values-grid">
            <div className="about-us-value-card">
              <div className="about-us-value-icon">🤖</div>
              <h3 className="about-us-value-title">AI Innovation</h3>
              <p className="about-us-value-desc">
                Using cutting-edge Generative AI to design smart, human-like travel 
                planning experiences that adapt to your unique preferences and needs.
              </p>
            </div>
            
            <div className="about-us-value-card">
              <div className="about-us-value-icon">💬</div>
              <h3 className="about-us-value-title">User-Centric Design</h3>
              <p className="about-us-value-desc">
                Creating seamless, intuitive experiences focused on personalization, 
                ease of use, and making travel planning enjoyable for everyone.
              </p>
            </div>
            
            <div className="about-us-value-card">
              <div className="about-us-value-icon">🌍</div>
              <h3 className="about-us-value-title">Global Accessibility</h3>
              <p className="about-us-value-desc">
                Making world-class travel planning simple, affordable, and inclusive 
                for travelers everywhere, breaking down barriers to exploration.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="about-us-team">
        <div className="container">
          <div className="about-us-section-header">
            <h2 className="about-us-section-title">Meet Our Team</h2>
            <p className="about-us-section-subtitle">
              The passionate minds behind TravelPlanner AI's innovation
            </p>
          </div>
          
          <div className="about-us-team-grid">
            {[
              { name: "Wajahat Hussain", role: "Project Lead / Full Stack Developer", initial: "WH" },
              { name: "M. Khaliq", role: "AI Engineer", initial: "MK" },
              { name: "Muhammad Kazim", role: "UI/UX Designer", initial: "MK" },
              { name: "Asghar Ali", role: "Data Engineer", initial: "AA" },
            ].map((member, idx) => (
              <div key={idx} className="about-us-team-card">
                <div className="about-us-team-avatar">
                  {member.initial}
                </div>
                <h4 className="about-us-team-name">{member.name}</h4>
                <p className="about-us-team-role">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="about-us-footer">
        <div className="about-us-footer-container">
          <div className="about-us-footer-content">
            {/* Brand Section */}
            <div className="about-us-footer-section">
              <div className="about-us-footer-brand">
                <i className="fas fa-globe-americas"></i>
                <span className="about-us-brand-name">TravelPlanner AI</span>
              </div>
              <p className="about-us-footer-desc">
                Your journey to smarter trips begins with us. Discover amazing destinations 
                and plan effortlessly with AI.
              </p>
              <div className="about-us-social-links">
                <a href="#" className="about-us-social-link">
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a href="#" className="about-us-social-link">
                  <i className="fab fa-instagram"></i>
                </a>
                <a href="#" className="about-us-social-link">
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="#" className="about-us-social-link">
                  <i className="fab fa-linkedin-in"></i>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="about-us-footer-section">
              <h4 className="about-us-footer-title">Quick Links</h4>
              <ul className="about-us-footer-links">
                <li><Link to="/">Home</Link></li>
                <li><Link to="/planner">Trip Planner</Link></li>
                <li><Link to="/explore-pakistan">Explore Pakistan</Link></li>
                <li><Link to="/about">About Us</Link></li>
              </ul>
            </div>

            {/* Popular Tours */}
            <div className="about-us-footer-section">
              <h4 className="about-us-footer-title">Popular Tours</h4>
              <ul className="about-us-footer-links">
                <li><a href="#">Hunza Valley Explorer</a></li>
                <li><a href="#">Skardu Adventure</a></li>
                <li><a href="#">Fairy Meadows Trek</a></li>
                <li><a href="#">K2 Base Camp</a></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className="about-us-footer-section">
              <h4 className="about-us-footer-title">Contact</h4>
              <div className="about-us-contact-info">
                <div className="about-us-contact-item">
                  <i className="fas fa-phone"></i>
                  <a href="tel:+923554713444">+92 355 4713444</a>
                </div>
                <div className="about-us-contact-item">
                  <i className="fas fa-envelope"></i>
                  <a href="mailto:info@travelplanner.com">info@travelplanner.com</a>
                </div>
                <div className="about-us-contact-item">
                  <i className="fas fa-map-marker-alt"></i>
                  <span>Skardu, Gilgit Baltistan</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="about-us-footer-bottom">
            <div className="about-us-footer-bottom-content">
              <p className="about-us-copyright">
                © 2025 TravelPlanner AI. All rights reserved.
              </p>
              <div className="about-us-footer-legal">
                <a href="#">Privacy Policy</a>
                <a href="#">Terms of Service</a>
                <a href="#">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AboutUs;