import React, { useState } from 'react';
import { useNavigate  } from 'react-router-dom';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const SigninPage = () => {
  const [mobileNumber, setMobileNumber] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post('http://127.0.0.1:8000/doctor/signup/', { mobile_number: mobileNumber });
      // On success, redirect to OTP verification page
      navigate('/verify-otp', { state: { mobileNumber, type: 'signin' } });
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    }
  };

  return (
    <div className=" py-32 ">

      <div className="max-w-md mx-auto p-6 space-y-4 border border-gray-400 rounded-lg shadow-sm">
        <h2 className="text-3xl py-4 font-semibold text-center">Sign In</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
        
          <div>
            <Label htmlFor="mobile-number" className="block text-1xl py-2 font-medium">
              Mobile Number
            </Label>
            
            <Input
              type="text"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              placeholder="Enter your mobile number"
              required
            />
          </div>
          <br />
        
          <Button type="submit" variant="" className="w-full">
            Send OTP
          </Button>
        </form>
        {error && (
          <div className="text-red-500 text-sm text-center mt-2">{error}</div>
        )}
        <p className="text-center text-sm">
          Don't have an account?{" "}
          <a
            href="/signup"
            className="text-blue-600 hover:underline font-medium"
          >
            Sign up here
          </a>
        </p>
      </div>

    </div>
  );
}

export default SigninPage;

