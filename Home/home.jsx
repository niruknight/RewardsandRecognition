import React, { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import Login from "../components/login";
import Register from "../components/register"; // Import Register
import "../Home/home.css";

const Home = () => {
  const [showRegister, setShowRegister] = useState(false); // State to control Register modal
  const location = useLocation();

  useEffect(() => {
    if (location.state?.scrollToLogin) {
      const loginSection = document.getElementById("login");
      if (loginSection) {
        loginSection.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [location]);
  return (
    <div id="home">
      <Navbar />
      <div className="hero">
        <img src="winner.jpg" alt="winner" className="hero-image" />
        <h1>Welcome to Awards</h1>
        <p>Recognizing and Rewarding Excellence</p>
      </div>
      <div className="auth-section" id="login">
        <Login openRegister={() => setShowRegister(true)} />
      </div>

      {/* Register Modal */}
      {showRegister && (
        <div className="modal-overlay">
          <div className="modal-content">
            <Register closeRegister={() => setShowRegister(false)} />
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Home;
