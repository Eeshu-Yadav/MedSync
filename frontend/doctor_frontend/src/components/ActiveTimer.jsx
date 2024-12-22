import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';

const ActiveTimer = () => {
  const [slots, setSlots] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Update current time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Fetch active slots initially
    fetchActiveSlots();

    // Set up polling for active slots every 30 seconds
    const pollTimer = setInterval(fetchActiveSlots, 30000);

    return () => {
      clearInterval(timer);
      clearInterval(pollTimer);
    };
  }, []);

  const fetchActiveSlots = async () => {
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) return;

    try {
      const response = await fetch('http://127.0.0.1:8000/doctor/active-slots/', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSlots(data.slots);
      }
    } catch (error) {
      console.error('Error fetching active slots:', error);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata'
    });
  };

  const calculateTimeLeft = (endTime) => {
    const end = new Date(endTime);
    const diff = end - currentTime;
    
    if (diff <= 0) return 'Completed';
    
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getTimerStatus = (slot) => {
    const now = currentTime;
    const start = new Date(slot.start_time);
    const end = new Date(slot.end_time);
    
    if (slot.scheduled_start_time) {
      return 'scheduled';
    } else if (now < end && now >= start) {
      return 'active';
    } else if (now >= end) {
      return 'completed';
    }
    return 'pending';
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Active Timers
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {slots.length === 0 ? (
            <p className="text-center text-gray-500">No active timers</p>
          ) : (
            slots.map((slot) => {
              const status = getTimerStatus(slot);
              return (
                <div 
                  key={slot.uuid} 
                  className="p-4 border rounded-lg bg-white shadow-sm"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium">Slot ID: {slot.uuid}</h3>
                      <p className="text-sm text-gray-600">
                        Duration: {slot.duration} minutes
                      </p>
                    </div>
                    <Badge 
                      className={`
                        ${status === 'active' ? 'bg-green-500' : ''}
                        ${status === 'completed' ? 'bg-gray-500' : ''}
                        ${status === 'scheduled' ? 'bg-blue-500' : ''}
                        ${status === 'pending' ? 'bg-yellow-500' : ''}
                      `}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Start Time:</p>
                      <p>{formatTime(slot.start_time)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">End Time:</p>
                      <p>{formatTime(slot.end_time)}</p>
                    </div>
                    {status === 'active' && (
                      <div className="col-span-2">
                        <p className="text-gray-600">Time Remaining:</p>
                        <p className="text-lg font-semibold">
                          {calculateTimeLeft(slot.end_time)}
                        </p>
                      </div>
                    )}
                    {status === 'scheduled' && (
                      <div className="col-span-2">
                        <p className="text-gray-600">Scheduled For:</p>
                        <p>{formatTime(slot.scheduled_start_time)}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ActiveTimer;