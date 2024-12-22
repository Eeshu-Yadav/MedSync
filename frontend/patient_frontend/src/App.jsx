import React from "react";
import { useParams } from 'react-router-dom';
import { Route, Routes} from "react-router-dom";
import PatientSignUp from "./components/PatientSignUp";
import PatientSignIn from "./components/PatientSignIn";
import PatientProfile from "./components/PatientProfile";
import About from "./components/About";
import Home from "./components/Home";
// import Navbar from "./Header/Navbar";
import "./App.css";
import HomeMain from "./components/HomeMain";
import Contact from "./components/Contact";
import VerifyOTPPage from "./components/VerifyOTPPage";
import AvailableSlots from "./components/AvailableSlots";
import Appointments from "./components/Appointments";
import AllDoctors from "./components/AllDoctors";
import BookAppointment from "./components/BookAppointment";
import AppointmentHistory from "./components/AppointmentHistory";

const App = () => {
  return (
    
      <div className='mx-4 sm:mx-[10%]'>
        {/* <Navbar/> */}

        <Routes>
          
          <Route path="/signup" element={<PatientSignUp/>} />
          <Route path="/" element={<PatientSignIn/>} />
          <Route path="/home" element={<Home/>} />
          <Route path="/patient/home" element={<HomeMain/>} />
          <Route path="/patient/About" element={<About/>} />
          <Route path="/profile/:patientUUID" element={<PatientProfileWrapper/>} />
          <Route path="/patient/Contact" element={<Contact/>} />
          <Route path="/verify-otp" element={<VerifyOTPPage/>} />
          <Route path="/patient/my-appointments" element={<Appointments/>} />
          <Route path="/patient/All-Doctors" element={<AllDoctors/>} />
          <Route path="/available-slots" element={<AvailableSlots />} />
          <Route path="/book-appointment" element={<BookAppointment />} />
          <Route path="/appointment-history" element={<AppointmentHistory />} />
        </Routes>
      </div>
    
  );
}
const PatientProfileWrapper = () => {
  const { patientUUID } = useParams();
  return <PatientProfile patientUUID={patientUUID} />;
};
export default App
