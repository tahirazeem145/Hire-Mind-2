import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCh9pM4Lh4xW2IvEIUrwPvx7kqkUGbgSKI",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "hiremind-ai-2f4f1.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "hiremind-ai-2f4f1",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "hiremind-ai-2f4f1.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "281888456703",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:281888456703:web:dcc89f5c6e7be80e8831ca",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-KTD8M18E14",
};

// Check if valid Firebase configuration is provided
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== "your_api_key_here" &&
  firebaseConfig.projectId
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let analytics: Analytics | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);

    // Initialize Analytics if supported in browser environment
    if (typeof window !== "undefined") {
      isSupported().then((supported) => {
        if (supported && app) {
          analytics = getAnalytics(app);
        }
      });
    }
  } catch (error) {
    console.error("Firebase initialization error:", error);
  }
}

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

export { app, auth, db, analytics };
