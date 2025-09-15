import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  onSnapshot, 
  getDoc,  // ✅ Now correctly included
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc, 
  writeBatch, 
  addDoc, 
  serverTimestamp, 
  orderBy 
} from 'firebase/firestore'; // ✅ All Firestore imports are now in one place

// ====================================================================
// YOUR FIREBASE CONFIGURATION KEYS
// ====================================================================
const firebaseConfig = {
  apiKey: "AIzaSyApa7az86D7NNwhCGrXcf0wRhRjNUlAWzE",
  authDomain: "multiplayer-chess-c02b9.firebaseapp.com",
  projectId: "multiplayer-chess-c02b9",
  storageBucket: "multiplayer-chess-c02b9.firebasestorage.app",
  messagingSenderId: "396387330623",
  appId: "1:396387330623:web:50e89df9d988b1870a668a",
  measurementId: "G-Q5JG73ZLQG"
};

const appId = "multiplayer-chess-c02b9";
const initialAuthToken = null;
// ====================================================================


// Initialize Firebase App
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Export all the functions and variables for your app to use
export {
  app,
  auth,
  db,
  appId,
  initialAuthToken,
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged,
  collection,
  query,
  onSnapshot,
  where,
  getDoc,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  writeBatch,
  addDoc,
  serverTimestamp,
  orderBy
};