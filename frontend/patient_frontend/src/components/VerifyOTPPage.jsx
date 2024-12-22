import React, { useState,useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import jwtDecode from 'jwt-decode';

const VerifyOTPPage = () => {
    
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { mobileNumber, type } = location.state || {};

  useEffect(() => {
    console.log("Location State:", location.state);
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post('http://127.0.0.1:8000/client/verify_otp/', { mobile_number: mobileNumber, otp });
      // On successful OTP verification, store JWT tokens in localStorage
      const { access_token, refresh_token } = response.data;
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);

      if (type === 'signup') {
        // Redirect to signin page after signup
        navigate('/');
      } else if (type === 'signin') {
        // Redirect to home page after signin
        navigate('/home');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP');
    }
  };
return (
  <div className=" py-32 ">
    <div className="max-w-md mx-auto p-6 space-y-4 border border-gray-400 rounded-lg shadow-sm">
    <h2 className="text-3xl py-4 font-semibold text-center">Verify OTP</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="otp" className="block text-1xl py-2 font-medium">
            One-Time Password (OTP)
          </Label>
          <Input
            id="otp"
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter the OTP"
            required
          />
        </div>
        <Button type="submit" variant="" className="w-auto px-5 mx-32">
          Verify OTP
        </Button>
      </form>
      {error && (
        <div className="text-red-500 text-sm text-center mt-2">{error}</div>
      )}
    </div>
  </div>
);
}

export default VerifyOTPPage;
