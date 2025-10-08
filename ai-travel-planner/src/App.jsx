import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import LandingPage from "./pages/LandingPage";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Planner from "./pages/Planner";
import ExplorePakistan from "./pages/ExplorePakistan";
import ExploreDetailPage from "./pages/ExploreDetailPage";
import AboutUs from "./pages/AboutUs";
import ProtectedRoute from "./components/ProtectedRoute";
import ChatWindow from "./components/ChatWindow"; // ✅ updated import
import "./App.css";

function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route
            path="/planner"
            element={
              <ProtectedRoute>
                <Planner />
              </ProtectedRoute>
            }
          />

          {/* Explore Pakistan */}
          <Route path="/explore-pakistan" element={<ExplorePakistan />} />
          <Route
            path="/explore-pakistan/:destinationId"
            element={<ExploreDetailPage />}
          />

          {/* About Us */}
          <Route path="/about-us" element={<AboutUs />} />
        </Routes>
      </main>

      {/* ✅ Chatbot (ChatWindow) always visible */}
      <ChatWindow />
    </>
  );
}

export default App;
