import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "../Home/home.css";

const Register = ({ closeRegister }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [empid, setEmpid] = useState("");
  const [samCode, setSamCode] = useState("");
  const [step, setStep] = useState(1); // Step 1: Register, Step 2: Verify SamCode

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5246/api/Auth/register", {
        email,
        password,
        empId: empid,
      });

      Swal.fire({
        title: "Verification Code Sent!",
        text: "Check your email for the SamCode and enter it below to complete registration.",
        icon: "info",
        confirmButtonText: "OK",
      });

      setStep(2); // Move to SamCode verification step
    } catch (error) {
      Swal.fire({
        title: "Registration Failed!",
        text: "Something went wrong. Please try again.",
        icon: "error",
        confirmButtonText: "Retry",
      });
      console.error("Registration error:", error);
    }
  };

  const handleVerifySamCode = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5246/api/Auth/verifySCode", {
        email,
        sCode: samCode,
        password,
        empId: empid,
      });

      Swal.fire({
        title: "Registration Successful!",
        text: "You can now log in.",
        icon: "success",
        confirmButtonText: "OK",
      }).then(() => closeRegister()); // Close modal after success
    } catch (error) {
      Swal.fire({
        title: "Verification Failed!",
        text: "Invalid SamCode. Please check your email and try again.",
        icon: "error",
        confirmButtonText: "Retry",
      });
      console.error("Verification error:", error);
    }
  };

  return (
    <div className="register-overlay" onClick={(e) => e.target.classList.contains("register-overlay") && closeRegister()}>
      <div className="auth-box">
        {step === 1 ? (
          <>
            <h2>Register</h2>
            <form onSubmit={handleRegister}>
              <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <input type="text" placeholder="Employee ID" value={empid} onChange={(e) => setEmpid(e.target.value)} required />
              <button type="submit">Register</button>
            </form>
          </>
        ) : (
          <>
            <h2>Verify SamCode</h2>
            <p>Check your email for the verification code.</p>
            <form onSubmit={handleVerifySamCode}>
              <input type="text" placeholder="Enter SamCode" value={samCode} onChange={(e) => setSamCode(e.target.value)} required />
              <button type="submit">Verify</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default Register;
