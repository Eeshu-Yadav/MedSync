
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const PatientSignUp = () => {
  const [mobileNumber, setMobileNumber] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post('http://127.0.0.1:8000/client/signup/', { mobile_number: mobileNumber, name });
      // On success, redirect to OTP verification page
      console.log("Navigating with state:", { mobileNumber, type: 'signup' });
      navigate('/verify-otp', { state: { mobileNumber, type: 'signup' } });
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    }
  };

  return (

    <div className=" py-32 ">

      <div className="max-w-md mx-auto p-6 space-y-4 border border-gray-400 rounded-lg shadow-sm">
        <h2 className="text-4xl py-4 font-semibold text-center"> Patient Sign Up</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="block text-base font-medium">
              Name
            </Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
            />
          </div>
          <div>
            <Label htmlFor="mobile-number" className="block text-base font-medium">
              Mobile Number
            </Label>
            <Input
              id="mobile-number"
              type="text"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              placeholder="Enter your mobile number"
              required
            />
          </div>
          <Button type="submit" variant="" className="w-full">
            Send OTP
          </Button>
        </form>
      {error && (
        <div className="text-red-500 text-sm text-center mt-2">{error}</div>
      )}
      <p className="text-center text-sm">
        Already have an account?{" "}
        <a
          href="/"
          className="text-blue-600 hover:underline font-medium"
        >
          Login here
        </a>
      </p>
    </div>

  </div>
  );
}


export default PatientSignUp;
