import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AppointmentHistory = () => {
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  

  useEffect(() => {

    const accessToken = localStorage.getItem("access_token");
    console.log("Auth Token:", accessToken);

    if (!accessToken) {
      console.error("No token found. Redirecting to login.");
      navigate("/home"); // Redirect to login if token is missing
      return;
    }
    axios
      .get("http://127.0.0.1:8000/client/appointment-history/" , {
        headers: { Authorization: `Bearer ${accessToken}` },
      }) // Update this to the correct API endpoint
      .then((response) => {
        setAppointments(response.data);
      })
      .catch((error) => {
        console.error("API Error:", error.response || error);
        if (error.response?.status === 401) {
          console.error("Invalid or expired token. Redirecting to login.");
          navigate("/");
        } else {
          setError(error.response?.data?.error || "An error occurred");
        }
      });
  }, [navigate]);

  // return (
  //   <div>
  //     <h1>Appointment History</h1>
  //     {error && <p style={{ color: "red" }}>{error}</p>}
  //     <ul>
  //       {appointments.map((appointment) => (
  //         <li key={appointment.id}>
  //           Slot: {appointment.slot_details.start_time} - {appointment.slot_details.end_time} <br />
  //           Doctor: {appointment.slot_details.doctor_name}
  //         </li>
  //       ))}
  //     </ul>
  //   </div>
  // );


  return (
    <div>
      <h1>Appointment History</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <ul>
        {appointments.map((appointment) => (
          <li key={appointment.id}>
            {appointment.slot_details ? (
              <>
                Slot: {appointment.slot_details.start_time} - {appointment.slot_details.end_time} <br />
                Doctor: {appointment.slot_details.doctor_name}
              </>
            ) : (
              <p style={{ color: "orange" }}>Slot details unavailable</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AppointmentHistory;
