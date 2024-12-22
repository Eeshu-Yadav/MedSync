import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const AppointmentSlotsPage = () => {
  const [slots, setSlots] = useState([]);
  const [formData, setFormData] = useState({
    start_time: "",
    end_time: "",
    max_patients: "",
  });
  

const fetchSlots = async () => {
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      console.error("Access token is missing. Redirecting to login...");
      window.location.href = "/";
      return;
    }

    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/doctor/appointment_slot/",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      console.log("Slots fetched:", response.data);
      setSlots(response.data);
    } catch (error) {
      console.error("Error fetching slots", error);
      if (error.response?.status === 401) {
        console.error("Unauthorized: Redirecting to login...");
        window.location.href = "/";
      }
    }
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      alert("Session expired. Please log in again.");
      window.location.href = "/";
      return;
    }

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/doctor/appointment_slot/",
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      alert(response.data.message || "Slot created successfully!");
      setFormData({ start_time: "", end_time: "", max_patients: "" }); // Reset form
      fetchSlots(); // Refresh the slots list
    } catch (error) {
      console.error("Error creating slot", error);
      if (error.response?.status === 401) {
        alert("Unauthorized: Please log in again.");
        window.location.href = "/";
      } else {
        alert(error.response?.data?.error || "An error occurred.");
      }
    }
  };

  // Function to handle form field changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6 border border-gray-200 rounded-lg shadow-sm">
      {/* Appointment Slots Heading */}
      <h1 className="text-3xl font-bold text-center">Appointment Slots</h1>

      {/* Create Slot Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        


    <div className="space-y-4">
      <div className="space-y-2">
        <Label
          htmlFor="start_time"
          className="block text-sm font-medium text-gray-800"
        >
          Start Time
        </Label>
        <div className="relative">
          <Input
            id="start_time"
            type="datetime-local"
            name="start_time"
            value={formData.start_time}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          
        </div>
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="end_time"
          className="block text-sm font-medium text-gray-800"
        >
          End Time
        </Label>
        <div className="relative">
          <Input
            id="end_time"
            type="datetime-local"
            name="end_time"
            value={formData.end_time}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          
        </div>
      </div>
    </div>


        <div className="space-y-2">
          <Label htmlFor="max_patients" className="block text-sm font-medium">
            Max Patients
          </Label>
          <Input
            id="max_patients"
            type="number"
            name="max_patients"
            value={formData.max_patients}
            onChange={handleChange}
            placeholder="Enter the maximum number of patients"
            required
          />
        </div>

        <Button type="submit" variant="" className="w-full">
          Create Slot
        </Button>
      </form>

      <p className="text-center">
        Go To Home Page!{" "}
        <a href="/home" className="text-blue-600 hover:underline">
          Home
        </a>
      </p>
      
      <div className="space-y-6 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-4">
          Existing Appointment Slots
        </h2>

        <ul className="space-y-4">
          {slots.map((slot) => (
            <li
              key={slot.id}
              className="p-4 bg-gray-100 rounded-lg shadow-sm flex justify-between items-center"
            >
              <div className="text-gray-800">
                <p className="text-lg font-semibold">
                  {new Date(slot.start_time).toLocaleString()} to{" "}
                  {new Date(slot.end_time).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">Max Patients: {slot.max_patients}</p>
                <p className="text-sm text-gray-500">Slot UUID: {slot.uuid}</p> {/* Display UUID */}
              </div>
              {/* <Button variant="outline" size="sm" className="text-gray-700">
                Book Now
              </Button> */}
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
};

export default AppointmentSlotsPage;
