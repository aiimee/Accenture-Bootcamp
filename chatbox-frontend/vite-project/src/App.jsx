import "./App.css";
import React from "react";
import robot from "./assets/images/robot.png";
import { Link, Route, Routes } from "react-router-dom";
import Chatbox from "./components/Chatbox";
import Services from "./components/Services";
import Feedback from "./components/Feedback";
import Thanks from "./components/Thanks";

function App() {
  return (
    <div classname="App">
      <h1>Welcome to AI helper</h1>
      <image src={robot} alt="robot" />
      <Link to="/services">
        <img src={robot} alt="Trees" height="200" />
      </Link>
      <Routes>
        <Route path="/services" element={<Services />} />
        <Route path="/chatbox" element={<Chatbox />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/thanks" element={<Thanks />} />
      </Routes>
    </div>
  );
}

export default App;
