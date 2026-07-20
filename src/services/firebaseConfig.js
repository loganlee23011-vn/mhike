// Import the functions you need from the SDKs you need
import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBu4mQClR-CPp-s4pIz5D_K76047uzLr-E",
  authDomain: "m-hike-6ccec.firebaseapp.com",
  projectId: "m-hike-6ccec",
  storageBucket: "m-hike-6ccec.firebasestorage.app",
  messagingSenderId: "982543553482",
  appId: "1:982543553482:web:1f6026648d681c3fb27533",
  measurementId: "G-SG4V9BQYB8",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
