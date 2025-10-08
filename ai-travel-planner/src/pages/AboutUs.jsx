import React from "react";
<link rel="stylesheet" href="App.css" />
// import heroImg from "../assets/hero.jpg"; // use your own banner image
import journeyImg from "../assets/skarduicon.png";
import visionImg from "../assets/skg.jpg";
import missionImg from "../assets/skhnz.jpg";
import teamImg from "../assets/van.jpg";
import { Link } from "react-router-dom";

export default function AboutUs() {
  return (
    <div className="about-page">
      {/* Hero Banner */}
      <div className="about-hero">
        <img src={heroImg} alt="About Us Banner" />
        <div className="overlay">
          <h1>About Explore Pakistan</h1>
          <p>Discover Pakistan through our eyes — a land of stories, mountains, and unforgettable journeys.</p>
        </div>
      </div>

      {/* Our Journey */}
      <section className="journey">
        <div className="text">
          <h2>Our Journey</h2>
          <p>
            Explore Pakistan started with a passion for adventure and storytelling. Inspired by the breathtaking landscapes, 
            vibrant cultures, and warm hospitality of Pakistan, we wanted to create a platform where travelers could 
            discover hidden gems, plan unforgettable trips, and connect with the spirit of this beautiful country.
          </p>
        </div>
        <div className="image">
          <img src={journeyImg} alt="Our Journey" />
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="vision-mission">
        <div className="card">
          <img src={visionImg} alt="Our Vision" />
          <h3>Our Vision</h3>
          <p>
            To make Pakistan one of the world’s top travel destinations by showcasing its beauty, culture, and hospitality 
            in the most authentic way.
          </p>
        </div>
        <div className="card">
          <img src={missionImg} alt="Our Mission" />
          <h3>Our Mission</h3>
          <p>
            To inspire travelers with immersive stories, help them plan their journeys seamlessly, 
            and promote responsible tourism across Pakistan.
          </p>
        </div>
      </section>

      {/* Our Team */}
      <section className="team">
        <h2>Meet Our Team</h2>
        <p>
          A group of explorers, storytellers, and travel enthusiasts dedicated to bringing Pakistan’s hidden beauty closer to you.
        </p>
        <img src={teamImg} alt="Our Team" />
      </section>

      {/* Cinematic Gallery Strip */}
      <section className="gallery-strip">
        <img src={journeyImg} alt="Travel" />
        <img src={visionImg} alt="Adventure" />
        <img src={missionImg} alt="Culture" />
        <img src={teamImg} alt="Team" />
      </section>
    </div>
  );
}
