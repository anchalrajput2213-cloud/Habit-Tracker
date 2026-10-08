import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB9rFhEhTyYDcI6vssSB-c_w3qP1yf7cRg",
  authDomain: "habittracker-981e3.firebaseapp.com",
  projectId: "habittracker-981e3",
  storageBucket: "habittracker-981e3.firebasestorage.app",
  messagingSenderId: "21368705689",
  appId: "1:21368705689:web:3bd448bd399a0c70f49e08",
  measurementId: "G-ZLYQE5N3B2",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firebase Authentication
export const auth = getAuth(app);

// Firestore Database
export const db = getFirestore(app);