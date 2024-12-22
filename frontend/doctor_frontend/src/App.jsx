import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useParams } from 'react-router-dom';
import DoctorSignUp from "./components/DoctorSignUp";
import DoctorSignIn from "./components/DoctorSignIn";
import VerifyOTPPage from './components/VerifyOTPPage';
import AppointmentSlotsPage from './components/AppointmentSlots';
import Home from "./components/Home";
import TimerPage from "./components/StartTimer";
import DoctorProfile from "./components/DoctorProfile";
import "./App.css";
// import StartTimer from "./components/StartTimer";
function App() {
  return (
    <Router>
      <Routes>
      <Route exact path="/" element={<DoctorSignIn/>} />
      <Route path="/home" element={<Home />} />
      <Route path="/signup" element={<DoctorSignUp/>} />
      <Route path="/profile/:doctorUUID" element={<DoctorProfileWrapper/>} />
      <Route path="/verify-otp" element={<VerifyOTPPage/>} />
      {/* <Route path="/timer" element={<StartTimer/>} /> */}
      <Route path="/appointment-slots" element={<AppointmentSlotsPage/>} />
      <Route path="/timer" element={<TimerPage/>} />
      </Routes>
    </Router>
  );
}
const DoctorProfileWrapper = () => {
  const { doctorUUID } = useParams();
  return <DoctorProfile doctorUUID={doctorUUID} />;
};
export default App;

