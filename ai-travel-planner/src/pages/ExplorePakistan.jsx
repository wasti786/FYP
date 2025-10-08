import React from "react";
import { Link } from "react-router-dom";
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
import { CollectionReference } from "firebase/firestore";

const destinations = [
  {
    image: Hunza,
    title: "Hunza Valley",
    slug: "hunza",
    description:
      "A mountainous valley known for its scenic beauty, apricot farms, and historic forts.",
  },
  {
    image: Nagar,
    title: "Rakaposhi Nagar",
    slug: "nagar",
    description:
      "Home to some of the world's highest peaks and traditional villages with rich culture.",
  },
  {
    image: Gilgit,
    title: "Gilgit City",
    slug: "gilgit",
    description:
      "The capital city of Gilgit-Baltistan, offering a blend of natural beauty and urban amenities.",
  },
  {
    image: Astore,
    title: "Astore Valley",
    slug: "astore",
    description:
      "Known for its lush meadows, dense forests, and the gateway to Deosai National Park.",
  },
  {
    image: Skardu,
    title: "Skardu City",
    slug: "skardu",
    description:
      "Famous for its desert, lakes, and proximity to the world's second-highest mountain, K2.",
  },
  {
    image: Deosai,
    title: "Deosai National Park",
    slug: "deosai",
    description:
      "One of the world's highest plateaus, known as 'The Land of Giants' with unique flora and fauna.",
  },
  {
    image: Ghanche,
    title: "Khaplu Valley",
    slug: "ghanche",
    description:
      "Known for Khaplu Palace, beautiful landscapes, and major peaks like K7.",
  },
  {
    image: Ghizer,
    title: "Phander Valley",
    slug: "ghizer",
    description:
      "Known for Phander Lake, Shandur Pass, trout fishing, and diverse cultures.",
  },
  {
    image: Shigar,
    title: "Shigar Valley",
    slug: "shigar",
    description:
      "Famous for its valley, wooden mosques, and as the gateway to Baltoro glacier.",
  },
  {
    image: Kharmang,
    title: "Manthokha Waterfall",
    slug: "kharmang",
    description:
      "A stunning 180-foot waterfall located 60 km away from Skardu town.",
  },
  {
    image: Roundu,
    title: "Bilamik Valley",
    slug: "roundu",
    description:
      "Bilamik Valley lies in Skardu District, surrounded by towering peaks.",
  },
  {
    image: Diamer,
    title: "Fairy Meadows",
    slug: "diamer",
    description:
      "Home to Nanga Parbat and Fairy Meadows, offering breathtaking trekking routes.",
  },
];

export default function ExplorePakistan() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <div className="relative w-full h-[60vh]">
        <img
          src={heroImage}
          alt="Explore Gilgit Baltistan"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-center text-center px-4">
          <h1 className="text-3xl md:text-5xl font-bold text-white">
            EXPLORE GILGIT BALTISTAN
          </h1>
          <p className="mt-4 text-lg md:text-xl text-white-200 max-w-2xl" >
            Discover the breathtaking landscapes, rich culture, and unique
            experiences across all districts of Gilgit Baltistan
          </p>
        </div>
      </div>

      {/* Destinations Grid */}
      <div className="py-16 max-w-[90%] mx-auto">
        <h2 className="mb-8 text-center text-2xl font-bold text-gray-800 md:mb-12 lg:text-3xl">
          All Destinations of Gilgit Baltistan
        </h2>

        <div className="explore-grid">
          {destinations.map((d) => (
            <Link to={`/explore-pakistan/${d.slug}`} key={d.slug} className="explore-card">
              <img src={d.image} alt={d.title} className="explore-img" />
              <div className="explore-overlay">
                <h3>{d.title}</h3>
                <p>{d.description}</p>
                <span className="explore-btn">Explore →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
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
