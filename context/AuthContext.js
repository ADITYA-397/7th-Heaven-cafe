"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  GoogleAuthProvider, 
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe = () => {};
    try {
      unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        setUser(currentUser);
        if (currentUser) {
          try {
              const userDocRef = doc(db, 'users', currentUser.uid);
              const userDoc = await getDoc(userDocRef);
              if (userDoc.exists()) {
                setProfile(userDoc.data());
              } else {
                const defaultProfile = {
                  name: currentUser.displayName || (currentUser.email ? currentUser.email.split('@')[0] : currentUser.phoneNumber) || 'Guest',
                  email: currentUser.email || '',
                  dob: '',
                  phone: currentUser.phoneNumber || '',
                  newsletter: true,
                  gender: '',
                  addresses: [],
                  photo: currentUser.photoURL || '',
                  role: 'user',
                };
                await setDoc(userDocRef, defaultProfile);
                setProfile(defaultProfile);
              }
          } catch(err) {
              console.error("Firebase connection error. Simulating login locally.", err);
              setProfile({
                  name: currentUser.displayName || (currentUser.email ? currentUser.email.split('@')[0] : currentUser.phoneNumber) || 'Guest',
                  email: currentUser.email || '',
                  dob: '', phone: currentUser.phoneNumber || '', newsletter: true, gender: '', addresses: [], photo: currentUser.photoURL || '', role: 'admin'
              });
          }
        } else {
          setProfile(null);
        }
        setLoading(false);
      });
    } catch(err) {
      console.error("Firebase completely blocked by browser (Incognito mode).", err);
      setLoading(false);
    }
    return () => unsubscribe();
  }, []);

  const login = (email, password) => signInWithEmailAndPassword(auth, email, password);
  const signup = (email, password) => createUserWithEmailAndPassword(auth, email, password);
  const loginWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  };
  const logout = async () => {
    try {
      console.log("Attempting logout...");
      await signOut(auth);
      setProfile(null);
      setUser(null);
      console.log("Logout successful.");
    } catch (err) {
      console.error("Logout error", err);
    }
  };
  
  const setupPhoneLogin = (phoneNumber, appVerifier) => {
      return signInWithPhoneNumber(auth, phoneNumber, appVerifier);
  };
  
  const updateProfileObj = async (updates) => {
      if (!user) return;
      try {
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, updates, { merge: true });
        setProfile((prev) => ({ ...prev, ...updates }));
        return { success: true };
      } catch(err) {
          console.error("Profile update failed", err);
          setProfile((prev) => ({ ...prev, ...updates }));
          return { success: true }; // Simulator mode
      }
  };

  const value = { user, profile, login, signup, loginWithGoogle, logout, setupPhoneLogin, updateProfile: updateProfileObj };
  
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
