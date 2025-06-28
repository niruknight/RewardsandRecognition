import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "../Home/home.css";

const Login = ({ openRegister }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [empid, setEmpid] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [designation, setDesignation] = useState("");

  // Check if user is already logged in
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedDesignation = localStorage.getItem("designation");
    const storedEmployeeId = localStorage.getItem("employeeId");

    if (storedToken && storedDesignation && storedEmployeeId) {
      setIsLoggedIn(true);
      setDesignation(storedDesignation);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5246/api/Auth/login", {
        email,
        password,
        empId: empid,
      });

      console.log("API Response:", response.data);

      if (response.data && response.data.token && response.data.designation) {
        // Store JWT token and user details in localStorage
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("designation", response.data.designation);
        localStorage.setItem("employeeId", empid);

        console.log("Stored in LocalStorage:", {
          token: localStorage.getItem("token"),
          designation: localStorage.getItem("designation"),
          employeeId: localStorage.getItem("employeeId"),
        });

        Swal.fire({
          title: "Login Successful!",
          html: `Welcome, <span style="font-weight: bold; text-transform: uppercase; color:rgb(9, 209, 5);">${response.data.designation}</span>`,
          icon: "success",
          confirmButtonText: "Proceed",
        }).then(() => {
          window.location.href = "/"; // Redirect to Dashboard
        });
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      Swal.fire({
        title: "Login Failed!",
        text: "Invalid credentials. Please try again.",
        icon: "error",
        confirmButtonText: "Retry",
      });
      console.error("Login error:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("designation");
    localStorage.removeItem("employeeId");
    setIsLoggedIn(false);
    Swal.fire("Logged out!", "You have been successfully logged out.", "info").then(() => {
      window.location.href = "/"; // Redirect to Home
    });
  };

  return (
    <div className="auth-box">
      {isLoggedIn ? (
        <>
          <h2>You are logged in as {designation}.</h2>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </>
      ) : (
        <>
          <h2>Login</h2>
          <form onSubmit={handleLogin}>
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <input type="text" placeholder="EmployeeID" value={empid} onChange={(e) => setEmpid(e.target.value)} required />
            <button type="submit">Login</button>
          </form>
          <p>
            Don't have an account?{" "}
            <button onClick={openRegister} className="signup-button">
              Sign Up
            </button>
          </p>
        </>
      )}
    </div>
  );
};

export default Login;


// ==================


// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import Swal from "sweetalert2";
// import "../Home/home.css";

// const Login = ({ openRegister }) => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [empid, setEmpid] = useState("");
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [designation, setDesignation] = useState("");

//   // Check if user is already logged in
//   useEffect(() => {
//     const storedDesignation = localStorage.getItem("designation");
//     const storedEmployeeId = localStorage.getItem("employeeId");

//     if (storedDesignation && storedEmployeeId) {
//       setIsLoggedIn(true);
//       setDesignation(storedDesignation);
//     }
//   }, []);

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await axios.post("http://localhost:5246/api/Auth/login", {
//         email,
//         password,
//         empId: empid,
//       });

//       console.log("API Response:", response.data); // Debugging

//       if (response.data && response.data.designation) {
//         localStorage.setItem("designation", response.data.designation);
//         localStorage.setItem("employeeId", empid);

//         console.log("Stored in LocalStorage:", {
//           designation: localStorage.getItem("designation"),
//           employeeId: localStorage.getItem("employeeId"),
//         });

//         Swal.fire({
//           title: "Login Successful!",
//           text: `Welcome, ${response.data.designation}`,
//           icon: "success",
//           confirmButtonText: "Proceed",
//         }).then(() => {
//           window.location.reload(); // Reload the window immediately after login
//         });
//       } else {
//         throw new Error("Invalid response format");
//       }
//     } catch (error) {
//       Swal.fire({
//         title: "Login Failed!",
//         text: "Invalid credentials. Please try again.",
//         icon: "error",
//         confirmButtonText: "Retry",
//       });
//       console.error("Login error:", error);
//     }
//   };

//   return (
//     <div className="auth-box">
//       {isLoggedIn ? (
//         <h2>You are already logged in as {designation}.</h2>
//       ) : (
//         <>
//           <h2>Login</h2>
//           <form onSubmit={handleLogin}>
//             <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
//             <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
//             <input type="text" placeholder="EmployeeID" value={empid} onChange={(e) => setEmpid(e.target.value)} required />
//             <button type="submit">Login</button>
//           </form>
//           <p>
//             Don't have an account?{" "}
//             <button onClick={openRegister} className="signup-button">
//               Sign Up
//             </button>
//           </p>
//         </>
//       )}
//     </div>
//   );
// };

// export default Login;
