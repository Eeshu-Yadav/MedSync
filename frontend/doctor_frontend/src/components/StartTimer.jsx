import React, { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ActiveTimer from './ActiveTimer';
// import { Checkbox } from "@/components/ui/checkbox";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

const TimerPage = () => {
  const [formData, setFormData] = useState({
    slot_uuid: "",
    duration: 5,
    start_now: false,
    scheduled_start_time: "",
  });
  
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      console.error("Access token is missing. Redirecting to login...");
      window.location.href = "/";
      return;
    }
    console.log("Auth Token:", accessToken);
    if (!accessToken) {
    alert("Please log in to start the timer.");
    return;
    }
    try {
      const response = await axios.post(
        `http://127.0.0.1:8000/doctor/start_timer/${formData.slot_uuid}/`,
        {
          duration: formData.duration,
          start_now: formData.start_now,
          scheduled_start_time: formData.scheduled_start_time,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      alert(response.data.message);
    } catch (error) {
      console.error("Error starting timer", error);
      if (error.response?.status === 401) {
        alert("Unauthorized: Please log in again.");
      } else {
        alert(error.response?.data?.error || "An error occurred.");
      }
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };
  return (
    <div>
      <div className="max-w-lg mx-auto p-6 space-y-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-semibold text-center">Start Timer</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Slot UUID */}
        <div className="space-y-2">
          <Label htmlFor="slot_uuid" className="block text-sm font-medium text-gray-700">
            Slot UUID
          </Label>
          <Input
            id="slot_uuid"
            type="text"
            name="slot_uuid"
            value={formData.slot_uuid}
            onChange={handleChange}
            required
            className="w-full"
          />
        </div>
  
        {/* Duration */}
        <div className="space-y-2">
          <Label htmlFor="duration" className="block text-sm font-medium text-gray-700">
            Duration (minutes)
          </Label>
          <Input
            id="duration"
            type="number"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            className="w-full"
          />
        </div>

        <div>
          <label>
             Start Now:
          <input
              type="checkbox"
              name="start_now"
              checked={formData.start_now}
              onChange={handleChange}
            />
          </label>
        </div>
        <div>
          <label>Scheduled Start Time:</label>
          <input
            type="datetime-local"
            name="scheduled_start_time"
            value={formData.scheduled_start_time}
            onChange={handleChange}
            disabled={formData.start_now}
          />
        </div>
  
        
  
        {/* Submit Button */}
        <Button type="submit" className="w-full bg-indigo-600 text-white hover:bg-indigo-700">
          Start Timer
        </Button>
      </form>
      <p className="text-center">
        Go To Home Page!{" "}
        <a href="/home" className="text-blue-600 hover:underline">
          Home
        </a>
      </p>
      <br />

      </div>
      <br /> 
      <br />
      <ActiveTimer />
    </div>
  );
}




export default TimerPage;
