import { useParams, useNavigate, Link } from "react-router-dom";
<link rel="stylesheet" href="ExploreDetailPage.css" />

import Hunza from "../assets/hunza/altitfort.jpg";
import Nagar from "../assets/nagar/hoparglacier1.jpg";
import Skardu from "../assets/top_destinations/skardu.jpg";
import Gilgit from "../assets/gilgit/gilgit-river2.jpg";
import Astore from "../assets/astore/rama-lake2.jpg";
import Ghizer from "../assets/ghizer/phander-valley.jpg";
import Ghanche from "../assets/ghanche/khaplu-fort.jpg";
import Kharmang from "../assets/kharmang/kharmang-district.jpg";
import Shigar from "../assets/shigar/shigar-fort.jpg";
import Diamer from "../assets/diamer/fairy-meadows.webp";
import Roundu from "../assets/roundu/bilamik-valley1.jpg";
import Deosai from "../assets/top_destinations/IMG_4665.jpg";

const destinations = [
  {
    image: Hunza,
    title: "Hunza Valley",
    slug: "hunza",
    description:
      "Hunza Valley is one of the most stunning valleys in Pakistan, surrounded by snow-capped peaks and famous for its apricot blossoms.",
    highlights: ["Altit Fort & Baltit Fort", "Eagle’s Nest View Point", "Attabad Lake"],
    gallery: [Hunza, Nagar, Skardu],
  },
  {
    image: Nagar,
    title: "Rakaposhi Nagar",
    slug: "nagar",
    description:
      "Nagar Valley is home to the mighty Rakaposhi mountain and offers breathtaking landscapes with traditional villages.",
    highlights: ["Rakaposhi Base Camp", "Hoper Glacier", "Traditional Villages"],
    gallery: [Nagar, Gilgit, Astore],
  },
  {
    image: Gilgit,
    title: "Gilgit City",
    slug: "gilgit",
    description:
      "The capital of Gilgit-Baltistan, Gilgit City serves as a hub for adventure and culture, offering a mix of urban life and nature.",
    highlights: ["Gilgit River", "Kargha Buddha", "Local Bazaars"],
    gallery: [Gilgit, Hunza, Skardu],
  },
  {
    image: Astore,
    title: "Astore Valley",
    slug: "astore",
    description:
      "Known for its lush meadows and dense forests, Astore Valley is the gateway to Deosai National Park.",
    highlights: ["Rama Lake", "Minimarg", "Nanga Parbat Views"],
    gallery: [Astore, Deosai, Gilgit],
  },
  {
    image: Skardu,
    title: "Skardu City",
    slug: "skardu",
    description:
      "Skardu is the heart of Baltistan, surrounded by deserts, lakes, and mountains. It’s also the gateway to K2.",
    highlights: ["Shangrila Lake", "Katpana Desert", "Skardu Fort"],
    gallery: [Skardu, Shigar, Kharmang],
  },
  {
    image: Deosai,
    title: "Deosai National Park",
    slug: "deosai",
    description:
      "Known as the ‘Land of Giants’, Deosai is one of the highest plateaus in the world with rich wildlife and scenic views.",
    highlights: ["Sheosar Lake", "Brown Bear Habitat", "Summer Wildflowers"],
    gallery: [Deosai, Astore, Skardu],
  },
  {
    image: Ghanche,
    title: "Khaplu Valley",
    slug: "ghanche",
    description:
      "Khaplu Valley is famous for its palaces, mosques, and being surrounded by some of the tallest mountains.",
    highlights: ["Khaplu Palace", "Chaqchan Mosque", "K7 & Masherbrum Peaks"],
    gallery: [Ghanche, Skardu, Shigar],
  },
  {
    image: Ghizer,
    title: "Phander Valley",
    slug: "ghizer",
    description:
      "Phander Valley is a hidden gem with turquoise lakes, trout fishing, and the Shandur Pass.",
    highlights: ["Phander Lake", "Shandur Polo Ground", "Trout Fishing"],
    gallery: [Ghizer, Gilgit, Hunza],
  },
  {
    image: Shigar,
    title: "Shigar Valley",
    slug: "shigar",
    description:
      "Shigar Valley is the gateway to the mighty Karakoram and Baltoro glacier, rich with history and wooden mosques.",
    highlights: ["Shigar Fort", "Amburik Mosque", "Gateway to K2 Trek"],
    gallery: [Shigar, Skardu, Kharmang],
  },
  {
    image: Kharmang,
    title: "Manthokha Waterfall",
    slug: "kharmang",
    description:
      "Kharmang Valley is famous for its lush landscapes and the stunning Manthokha Waterfall.",
    highlights: ["Manthokha Waterfall", "Green Valleys", "Fishing Spots"],
    gallery: [Kharmang, Skardu, Shigar],
  },
  {
    image: Roundu,
    title: "Bilamik Valley",
    slug: "roundu",
    description:
      "Bilamik Valley in Roundu district is known for its untouched beauty and peaceful surroundings.",
    highlights: ["Bilamik Meadows", "Local Villages", "Roundu River"],
    gallery: [Roundu, Skardu, Gilgit],
  },
  {
    image: Diamer,
    title: "Fairy Meadows",
    slug: "diamer",
    description:
      "Fairy Meadows is world-famous for its view of Nanga Parbat and is a dream for trekkers and nature lovers.",
    highlights: ["View of Nanga Parbat", "Camping at Fairy Meadows", "Raikot Glacier Trek"],
    gallery: [Diamer, Astore, Gilgit],
  },
];

export default function ExploreDetailPage() {
  const { destinationId } = useParams();
  const navigate = useNavigate();

  const destination = destinations.find((d) => d.slug === destinationId);

  if (!destination) {
    return (
      <div className="not-found">
        <h2>Destination Not Found</h2>
        <p>The place you’re looking for doesn’t exist.</p>
        <button className="back-btn" onClick={() => navigate("/explore-pakistan")}>
          ← Back to Explore
        </button>
      </div>
    );
  }

  return (
    <div className="detail-page">
      {/* Hero Banner */}
      <div className="hero-banner">
        <img src={destination.image} alt={destination.title} />
        <div className="hero-overlay fade-in">
          <h1>{destination.title}</h1>
          <p>{destination.description}</p>
        </div>
      </div>

      {/* About + Highlights + Gallery */}
      <div className="detail-container fade-in-up">
        <h2>About {destination.title}</h2>
        <p>{destination.description}</p>

        {/* Highlights */}
        {destination.highlights && (
          <div className="highlights">
            <h3>Highlights</h3>
            <ul>
              {destination.highlights.map((point, idx) => (
                <li key={idx}>{point}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Gallery */}
        {destination.gallery && (
          <div className="gallery">
            <h3>Gallery</h3>
            <div className="gallery-grid">
              {destination.gallery.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`${destination.title} view ${idx + 1}`}
                  className="fade-in-up"
                  style={{ animationDelay: `${idx * 0.2}s` }}
                />
              ))}
            </div>
          </div>
        )}

        <button className="back-btn" onClick={() => navigate("/explore-pakistan")}>
          ← Back to Explore
        </button>
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
                  src="/logo.png"
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
