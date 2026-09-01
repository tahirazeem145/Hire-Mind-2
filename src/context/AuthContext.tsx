"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  type User,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider, isFirebaseConfigured } from "@/lib/firebase";

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  role?: string;
  skills?: string[];
  createdAt?: string;
  lastLoginAt?: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isFirebaseConfigured: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_STORAGE_KEY = "hiremind_demo_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync profile data with Firestore
  const syncFirestoreProfile = async (firebaseUser: User, customName?: string) => {
    if (!db) return;

    try {
      const userDocRef = doc(db, "users", firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);

      const profileData: UserProfile = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: customName || firebaseUser.displayName || "HireMind Candidate",
        photoURL: firebaseUser.photoURL || null,
        role: "candidate",
        lastLoginAt: new Date().toISOString(),
      };

      if (!userDoc.exists()) {
        // Create new user profile document in Firestore
        await setDoc(userDocRef, {
          ...profileData,
          createdAt: serverTimestamp(),
          skills: ["React", "TypeScript", "Problem Solving"],
        });
      } else {
        // Update last login timestamp
        await setDoc(userDocRef, { lastLoginAt: serverTimestamp() }, { merge: true });
        const existingData = userDoc.data();
        profileData.role = existingData.role || "candidate";
        profileData.skills = existingData.skills || [];
      }

      setUserProfile(profileData);
    } catch (error) {
      console.error("Firestore user sync error:", error);
      // Fallback local profile if Firestore write fails
      setUserProfile({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: customName || firebaseUser.displayName || "HireMind Candidate",
        photoURL: firebaseUser.photoURL,
        role: "candidate",
      });
    }
  };

  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        setUser(currentUser);
        if (currentUser) {
          await syncFirestoreProfile(currentUser);
        } else {
          setUserProfile(null);
        }
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      // Demo / LocalStorage fallback when Firebase keys are not provided yet
      const savedUser = localStorage.getItem(DEMO_STORAGE_KEY);
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser) as UserProfile;
          setUser({
            uid: parsed.uid,
            email: parsed.email,
            displayName: parsed.displayName,
            photoURL: parsed.photoURL,
          } as unknown as User);
          setUserProfile(parsed);
        } catch {
          localStorage.removeItem(DEMO_STORAGE_KEY);
        }
      }
      setLoading(false);
    }
  }, []);

  const signUp = async (name: string, email: string, password: string) => {
    if (isFirebaseConfigured && auth) {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      await syncFirestoreProfile(userCredential.user, name);
    } else {
      // Demo signup
      const demoProfile: UserProfile = {
        uid: "demo_" + Date.now(),
        email,
        displayName: name,
        photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
        role: "candidate",
        skills: ["AI Prep", "Full Stack", "System Design"],
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(demoProfile));
      setUser({
        uid: demoProfile.uid,
        email: demoProfile.email,
        displayName: demoProfile.displayName,
      } as unknown as User);
      setUserProfile(demoProfile);
    }
  };

  const signIn = async (email: string, password: string) => {
    if (isFirebaseConfigured && auth) {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await syncFirestoreProfile(userCredential.user);
    } else {
      // Demo signin
      const demoProfile: UserProfile = {
        uid: "demo_user_123",
        email,
        displayName: email.split("@")[0] || "Demo User",
        photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
        role: "candidate",
        skills: ["Interview Prep", "Algorithms", "Career Coaching"],
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(demoProfile));
      setUser({
        uid: demoProfile.uid,
        email: demoProfile.email,
        displayName: demoProfile.displayName,
      } as unknown as User);
      setUserProfile(demoProfile);
    }
  };

  const signInWithGoogle = async () => {
    if (isFirebaseConfigured && auth) {
      const userCredential = await signInWithPopup(auth, googleProvider);
      await syncFirestoreProfile(userCredential.user);
    } else {
      // Demo Google login
      const demoProfile: UserProfile = {
        uid: "demo_google_user",
        email: "alex.candidate@gmail.com",
        displayName: "Alex Candidate",
        photoURL: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        role: "candidate",
        skills: ["Frontend", "AI Tools", "Resume Building"],
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(demoProfile));
      setUser({
        uid: demoProfile.uid,
        email: demoProfile.email,
        displayName: demoProfile.displayName,
      } as unknown as User);
      setUserProfile(demoProfile);
    }
  };

  const logout = async () => {
    if (isFirebaseConfigured && auth) {
      await firebaseSignOut(auth);
    }
    localStorage.removeItem(DEMO_STORAGE_KEY);
    setUser(null);
    setUserProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        isFirebaseConfigured,
        signIn,
        signUp,
        signInWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
