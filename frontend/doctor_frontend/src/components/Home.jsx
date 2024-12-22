
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from "@/components/ui/button";




const HomePage = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
      axios.get('http://127.0.0.1:8000/doctor/user/details/', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }).then(response => {
        console.log('User Details:', response.data);
        setUser(response.data);
      }).catch(err => {
        console.error('Error fetching user details', err);
      });
    } else {
      // Redirect to login if no access token
      window.location.href = '/';
    }
  }, []);
  

  
  const handleProfileNavigation = () => {
    if (user && user.uuid) {
      // Navigate to the correct URL
      window.location.href = `/profile/${user.uuid}`;
    // if (user?.uuid) {
    //   navigate(`/profile/${user.uuid}`); // Redirect with the user's UUID
    } else {
      console.error("User UUID is undefined");
    }

    // navigate(`/profile/${user.uuid}`); // Redirect to profile page with user's UUID
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className=" py-32 ">

      
      <div className="max-w-lg mx-auto p-6 space-y-6 text-center border border-gray-200 rounded-lg shadow-sm">
        <h1 className="text-3xl font-bold">Welcome, {user.name}!</h1>
        <p className="text-gray-600">This is the home page.</p>

        {/* Button to navigate to the profile page */}
        <Button
          onClick={handleProfileNavigation}
          variant=""
          className="w-full"
        >
          Go to Profile
        </Button>

        {/* Navigate to the appointment slots page */}
        <Button
          onClick={() => navigate('/appointment-slots')}
          variant="secondary"
          className="w-full"
        >
          Manage Appointments
        </Button>

        {/* Navigate to the timer page */}
        <Button
          onClick={() => navigate('/timer')}
          variant="destructive"
          className="w-full"
        >
          Start Timer
        </Button>
      </div>
    </div>
  );
}

export default HomePage;
