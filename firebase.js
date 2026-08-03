import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAbfjCRvBeBiSXnU9evohqlHGkwXlQmmmk",
  authDomain: "th-heaven-cafe.firebaseapp.com",
  projectId: "th-heaven-cafe",
  storageBucket: "th-heaven-cafe.firebasestorage.app",
  messagingSenderId: "453307852245",
  appId: "1:453307852245:web:3fcf4aa4ce5b682bf5895c"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
