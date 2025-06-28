import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Home/home";
import Login from "./components/login";
import Register from "./components/register";
import Awards from "./Awards/awards";
import Manager from "./Compo/manager";
import HrPage from "./Compo/hrpage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/awards" element={<Awards />} />
        <Route path="/manager" element={<Manager />}/>
        <Route path="/hr" element={<HrPage/>}/>
      </Routes>
    </Router>
  );
}

export default App;
