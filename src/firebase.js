import { initializeApp } from "firebase/app";
import { getDatabase, ref, push } from "firebase/database";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBMUjYtmb3HvhESX9QFcaFqY4q9Ogd7S7Q",
  authDomain: "speak-n-chat-firebase.firebaseapp.com",
  databaseURL: "https://speak-n-chat-firebase-default-rtdb.firebaseio.com",
  projectId: "speak-n-chat-firebase",
  storageBucket: "speak-n-chat-firebase.appspot.com",
  messagingSenderId: "305738982148",
  appId: "1:305738982148:web:575c2943fbfe4bbfee2651",
  measurementId: "G-70Q96V96H0",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { app, database, ref, push };
