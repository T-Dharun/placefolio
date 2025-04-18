// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCKF6XAurFRRGZYoNq3LnCycy9f-YoTGo8",
  authDomain: "placement-27f66.firebaseapp.com",
  projectId: "placement-27f66",
  storageBucket: "placement-27f66.firebasestorage.app",
  messagingSenderId: "1025076285582",
  appId: "1:1025076285582:web:a5a26523405e216c07f9df"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

export { db };
