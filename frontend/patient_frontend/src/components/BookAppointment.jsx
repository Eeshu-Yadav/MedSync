import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";


import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const BookAppointment = () => {
  const [slotUUID, setSlotUUID] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleBooking = () => {
    if (!slotUUID) {
      setError("Slot UUID is required");
      return;
    }

    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      console.error("Access token is missing. Redirecting to login...");
      navigate("/"); // Redirect to login page
      return;
    }

    axios
      .post(
        "http://127.0.0.1:8000/client/book-appointment/", 
        { slot_uuid: slotUUID },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`, // Add Authorization header
          },
        }
      )
      .then((response) => {
        setMessage(response.data.message);
        setError("");
      })
      .catch((error) => {
        setMessage("");
        if (error.response?.status === 401) {
          setError("Your session has expired. Please log in again.");
          navigate("/"); // Redirect to login page if unauthorized
        } else {
          setError(error.response?.data?.error || "An error occurred");
        }
      });
  };
  
  return (
    <div>
      <div className="max-w-md mx-auto mt-24 mb-9 p-6 bg-white rounded-lg shadow-md space-y-6">
        <h1 className="text-2xl font-semibold text-center text-indigo-600">Book Appointment</h1>
        {message && <p className="text-center text-green-600 font-medium">{message}</p>}
        {error && <p className="text-center text-red-600 font-medium">{error}</p>}
        <div className="space-y-4">
          <label htmlFor="slotUUID" className="block text-sm font-medium text-gray-700">
            Slot UUID
          </label>
          <Input
            id="slotUUID"
            type="text"
            placeholder="Enter Slot UUID"
            value={slotUUID}
            onChange={(e) => setSlotUUID(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="text-center">
          <Button 
            onClick={handleBooking} 
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Book Appointment
          </Button>
        </div>
      </div>
      <p className="text-center">
        Go To Home Page!{" "}
        <a href="/home" className="text-blue-600 hover:underline">
          Home
        </a>
      </p>
    </div>
  );
};

export default BookAppointment;
