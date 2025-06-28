import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../Home/home.css";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [designation, setDesignation] = useState(null);
  const [employeeId, setEmployeeId] = useState(null);

  // Fetch localStorage data when the component loads
  useEffect(() => {
    const storedDesignation = localStorage.getItem("designation");
    const storedEmployeeId = localStorage.getItem("employeeId");

    if (storedDesignation && storedEmployeeId) {
      setDesignation(storedDesignation);
      setEmployeeId(storedEmployeeId);
    }
  }, []);

  const handleHomeClick = (event) => {
    event.preventDefault();
    if (location.pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate("/");
    }
  };

  const handleLoginClick = (event) => {
    event.preventDefault();
    if (location.pathname === "/") {
      const loginSection = document.getElementById("login");
      if (loginSection) {
        loginSection.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      navigate("/", { state: { scrollToLogin: true } });
    }
  };

  const handleLogout = () => {
    // Clear localStorage and update state
    localStorage.removeItem("designation");
    localStorage.removeItem("employeeId");
    setDesignation(null);
    setEmployeeId(null);
    
    // Redirect to home page after logout
    navigate("/");
    window.location.reload();
  };

  const handleDashboardClick = () => {
    if (designation === "hr") {
      navigate("/hr");
    } else if (designation === "manager") {
      navigate("/manager");
    }
  };

  return (
    <nav className="navbar">
      <h1>
        <a href="https://gyansys.com/" target="_blank" rel="noopener noreferrer">
          <img src="gyansys.png" className="gyansys" alt="Gyansys Logo" />
        </a>
        <Link to="/">Awards</Link>
      </h1>
      <ul>
        <li>
          <a href="/" onClick={handleHomeClick}>Home</a>
        </li>
        <li><Link to="/awards">Awards</Link></li>

        {/* Show Dashboard only for HR and Manager */}
        {designation === "hr" || designation === "manager" ? (
          <li>
            <button className="dashboard-button" onClick={handleDashboardClick}>
              Dashboard
            </button>
          </li>
        ) : null}

        {/* Show Employee Info if Logged In, Otherwise Show Login */}
        {designation && employeeId ? (
          <>
            <li>
              <span className="user-info">ID: {employeeId} | {designation}</span>
            </li>
            <li>
              <button className="logout-button" onClick={handleLogout}>Logout</button>
            </li>
          </>
        ) : (
          <li>
            <a href="/" onClick={handleLoginClick}>Login</a>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
