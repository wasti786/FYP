import React from "react";
import { Link } from "react-router-dom";
import "../CSS/ExplorePakistan.css";

import heroImage from "../assets/main-image1.png";
import Hunza from "../assets/hunza/altitfort.jpg";
import Nagar from "../assets/nagar/hoparglacier1.jpg";
import Skardu from "../assets/top_destinations/skardu.JPG";
import Gilgit from "../assets/gilgit/gilgit-river2.jpg";
import Astore from "../assets/astore/rama-lake2.jpg";
import Ghizer from "../assets/ghizer/phander-valley.jpg";
import Ghanche from "../assets/ghanche/khaplu-fort.jpg";
import Kharmang from "../assets/kharmang/kharmang-district.jpg";
import Shigar from "../assets/shigar/shigar-fort.jpg";
import Diamer from "../assets/diamer/fairy-meadows.webp";
import Roundu from "../assets/roundu/bilamik-valley1.JPG";
import Deosai from "../assets/top_destinations/IMG_4665.JPG";

const destinations = [
  {
    image: Hunza,
    title: "Hunza Valley",
    slug: "hunza",
    description:
      "A mountainous valley known for its scenic beauty, apricot farms, and historic forts.",
    province: "Gilgit-Baltistan",
    highlights: ["Altit Fort", "Baltit Fort", "Attabad Lake"],
  },
  {
    image: Nagar,
    title: "Rakaposhi Nagar",
    slug: "nagar",
    description:
      "Home to some of the world's highest peaks and traditional villages with rich culture.",
    province: "Gilgit-Baltistan",
    highlights: ["Rakaposhi Peak", "Hopar Glacier", "Spantik"],
  },
  {
    image: Gilgit,
    title: "Gilgit City",
    slug: "gilgit",
    description:
      "The capital city of Gilgit-Baltistan, offering a blend of natural beauty and urban amenities.",
    province: "Gilgit-Baltistan",
    highlights: ["Gilgit River", "Kargah Buddha", "Naltar Valley"],
  },
  {
    image: Astore,
    title: "Astore Valley",
    slug: "astore",
    description:
      "Known for its lush meadows, dense forests, and the gateway to Deosai National Park.",
    province: "Gilgit-Baltistan",
    highlights: ["Rama Lake", "Chungphar Valley", "Sheosar Lake"],
  },
  {
    image: Skardu,
    title: "Skardu City",
    slug: "skardu",
    description:
      "Famous for its desert, lakes, and proximity to the world's second-highest mountain, K2.",
    province: "Gilgit-Baltistan",
    highlights: ["Shangrila Resort", "Satpara Lake", "Kachura Lakes"],
  },
  {
    image: Deosai,
    title: "Deosai National Park",
    slug: "deosai",
    description:
      "One of the world's highest plateaus, known as 'The Land of Giants' with unique flora and fauna.",
    province: "Gilgit-Baltistan",
    highlights: ["Sheosar Lake", "Bara Pani", "Wildlife Sanctuary"],
  },
  {
    image: Ghanche,
    title: "Khaplu Valley",
    slug: "ghanche",
    description:
      "Known for Khaplu Palace, beautiful landscapes, and major peaks like K7.",
    province: "Gilgit-Baltistan",
    highlights: ["Khaplu Palace", "Chaqchan Mosque", "Saltoro Valley"],
  },
  {
    image: Ghizer,
    title: "Phander Valley",
    slug: "ghizer",
    description:
      "Known for Phander Lake, Shandur Pass, trout fishing, and diverse cultures.",
    province: "Gilgit-Baltistan",
    highlights: ["Phander Lake", "Shandur Pass", "Gupis Fort"],
  },
  {
    image: Shigar,
    title: "Shigar Valley",
    slug: "shigar",
    description:
      "Famous for its valley, wooden mosques, and as the gateway to Baltoro glacier.",
    province: "Gilgit-Baltistan",
    highlights: ["Shigar Fort", "Amburik Mosque", "Basha Valley"],
  },
  {
    image: Kharmang,
    title: "Manthokha Waterfall",
    slug: "kharmang",
    description:
      "A stunning 180-foot waterfall located 60 km away from Skardu town.",
    province: "Gilgit-Baltistan",
    highlights: ["Manthokha Falls", "Kharfaq Lake", "Thagas Valley"],
  },
  {
    image: Roundu,
    title: "Bilamik Valley",
    slug: "roundu",
    description:
      "Bilamik Valley lies in Skardu District, surrounded by towering peaks.",
    province: "Gilgit-Baltistan",
    highlights: ["Bilamik Valley", "Basha River", "Rock Formations"],
  },
  {
    image: Diamer,
    title: "Fairy Meadows",
    slug: "diamer",
    description:
      "Home to Nanga Parbat and Fairy Meadows, offering breathtaking trekking routes.",
    province: "Gilgit-Baltistan",
    highlights: ["Fairy Meadows", "Nanga Parbat", "Beyal Camp"],
  },
];

export default function ExplorePakistan() {
  return (
    <div className="explore-pakistan-page">
      {/* Hero Section with Safarnama Style */}
      <section className="safarnama-hero">
        <div className="hero-background">
          <img src={heroImage} alt="Explore Gilgit Baltistan" />
          <div className="hero-overlay"></div>
        </div>
        <div className="hero-content">
          <div className="container">
            <div className="hero-text">
              <h1 className="hero-title">
                Explore <span className="highlight">Gilgit Baltistan</span>
              </h1>
              <p className="hero-subtitle">
                Discover the breathtaking landscapes, rich culture, and unique
                experiences across all districts of Pakistan's northern paradise
              </p>
              <div className="hero-stats">
                <div className="stat">
                  <span className="stat-number">12</span>
                  <span className="stat-label">Districts</span>
                </div>
                <div className="stat">
                  <span className="stat-number">50+</span>
                  <span className="stat-label">Destinations</span>
                </div>
                <div className="stat">
                  <span className="stat-number">∞</span>
                  <span className="stat-label">Adventures</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="hero-scroll-indicator">
          <span>Scroll to Explore</span>
          <div className="scroll-arrow"></div>
        </div>
      </section>

      {/* Destinations Grid */}
      <section className="destinations-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Discover Gilgit Baltistan</h2>
            <p className="section-subtitle">
              From majestic mountains to serene valleys, explore the hidden gems
              of Pakistan's crown jewel
            </p>
          </div>

          <div className="destinations-grid">
            {destinations.map((destination, index) => (
              <article
                key={destination.slug}
                className="destination-card"
                data-aos="fade-up"
              >
                <Link
                  to={`/explore-pakistan/${destination.slug}`}
                  className="card-link"
                >
                  <div className="card-image">
                    <img src={destination.image} alt={destination.title} />
                    <div className="card-overlay"></div>
                    <div className="card-badge">{destination.province}</div>
                  </div>

                  <div className="card-content">
                    <div className="card-header">
                      <h3 className="card-title">{destination.title}</h3>
                      <div className="card-rating">
                        <span className="rating-stars">★★★★★</span>
                        <span className="rating-text">Must Visit</span>
                      </div>
                    </div>

                    <p className="card-description">
                      {destination.description}
                    </p>

                    <div className="card-highlights">
                      {destination.highlights.map((highlight, idx) => (
                        <span key={idx} className="highlight-tag">
                          #{highlight}
                        </span>
                      ))}
                    </div>

                    <div className="card-footer">
                      <span className="explore-cta">
                        Explore Destination
                        <svg
                          className="cta-arrow"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M5 12H19M19 12L12 5M19 12L12 19"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Ready for Your Adventure?</h2>
            <p className="cta-subtitle">
              Let us help you plan the perfect trip to Gilgit Baltistan with our
              AI-powered travel planner
            </p>
            <div className="cta-buttons">
              <Link to="/planner" className="btn btn-primary">
                <i className="fas fa-compass me-2"></i>
                Start Planning
              </Link>
              <Link to="/destination" className="btn btn-outline">
                <i className="fas fa-map me-2"></i>
                View All Destinations
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Matching Landing Page Style */}
      <footer className="explore-footer">
        <div className="footer-container">
          <div className="footer-content">
            {/* Brand Section */}
            <div className="footer-section">
              <div className="footer-brand">
                <i className="fas fa-globe-americas"></i>
                <span className="brand-name">TravelPlanner AI</span>
              </div>
              <p className="footer-description">
                Your journey to smarter trips begins with us. Discover amazing
                destinations and plan effortlessly with AI.
              </p>
              <div className="social-links">
                <a href="#" className="social-link">
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a href="#" className="social-link">
                  <i className="fab fa-instagram"></i>
                </a>
                <a href="#" className="social-link">
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="#" className="social-link">
                  <i className="fab fa-linkedin-in"></i>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="footer-section">
              <h4 className="footer-title">Quick Links</h4>
              <ul className="footer-links">
                <li>
                  <Link to="/">Home</Link>
                </li>
                <li>
                  <Link to="/planner">Trip Planner</Link>
                </li>
                <li>
                  <Link to="/explore-pakistan">Explore Pakistan</Link>
                </li>
                <li>
                  <Link to="/about">About Us</Link>
                </li>
              </ul>
            </div>

            {/* Popular Tours */}
            <div className="footer-section">
              <h4 className="footer-title">Popular Tours</h4>
              <ul className="footer-links">
                <li>
                  <a href="#">Hunza Valley Explorer</a>
                </li>
                <li>
                  <a href="#">Skardu Adventure</a>
                </li>
                <li>
                  <a href="#">Fairy Meadows Trek</a>
                </li>
                <li>
                  <a href="#">K2 Base Camp</a>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className="footer-section">
              <h4 className="footer-title">Contact</h4>
              <div className="contact-info">
                <div className="contact-item">
                  <i className="fas fa-phone"></i>
                  <a href="tel:+923554713444">+92 355 4713444</a>
                </div>
                <div className="contact-item">
                  <i className="fas fa-envelope"></i>
                  <a href="mailto:info@travelplanner.com">
                    info@travelplanner.com
                  </a>
                </div>
                <div className="contact-item">
                  <i className="fas fa-map-marker-alt"></i>
                  <span>Skardu, Gilgit Baltistan</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="footer-bottom">
            <div className="footer-bottom-content">
              <p className="copyright">
                © 2025 TravelPlanner AI. All rights reserved.
              </p>
              <div className="footer-legal">
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
}
