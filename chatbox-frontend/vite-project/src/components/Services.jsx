import React from "react";
import audio from "../assets/images/audio.png";
import physical from "../assets/images/physical.png";
import others from "../assets/images/others.png";
import visual from "../assets/images/visual.png";
import { Link, Route, Routes } from "react-router-dom";
import Chatbox from "./Chatbox";

const Services = () => {
  return (
    <div>
      <h1>How can I assist you today ?</h1>
      <Link to="/chatbox">
        <img src={physical} alt="Trees" height="200" />
        <img src={visual} alt="Trees" height="200" />
        <img src={audio} alt="Trees" height="200" />
        <img src={others} alt="Trees" height="200" />
      </Link>
      <Routes>
        <Route path="/chatbox" element={<Chatbox />} />
      </Routes>
    </div>
  );
};

export default Services;
