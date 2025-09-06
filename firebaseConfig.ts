import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, initializeAuth } from "firebase/auth";
import { getReactNativePersistence } from "firebase/auth/react-native"; // ✅ correct import
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
    apiKey: "AIzaSyB4OP7mLk8ku3a_6VaHhHhWH9pfU63g_aliE",
    authDomain: "harvesthub-new.firebaseapp.com",
    projectId: "harvesthub-new",
    storageBucket: "harvesthub-new.appspot.com",
    messagingSenderId: "385977587651",
    appId: "1:385977587651:web:dd9b05ee76bf718a418f76",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

// ✅ Use different auth setup depending on environment
let auth;
if (typeof document === "undefined") {
    // Running in React Native
    auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
    });
} else {
    // Running on Web
    auth = getAuth(app);
}

export { app, db, auth };
