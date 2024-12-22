import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// const PatientSignIn = () => {
//   const [mobileNumber, setMobileNumber] = useState("");
//   const [otp, setOtp] = useState("");
//   const [error, setError] = useState("");
//   // const [message, setMessage] = useState("");
//   const navigate = useNavigate();

//   const handleLogin = async () => {
//     // e.preventDefault();
//     try {
//       const response = await axios.post("http://127.0.0.1:8000/client/verify_otp/", {
//         mobile_number: mobileNumber,
//         otp: otp,
//       });
//       if (response.status === 200) {
//         const { redirect_url } = response.data;
//         navigate(redirect_url); // Redirect to the home page
//       }
//       // setMessage(response.data.message);
//       // setError(""); // Reset error if success
//     } catch (err) {
//       setError(err.response?.data?.error || "Something went wrong.");
//       // setMessage(""); // Reset message if error
//     }
//   };

//   return (
//     <div>
//       <h1>Patient Login</h1>
//       {error && <p style={{ color: "red" }}>{error}</p>}
//       <input
//         type="text"
//         placeholder="Mobile Number"
//         value={mobileNumber}
//         onChange={(e) => setMobileNumber(e.target.value)}
//       />
//       <input
//         type="text"
//         placeholder="OTP"
//         value={otp}
//         onChange={(e) => setOtp(e.target.value)}
//       />
//       <button onClick={handleLogin}>Login</button>
//     </div>
//   );
// };

// export default PatientSignIn;


const PatientSignIn = () => {
  const [mobileNumber, setMobileNumber] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post('http://127.0.0.1:8000/client/signup/', { mobile_number: mobileNumber });
      // On success, redirect to OTP verification page
      navigate('/verify-otp', { state: { mobileNumber, type: 'signin' } });
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    }
  };

  return (
    <div className=" py-32 ">

      <div className="max-w-md mx-auto p-6 space-y-4 border border-gray-400 rounded-lg shadow-sm">
        <h2 className="text-3xl py-4 font-semibold text-center">Patient Sign In</h2>
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

export default PatientSignIn;
