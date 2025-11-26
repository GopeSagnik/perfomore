// js/config.js
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where, orderBy, deleteDoc, doc, updateDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAFggmW355jdcq4SQcpPvPdr-lAuuG0TL0",
    authDomain: "perfomore-c0bbb.firebaseapp.com",
    projectId: "perfomore-c0bbb",
    storageBucket: "perfomore-c0bbb.firebasestorage.app",
    messagingSenderId: "447844673214",
    appId: "1:447844673214:web:47aa96844774cec54120ef"
};

// Initialize Firebase
let app;
let db;

try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log("Firebase initialized successfully");
} catch (error) {
    console.error("Error initializing Firebase. Make sure you have updated js/config.js with your actual Firebase config keys.", error);
}

// Collection Names
const COLLECTIONS = {
    EMPLOYEES: 'employees',
    DAILY_LOGS: 'daily_logs'
};

// Export Firestore functions for use in other modules
export { db, COLLECTIONS, collection, addDoc, getDocs, query, orderBy, where, doc, updateDoc, getDoc, deleteDoc };