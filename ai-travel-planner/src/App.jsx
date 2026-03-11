import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import LandingPage from "./pages/Landingpage";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Planner from "./pages/Planner";
import ExplorePakistan from "./pages/ExplorePakistan";
import ExploreDetailPage from "./pages/ExploreDetailPage";
import AboutUs from "./pages/AboutUs";
import ProtectedRoute from "./components/ProtectedRoute";
import ChatWindow from "./components/ChatWindow"; 
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import ForgotPassword from "./pages/ForgotPassword";
import GeneratePlan from "./pages/GeneratePlan";
import MapTest from "./pages/MapTest";
import TripMap from "./components/TripMap";



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
              
                <Planner />
              
            }
          />
          
          <Route path="/explore-pakistan" element={<ExplorePakistan />} />
          <Route
            path="/explore-pakistan/:destinationId"
            element={<ExploreDetailPage />}
          />
         
          <Route path="/about-us" element={<AboutUs />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/help"
            element={
              <ProtectedRoute>
                <Help />
              </ProtectedRoute>
            }
          />
         
          <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/generate-plan" element={<GeneratePlan />} />
        <Route path="/map-test" element={<MapTest />} />

        </Routes>
      </main>

      
      <ChatWindow />
    </>
  );
}

export default App;
