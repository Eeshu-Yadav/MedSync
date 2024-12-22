import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const DoctorProfile = ({ doctorUUID }) => {
  const [doctorData, setDoctorData] = useState(null);
  const [formData, setFormData] = useState({ name: '', specialty: '' });
  const [error, setError] = useState('');
  

  useEffect(() => {
    // Fetch current doctor details

    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      setError('Access token missing. Please log in.');
      return;
    }
    axios
      .get(`http://127.0.0.1:8000/doctor/profile/${doctorUUID}/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then((response) => {
        setDoctorData(response.data);
        setFormData({ name: response.data.name , specialty: response.data.specialty});
      })
      .catch((err) => {
        console.error('Error fetching profile details:', err);
        setError('Failed to load doctor profile. Please ensure you are logged in.');
      });

  }, [doctorUUID]);
  console.log('Patient UUID:', doctorUUID);


  const handleUpdate = (e) => {
    e.preventDefault();
    setError('');
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      setError('Access token missing. Please log in.');
      return;
    }
    axios
      .patch(`http://127.0.0.1:8000/doctor/profile/${doctorUUID}/`, formData, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then((response) => {
        setDoctorData(response.data);
        alert('Profile updated successfully');
      })
      .catch((err) => {
        setError(err.response?.data?.error || 'Error updating profile');
      });
  };

  if (!doctorData) return <div>Loading...</div>;







return (
  <div className=" py-16 ">

    <div className="max-w-2xl mx-auto p-6 space-y-6 border border-gray-200 rounded-lg shadow-sm">
      {/* Doctor Profile Heading */}
      <h1 className="text-3xl font-bold text-center">Patient Profile</h1>

      {/* Current Details */}
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">Current Details</h3>
        <p className="text-gray-700">
          <strong>Name:</strong> {doctorData.name}
        </p>
        <p className="text-gray-700">
          <strong>Specialty:</strong> {doctorData.specialty}
        </p>
        <p className="text-gray-700">
          <strong>Mobile Number:</strong> {doctorData.mobile_number}
        </p>
      </div>

      {/* Update Profile Form */}
      <form onSubmit={handleUpdate} className="space-y-4">
        <h3 className="text-xl font-semibold">Update Profile</h3>
        <div className="space-y-2">
          <Label htmlFor="name" className="block text-sm font-medium">
            Name
          </Label>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter your name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="specialty" className="block text-sm font-medium">
            Specialty
          </Label>
          <Input
            id="specialty"
            type="text"
            value={formData.specialty}
            onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
            placeholder="Enter your specialty"
          />
        </div>
        <Button type="submit" variant="" className="w-full">
          Update
        </Button>
      </form>

      {/* Error Display */}
      {error && <div className="text-red-500 text-sm text-center">{error}</div>}

      {/* Navigate to Home Page */}
      <p className="text-center">
        Go To Home Page!{" "}
        <a href="/home" className="text-blue-600 hover:underline">
          Home
        </a>
      </p>
    </div>
  </div>
);
}

export default DoctorProfile;
