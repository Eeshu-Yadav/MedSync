
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AvailableSlots = () => {
  const [slots, setSlots] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = localStorage.getItem("access_token");
    console.log("Auth Token:", accessToken);

    if (!accessToken) {
      console.error("No token found. Redirecting to login.");
      navigate("/home"); // Redirect to login if token is missing
      return;
    }

    axios
      .get("http://127.0.0.1:8000/client/available-slots/", {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then((response) => {
        setSlots(response.data);
      })
      .catch((error) => {
        console.error("API Error:", error.response || error);
        if (error.response?.status === 401) {
          console.error("Invalid or expired token. Redirecting to login.");
          navigate("/");
        } else {
          setError(error.response?.data?.error || "An error occurred");
        }
      });
  }, [navigate]);

  return (
    <div>
      <Card className="w-full max-w-4xl mx-auto mt-8 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-800">Available Slots</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Slot UUID</TableHead>
                <TableHead>Start Time</TableHead>
                <TableHead>End Time</TableHead>
                <TableHead>Max Patients</TableHead>
                <TableHead>Current Patients</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {slots.map((slot) => (
                <TableRow key={slot.uuid}>
                  <TableCell className="font-medium">{slot.uuid}</TableCell>
                  <TableCell>{slot.start_time}</TableCell>
                  <TableCell>{slot.end_time}</TableCell>
                  <TableCell>{slot.max_patients}</TableCell>
                  <TableCell 
                    className={
                      slot.current_patients >= slot.max_patients 
                        ? "text-red-600 font-bold" 
                        : "text-green-600"
                    }
                  >
                    {slot.current_patients}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <p className="text-center mt-5 text-lg">
        Go To Home Page!{" "}
        <a href="/home" className="text-blue-600 hover:underline">
          Home
        </a>
      </p>
  </div>
  );
};

export default AvailableSlots;
